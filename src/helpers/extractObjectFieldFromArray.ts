const extractObjectFieldFromArray = (
  object: Record<string, unknown>[],
  field: string,
) => {
  const index = object.findIndex((obj) =>
    Object.prototype.hasOwnProperty.call(obj, field),
  );

  if (!index || index === -1) {
    return undefined;
  }
  const extractedField = object[index][field];
  object.splice(index, 1);

  return extractedField;
};

export default extractObjectFieldFromArray;
