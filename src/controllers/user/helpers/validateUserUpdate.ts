import { Response } from "express";
import { logger } from "@logger/index";
import {
  APPS_CONNECTED,
  DATA_TRACKING_TYPE,
  IUserProfile,
  USERS_GENDER,
} from "@controllers/user/postUpdateProfile";

const validateUserUpdate = (body: IUserProfile, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  const { name, email, appsConnected, gender, dataTrackingType, location } =
    body;
  try {
      if (!name || !email || !appsConnected || !gender || !dataTrackingType || !location) {

      }

    if (name && (typeof name !== "string" || name.length === 0)) {
      responseJSON.error = "Name must be string";
      responseJSON.errorCode = "INVALID_PARAMETER";
    }

    if (email && (typeof email !== "string" || email.length === 0)) {
      responseJSON.error = "Email must be string";
      responseJSON.errorCode = "INVALID_PARAMETER";
    }

    if (appsConnected) {
      if (Array.isArray(appsConnected)) {
        if (
          appsConnected.every(
            (element) =>
              typeof element === "string" && !APPS_CONNECTED.includes(element),
          )
        ) {
          responseJSON.error = `Apps connected must be array of ${APPS_CONNECTED.join()}`;
          responseJSON.errorCode = "INVALID_PARAMETER";
        }
      } else {
        responseJSON.error = "Apps connected must be array";
        responseJSON.errorCode = "INVALID_PARAMETER";
      }
    }

    if (gender) {
      if (typeof gender !== "string" || !USERS_GENDER.includes(gender)) {
        responseJSON.error = `Gender must be one of ${USERS_GENDER.join()}`;
        responseJSON.errorCode = "INVALID_PARAMETER";
      }
    }

    if (dataTrackingType) {
      if (
        typeof dataTrackingType !== "string" ||
        DATA_TRACKING_TYPE.includes(dataTrackingType)
      ) {
        responseJSON.error = "Data tracking type must be string";
        responseJSON.errorCode = "INVALID_PARAMETER";
      }
    }
      console.log(!!location);
    if (location && typeof location === "string") {
    }
    if (location && (typeof location !== "string" || location.length === 0)) {
      responseJSON.error = "Location must be string";
      responseJSON.errorCode = "INVALID_PARAMETER";
    }
    return responseJSON;
  } catch (e) {
    logger.error(`Error at validateUserUpdate: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return responseJSON;
  }
};

export default validateUserUpdate;
