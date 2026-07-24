import { describe, expect, it } from 'vitest';
import { deReturnTexts } from './de/returns.de';
import { enReturnTexts } from './en/returns.en';
import { trReturnTexts } from './tr/returns.tr';

describe('return translations', () => {
  it('keeps DE, EN and TR keys aligned', () => {
    const expected = Object.keys(enReturnTexts).sort();
    expect(Object.keys(deReturnTexts).sort()).toEqual(expected);
    expect(Object.keys(trReturnTexts).sort()).toEqual(expected);
  });
});
