import { enFeedbackTexts } from './en/feedback.en';
import { enHeaderTexts } from './en/header.en';

export const enTexts = {
  ...enFeedbackTexts,
  ...enHeaderTexts,
} as const;
