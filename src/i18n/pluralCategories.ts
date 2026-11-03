/**
 * ICU plural-category helpers for the catalog validator. Pure logic — no
 * runtime parser dependency. `scripts/validate-sr-catalogs.ts` parses ICU with
 * tsx and passes the ASTs in.
 */
import type { MessageFormatElement, PluralElement } from '@formatjs/icu-messageformat-parser';

const PLURAL_TYPE = 6; // @formatjs TYPE.plural

const toArray = <T,>(v: ReadonlySet<T>): T[] => [...v].sort();

/** Categories a locale actually exercises for integer counts 0..999. */
export function pluralCategoriesForLocale(locale: string): string[] {
    const rules = new Intl.PluralRules(locale);
    const seen = new Set<string>();
    for (let n = 0; n <= 999; n++) seen.add(rules.select(n));
    return toArray(seen);
}

/** Every plural category the locale can produce, regardless of these messages. */
export function validPluralCategories(locale: string): string[] {
    return new Intl.PluralRules(locale).resolvedOptions().pluralCategories;
}

export interface PluralCategoryIssue {
    argument: string;
    missing: string[];
    invalid: string[];
}

/**
 * Validate every `plural` argument in an ICU AST against the locale: named
 * branches must be real categories, and every category the locale needs for
 * realistic counts must be covered by a named branch or an explicit `=N` form.
 */
export function pluralCategoryIssues(ast: MessageFormatElement[], locale: string): PluralCategoryIssue[] {
    const rules = new Intl.PluralRules(locale);
    const valid = new Set(validPluralCategories(locale));
    const required = pluralCategoriesForLocale(locale);
    const issues: PluralCategoryIssue[] = [];

    const walk = (els: MessageFormatElement[]) => {
        for (const el of els) {
            if (el.type === PLURAL_TYPE) {
                const plural = el as unknown as PluralElement;
                const named: string[] = [];
                const explicit: string[] = [];
                for (const key of Object.keys(plural.options)) (key.startsWith('=') ? explicit : named).push(key);

                const invalid = named.filter((c) => !valid.has(c));
                const covered = new Set(named);
                for (const key of explicit) {
                    const n = Number(key.slice(1));
                    if (!Number.isNaN(n)) covered.add(rules.select(n));
                }
                const missing = required.filter((c) => !covered.has(c));

                if (invalid.length > 0 || missing.length > 0) {
                    issues.push({ argument: plural.value, missing: toArray(new Set(missing)), invalid: toArray(new Set(invalid)) });
                }
            }
            if ('options' in el && el.options) for (const v of Object.values(el.options)) walk(v.value);
            if ('children' in el && el.children) walk(el.children);
        }
    };

    walk(ast);
    return issues;
}
