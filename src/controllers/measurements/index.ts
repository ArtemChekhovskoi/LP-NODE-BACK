import getMeasurementsList from "@controllers/measurements/getMeasurementsList";
import getDailyMeasurements from "@controllers/measurements/getDailyMeasurements";
import getBalanceEggConfig from "@controllers/measurements/getBalanceEggConfig";
import postUpdateDailyWeather from "@controllers/measurements/postUpdateDailyWeather";
import postSaveMorningReflection from "@controllers/measurements/saveMorningReflection";
import postSaveEveningReflection from "@controllers/measurements/saveEveningReflection";
import getDailyHeartRateDependencies from "@controllers/measurements/getDailyHeartRateDependencies";
import postSaveDailyNote from "@controllers/measurements/saveDailyNote";
import appleHealth from "@controllers/measurements/appleHealth";

const measurements = {
	getMeasurementsList,
	getBalanceEggConfig,
	getDailyMeasurements,
	postUpdateDailyWeather,
	postSaveMorningReflection,
	postSaveEveningReflection,
	postSaveDailyNote,
	getDailyHeartRateDependencies,
	appleHealth,
};

export default measurements;
