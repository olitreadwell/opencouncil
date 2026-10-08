import { pluralCategoriesForLocale, pluralCategoryIssues } from '../pluralCategories';
import type { MessageFormatElement } from '@formatjs/icu-messageformat-parser';

/** Build a @formatjs `plural` AST element for a set of option keys. */
const plural = (value: string, options: Record<string, unknown>): MessageFormatElement =>
    ({
        type: 6, // TYPE.plural
        value,
        options: Object.fromEntries(Object.keys(options).map((k) => [k, { value: [] }])),
        offset: 0,
    }) as unknown as MessageFormatElement;

describe('pluralCategoriesForLocale', () => {
    it('Serbian needs one/few/other', () => {
        expect(pluralCategoriesForLocale('sr')).toEqual(['few', 'one', 'other']);
    });
    it('English, Greek and French only need one/other for realistic counts', () => {
        for (const locale of ['en', 'el', 'fr']) expect(pluralCategoriesForLocale(locale)).toEqual(['one', 'other']);
    });
});

describe('pluralCategoryIssues', () => {
    it('accepts a Serbian plural with one/few/other', () => {
        expect(pluralCategoryIssues([plural('count', { one: {}, few: {}, other: {} })], 'sr')).toEqual([]);
    });
    it('rejects a Serbian plural that omits few', () => {
        expect(pluralCategoryIssues([plural('count', { one: {}, other: {} })], 'sr')).toEqual([
            { argument: 'count', missing: ['few'], invalid: [] },
        ]);
    });
    it('rejects a Greek plural that carries a spurious few', () => {
        expect(pluralCategoryIssues([plural('count', { one: {}, few: {}, other: {} })], 'el')).toEqual([
            { argument: 'count', missing: [], invalid: ['few'] },
        ]);
    });
    it('rejects a French plural that carries a few (few is not a French category)', () => {
        expect(pluralCategoryIssues([plural('count', { one: {}, few: {}, other: {} })], 'fr')).toEqual([
            { argument: 'count', missing: [], invalid: ['few'] },
        ]);
    });
    it('accepts an explicit =1 as covering the one category', () => {
        expect(pluralCategoryIssues([plural('count', { '=1': {}, other: {} })], 'en')).toEqual([]);
    });
    it('accepts =1 for the Serbian singular while still requiring few and other', () => {
        expect(pluralCategoryIssues([plural('count', { '=1': {}, few: {}, other: {} })], 'sr')).toEqual([]);
    });
    it('still flags a Serbian plural missing few when the singular is explicit', () => {
        expect(pluralCategoryIssues([plural('count', { '=1': {}, other: {} })], 'sr')).toEqual([
            { argument: 'count', missing: ['few'], invalid: [] },
        ]);
    });
    it('flags a plural without the required other default', () => {
        expect(pluralCategoryIssues([plural('count', { one: {}, few: {} })], 'sr')).toEqual([
            { argument: 'count', missing: ['other'], invalid: [] },
        ]);
    });
    it('finds plurals nested inside select options', () => {
        const wrapped: MessageFormatElement = {
            type: 5, // TYPE.select
            value: 'gender',
            options: {
                one: { value: [plural('count', { one: {}, other: {} })] } as unknown as never,
                other: { value: [] } as unknown as never,
            },
        } as unknown as MessageFormatElement;
        // The nested Serbian plural { one, other } is missing few.
        expect(pluralCategoryIssues([wrapped], 'sr')).toEqual([
            { argument: 'count', missing: ['few'], invalid: [] },
        ]);
    });
});
