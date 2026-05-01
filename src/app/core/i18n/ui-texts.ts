import { deTexts } from './de';
import { enTexts } from './en';
import { trTexts } from './tr';

export const uiTexts = {
  de: deTexts,
  en: enTexts,
  tr: trTexts,
} as const;

export type UiLanguage = keyof typeof uiTexts;
export type UiTextKey = keyof typeof enTexts;
