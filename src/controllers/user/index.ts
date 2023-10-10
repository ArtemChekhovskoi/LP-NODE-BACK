import postGoogleSignIn from "@controllers/user/postGoogleSignin";
import postLogOut from "@controllers/user/postLogOut";
import postUpdateProfile from "@controllers/user/postUpdateProfile";
import postUpdateGender from "@controllers/user/postUpdateGender";
import postUpdateLocation from "@controllers/user/postUpdateLocation";
import postUpdateAppsConnected from "@controllers/user/postUpdateAppsConnected";

const user = {
  postGoogleSignIn,
  postLogOut,
  postUpdateProfile,
  postUpdateLocation,
  postUpdateAppsConnected,
  postUpdateGender,
};

export default user;
