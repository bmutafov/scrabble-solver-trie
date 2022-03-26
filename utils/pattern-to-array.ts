export const patternToArray = (pattern: string): string[] => {
  const res: string[] = [];

  let isGroup = false;
  let letterI = -1;

  for (let i = 0; i < pattern.length; i++) {
    const curr = pattern.charAt(i);
    if (curr === "*") {
      letterI++;
      res[letterI] = "*";
      continue;
    }

    if (isGroup) {
      if (curr === ")") {
        isGroup = false;
        continue;
      }

      res[letterI] = res[letterI] ? res[letterI] + curr : curr;
    }

    if (!isGroup) {
      if (curr === "(") {
        letterI++;
        console.log(curr, letterI);
        isGroup = true;
        continue;
      }

      letterI++;
      res[letterI] = curr;
    }
  }

  return res;
};
