import postGoogleSignIn from "@controllers/user/postGoogleSignin";
import postLogOut from "@controllers/user/postLogOut";
import postUpdateGender from "@controllers/user/postUpdateGender";
import postUpdateAppsConnected from "@controllers/user/postUpdateAppsConnected";
import postUpdateRegistrationStep from "@controllers/user/postUpdateRegistrationStep";
import postUpdateLastSyncDate from "@controllers/user/postUpdateLastSyncDate";
import postSavePushToken from "@controllers/user/postSavePushToken";
import postUpdatePushSubscriptions from "@controllers/user/postUpdatePushSubscriptions";
import getProfile from "@controllers/user/getProfile";
import getSyncStatus from "@controllers/user/getSyncStatus";

const user = {
	postGoogleSignIn,
	postLogOut,
	postUpdateAppsConnected,
	postUpdateGender,
	postUpdateRegistrationStep,
	postUpdateLastSyncDate,
	postSavePushToken,
	postUpdatePushSubscriptions,
	getProfile,
	getSyncStatus,
};

export default user;
