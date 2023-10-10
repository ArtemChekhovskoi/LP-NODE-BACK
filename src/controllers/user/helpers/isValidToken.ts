import config from "@config/index";

const invalidHeaderCharRegex = /[^\t\u0020-\u007E\u0080-\u00FF]/;

const validateValue = (value: string) =>
  !invalidHeaderCharRegex.test(`${value}`);
const isValidToken = (token: string) => {
  const { minTokenLength } = config.auth;
  const { maxTokenLength } = config.auth;
  const isValid =
    typeof token === "string" &&
    token.length > minTokenLength &&
    token.length < maxTokenLength &&
    validateValue(token);
  return isValid;
};

export { isValidToken };
