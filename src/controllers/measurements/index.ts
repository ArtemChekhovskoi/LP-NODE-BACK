import getMeasurementsList from "@controllers/measurements/getMeasurementsList";
// import postUpdateDailyEmotions from "@controllers/measurements/postUpdateDailyEmotions";
import getBalanceEggConfig from "@controllers/measurements/getBalanceEggConfig";
import postUpdateAppleHealth from "@controllers/measurements/postUpdateAppleHealth";
import postUpdateDailyWeather from "@controllers/measurements/postUpdateDailyWeather";
import postUpdateDailyNotes from "@controllers/measurements/postUpdateDailyNotes";

const measurements = {
  getMeasurementsList,
  // postUpdateDailyEmotions,
  getBalanceEggConfig,
  postUpdateAppleHealth,
  postUpdateDailyWeather,
  postUpdateDailyNotes,
};

export default measurements;
