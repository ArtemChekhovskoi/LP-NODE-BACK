import getMeasurementsList from "@controllers/measurements/getMeasurementsList";
import getDailyMeasurements from "@controllers/measurements/getDailyMeasurements";
import postUpdateDailyEmotions from "@controllers/measurements/postUpdateDailyEmotions";
import getBalanceEggConfig from "@controllers/measurements/getBalanceEggConfig";
import postUpdateDailyWeather from "@controllers/measurements/postUpdateDailyWeather";
import postUpdateDailyNotes from "@controllers/measurements/postUpdateDailyNotes";
import appleHealth from "@controllers/measurements/appleHealth";

const measurements = {
	getMeasurementsList,
	getBalanceEggConfig,
	getDailyMeasurements,
	postUpdateDailyEmotions,
	postUpdateDailyWeather,
	postUpdateDailyNotes,
	appleHealth,
};

export default measurements;
