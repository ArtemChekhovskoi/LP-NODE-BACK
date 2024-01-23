import postUpdateHeight from "@controllers/measurements/appleHealth//postUpdateHeight";
import postUpdateWeight from "@controllers/measurements/appleHealth/postUpdateWeight";
import postUpdateSleep from "@controllers/measurements/appleHealth/postUpdateSleep";
import postUpdateHeartRate from "@controllers/measurements/appleHealth/postUpdateHeartRate";
import postUpdateWalkingRunningDistance from "@controllers/measurements/appleHealth/postUpdateWalkingRunningDistance";
import postUpdateSteps from "@controllers/measurements/appleHealth/postUpdateSteps";

const appleHealth = {
	postUpdateHeight,
	postUpdateWeight,
	postUpdateSleep,
	postUpdateHeartRate,
	postUpdateWalkingRunningDistance,
	postUpdateSteps,
};
export default appleHealth;
