export function removeFirstMatch<T>(array: T[], remove: T) {
  const removeAtIndex = array.indexOf(remove);
  const arrayWithoutRemoved = array.filter((_, i) => i !== removeAtIndex);
  return arrayWithoutRemoved;
}

export function removeFirstElement<T>(array: T[]) {
  const [removed, ...rest] = array;
  return rest;
}
