import { deFeedbackTexts } from './de/feedback.de';
import { deHeaderTexts } from './de/header.de';

export const deTexts = {
  ...deFeedbackTexts,
  ...deHeaderTexts,
} as const;
