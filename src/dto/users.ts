import * as yup from "yup";
import { REGISTRATION_STEPS, USERS_GENDER } from "@constants/user";
import { dateValidation } from "./commonMethods";

const postGoogleSignInSchema = yup.object({
	token: yup.string().required(),
});

const postUpdateAppsConnectedSchema = yup.object({
	appsConnected: yup.array().of(yup.string()).required(),
});

const postUpdateGenderSchema = yup.object({
	gender: yup.string().oneOf(USERS_GENDER).required(),
});

const postUpdateLastSyncDateSchema = yup.object({
	lastSyncDate: dateValidation().required(),
});

const postUpdateLocationSchema = yup.object({
	long: yup.number().required(),
	lat: yup.number().required(),
});

const postUpdateRegistrationStepSchema = yup.object({
	registrationStep: yup.string().oneOf(REGISTRATION_STEPS).required(),
});

export {
	postGoogleSignInSchema,
	postUpdateAppsConnectedSchema,
	postUpdateLocationSchema,
	postUpdateLastSyncDateSchema,
	postUpdateRegistrationStepSchema,
	postUpdateGenderSchema,
};
