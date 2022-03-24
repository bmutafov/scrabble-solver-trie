export const snooze = (ms: number) =>
  new Promise((resolve) => setTimeout(() => resolve(0), ms));
