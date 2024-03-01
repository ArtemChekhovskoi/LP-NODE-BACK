import getMeasurementsList from "@controllers/measurements/getMeasurementsList";
import getDailyMeasurements from "@controllers/measurements/getDailyMeasurements";
import postUpdateDailyEmotions from "@controllers/measurements/postUpdateDailyEmotions";
import getBalanceEggConfig from "@controllers/measurements/getBalanceEggConfig";
import postUpdateDailyWeather from "@controllers/measurements/postUpdateDailyWeather";
import postUpdateDailyNotes from "@controllers/measurements/postUpdateDailyNotes";
import postSaveMorningReflection from "@controllers/measurements/saveMorningReflection";
import postSaveEveningReflection from "@controllers/measurements/saveEveningReflection";
import getDailyHeartRateDependencies from "@controllers/measurements/getDailyHeartRateDependencies";
import appleHealth from "@controllers/measurements/appleHealth";

const measurements = {
	getMeasurementsList,
	getBalanceEggConfig,
	getDailyMeasurements,
	postUpdateDailyEmotions,
	postUpdateDailyWeather,
	postUpdateDailyNotes,
	postSaveMorningReflection,
	postSaveEveningReflection,
	getDailyHeartRateDependencies,
	appleHealth,
};

export default measurements;
