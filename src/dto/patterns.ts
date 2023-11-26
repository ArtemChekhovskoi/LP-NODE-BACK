import * as yup from "yup";
import { DATA_PRESENTATION_ARRAY } from "@constants/patterns";
import { dateValidation } from "./commonMethods";

const getPatternsListSchema = yup.object({
  measurements: yup.string().required(),
  presentation: yup.string().oneOf(DATA_PRESENTATION_ARRAY).required(),
  startDate: dateValidation().required(),
  endDate: dateValidation().required(),
});

export { getPatternsListSchema };
