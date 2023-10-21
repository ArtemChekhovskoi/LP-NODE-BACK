interface IUserProfile {
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
const APPS_CONNECTED = ["appleHealth", "googleFit"];
const USERS_GENDER = ["male", "female", "other"];
const DATA_TRACKING_TYPE = ["manual", "automatic"];
const REGISTRATION_STEPS = [
  "new",
  "gender",
  "connectApp",
  "location",
  "complete",
];
export {
  UserProfileKeysArray,
  APPS_CONNECTED,
  USERS_GENDER,
  DATA_TRACKING_TYPE,
  REGISTRATION_STEPS,
};
