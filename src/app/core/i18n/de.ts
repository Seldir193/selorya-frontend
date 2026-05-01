import { deFeedbackTexts } from './de/feedback.de';
import { deHeaderTexts } from './de/header.de';
import { deLoginTexts } from './de/login.de';
import { deSignupTexts } from './de/signup.de';

export const deTexts = {
  ...deFeedbackTexts,
  ...deHeaderTexts,
  ...deLoginTexts,
  ...deSignupTexts,
} as const;
