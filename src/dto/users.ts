import * as yup from "yup";
import { REGISTRATION_STEPS, USERS_GENDER } from "@constants/user";

const postGoogleSignInSchema = yup.object({
  token: yup.string().required(),
});

const postUpdateAppsConnectedSchema = yup.object({
  appsConnected: yup.array().of(yup.string()).required(),
});

const postUpdateGenderSchema = yup.object({
  gender: yup.string().oneOf(USERS_GENDER).required(),
});

const postUpdateLocationSchema = yup.object({
  location: yup.string().required(),
});

const postUpdateRegistrationStepSchema = yup.object({
  registrationStep: yup.string().oneOf(REGISTRATION_STEPS).required(),
});

export {
  postGoogleSignInSchema,
  postUpdateAppsConnectedSchema,
  postUpdateLocationSchema,
  postUpdateRegistrationStepSchema,
  postUpdateGenderSchema,
};
