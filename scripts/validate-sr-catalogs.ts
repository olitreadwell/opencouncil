/**
 * Validates the message catalogs:
 *
 * 1. Serbian catalogs against the English source: every message must (a) parse
 *    as ICU MessageFormat and (b) use exactly the argument set of its English
 *    counterpart — failure modes machine translation can introduce.
 * 2. Plural categories per locale (issue #597): every `plural` argument in the
 *    en/el/fr/sr catalogs must use only real categories for that locale, and
 *    cover every category it needs for realistic counts (explicit `=N` forms
 *    count as independent coverage). Greek/French need one/other; Serbian
 *    needs one/few/other.
 *
 * Exits non-zero with a per-message report. Only the Cyrillic source is
 * checked for parity: sr-Latn is derived from it at load time by an ICU-safe
 * transform (src/lib/serbian/catalog.ts).
 *
 * Run directly (`npx tsx scripts/validate-sr-catalogs.ts`) or via the jest
 * wrapper in src/lib/__tests__/sr-latn-catalog.test.ts (the parser is
 * ESM-only, which jest's CJS sandbox can't import — tsx can).
 */
import fs from 'fs';
import path from 'path';
import { parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';
import { pluralCategoryIssues } from '../src/i18n/pluralCategories';

const messagesDir = path.join(__dirname, '..', 'messages');

const readJson = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));

function flatten(value: unknown, prefix: string, out: Map<string, string>): Map<string, string> {
    if (typeof value === 'string') out.set(prefix, value);
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [k, v] of Object.entries(value)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
    return out;
}

function argsOf(ast: MessageFormatElement[], set = new Set<string>()): Set<string> {
    for (const el of ast) {
        if ('value' in el && el.type !== 0 && typeof el.value === 'string') set.add(el.value);
        if ('options' in el && el.options) {
            for (const opt of Object.values(el.options)) argsOf(opt.value, set);
        }
        if ('children' in el && el.children) argsOf(el.children, set);
    }
    return set;
}

const modularFiles = fs
    .readdirSync(path.join(messagesDir, 'sr'))
    .filter((f) => f.endsWith('.json'))
    .sort();

const filePairs: Array<[string, string]> = [
    ['en.json', 'sr.json'],
    ...modularFiles.map((f): [string, string] => [path.join('en', f), path.join('sr', f)]),
];

const errors: string[] = [];
let checked = 0;

for (const [enFile, srFile] of filePairs) {
    const en = flatten(readJson(path.join(messagesDir, enFile)), '', new Map());
    const sr = flatten(readJson(path.join(messagesDir, srFile)), '', new Map());
    for (const [key, msg] of sr) {
        checked++;
        let srAst: MessageFormatElement[];
        try {
            srAst = parse(msg, { requiresOtherClause: false });
        } catch (e) {
            errors.push(`${srFile} → ${key}: invalid ICU — ${(e as Error).message}`);
            continue;
        }
        const enMsg = en.get(key);
        if (enMsg === undefined) continue; // key parity is covered by translations.test.ts
        const enArgs = [...argsOf(parse(enMsg, { requiresOtherClause: false }))].sort().join(',');
        const srArgs = [...argsOf(srAst)].sort().join(',');
        if (enArgs !== srArgs) {
            errors.push(`${srFile} → ${key}: arguments [${srArgs}] != en [${enArgs}]`);
        }
    }
}

// Plural categories per locale (issue #597). The catalogs are modular; gather
// each locale's top-level file plus its module dir, if present.
const locales = ['en', 'el', 'fr', 'sr'];

for (const locale of locales) {
    const files: string[] = [];
    if (fs.existsSync(path.join(messagesDir, `${locale}.json`))) files.push(`${locale}.json`);
    const dir = path.join(messagesDir, locale);
    if (fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) files.push(path.join(locale, f));
    }
    for (const file of files) {
        const messages = flatten(readJson(path.join(messagesDir, file)), '', new Map());
        for (const [key, msg] of messages) {
            let ast: MessageFormatElement[];
            try {
                ast = parse(msg, { requiresOtherClause: false });
            } catch (e) {
                continue; // parity pass above already reported unparseable Serbian; other locales are parse-checked elsewhere
            }
            for (const issue of pluralCategoryIssues(ast, locale)) {
                const parts: string[] = [];
                if (issue.missing.length > 0) parts.push(`missing [${issue.missing.join(', ')}]`);
                if (issue.invalid.length > 0) parts.push(`invalid [${issue.invalid.join(', ')}]`);
                errors.push(`${file} → ${key}: plural '${issue.argument}' ${parts.join('; ')}`);
            }
        }
    }
}

if (errors.length > 0) {
    console.error(errors.join('\n'));
    console.error(`\n${errors.length} problem(s) in ${checked} Serbian messages (parity + plural categories)`);
    process.exit(1);
}
console.log(`OK: ${checked} Serbian messages parse as ICU and match English argument sets`);
console.log('OK: en/el/fr/sr plural categories are valid and complete per locale');
