import postGoogleSignIn from "@controllers/user/postGoogleSignin";
import postLogOut from "@controllers/user/postLogOut";
import postUpdateGender from "@controllers/user/postUpdateGender";
import postUpdateAppsConnected from "@controllers/user/postUpdateAppsConnected";
import postUpdateRegistrationStep from "@controllers/user/postUpdateRegistrationStep";
import postUpdateLastSyncDate from "@controllers/user/postUpdateLastSyncDate";
import getProfile from "@controllers/user/getProfile";

const user = {
	postGoogleSignIn,
	postLogOut,
	postUpdateAppsConnected,
	postUpdateGender,
	postUpdateRegistrationStep,
	postUpdateLastSyncDate,
	getProfile,
};

export default user;
