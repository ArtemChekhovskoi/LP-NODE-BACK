import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Users } from "@models/users";
import validateUserUpdate from "@controllers/user/helpers/validateUserUpdate";

export type UserGender = "male" | "female" | "other";
export type DataTrackingType = "manual" | "automatic";
export interface IUserProfile {
  name?: unknown;
  email?: unknown;
  gender?: unknown;
  location?: unknown;
  appsConnected?: unknown;
  dataTrackingType?: unknown;
}
type UserProfileKeys = keyof IUserProfile;
const UserProfileKeysArray: UserProfileKeys[] = [
  "name",
  "email",
  "gender",
  "location",
  "appsConnected",
  "dataTrackingType",
];
export const APPS_CONNECTED = ["appleHealth", "googleFit"];
export const USERS_GENDER = ["male", "female", "other"];
export const DATA_TRACKING_TYPE = ["manual", "automatic"];
const postUpdateProfile = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      responseJSON.error = "Missing body in request";
      responseJSON.errorCode = "MISSING_BODY";
      return res.status(400).json(responseJSON);
    }

    const isBodyIncludeUserProfileKeys = Object.keys(req.body).every((key) =>
      UserProfileKeysArray.includes(key as UserProfileKeys),
    );
    if (!isBodyIncludeUserProfileKeys) {
      responseJSON.error = `Body should include one of ${UserProfileKeysArray.join()}`;
      responseJSON.errorCode = "INVALID_BODY";
      return res.status(400).json(responseJSON);
    }

    const { error, errorCode } = validateUserUpdate(req.body, res);
    if (error) {
      responseJSON.error = error;
      responseJSON.errorCode = errorCode;
      return res.status(400).json(responseJSON);
    }

    await Users.updateOne({ _id: req.usersID }, req.body);

    responseJSON.success = true;
    return res.json(responseJSON);
  } catch (e) {
    logger.error(`Error at controllers/user/postUpdateProfile: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default postUpdateProfile;
