import * as yup from "yup";

const dateValidation = (message = "Invalid date") =>
  yup.string().test("is-date", message, (value) => {
    if (!value) return true;

    return !Number.isNaN(new Date(value).getTime());
  });

export { dateValidation };
