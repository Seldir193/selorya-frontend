import { trFeedbackTexts } from './tr/feedback.tr';
import { trHeaderTexts } from './tr/header.tr';
import { trLoginTexts } from './tr/login.tr';
import { trSignupTexts } from './tr/signup.tr';

export const trTexts = {
  ...trFeedbackTexts,
  ...trHeaderTexts,
  ...trLoginTexts,
  ...trSignupTexts,
} as const;
