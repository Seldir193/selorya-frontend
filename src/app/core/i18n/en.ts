import { enFeedbackTexts } from './en/feedback.en';
import { enHeaderTexts } from './en/header.en';
import { enLoginTexts } from './en/login.en';
import { enSignupTexts } from './en/signup.en';

export const enTexts = {
  ...enFeedbackTexts,
  ...enHeaderTexts,
  ...enLoginTexts,
  ...enSignupTexts,
} as const;
