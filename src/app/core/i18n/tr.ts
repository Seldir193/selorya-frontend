import { trFeedbackTexts } from './tr/feedback.tr';
import { trHeaderTexts } from './tr/header.tr';

export const trTexts = {
  ...trFeedbackTexts,
  ...trHeaderTexts,
} as const;
