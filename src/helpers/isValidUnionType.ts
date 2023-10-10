export function isValidUnionType(
  stringToCheck: string,
  arrayOfUnionStrings: readonly string[],
): boolean {
  const isUnionType = arrayOfUnionStrings
    .find((validName) => validName === stringToCheck);
  return !!isUnionType;
}
