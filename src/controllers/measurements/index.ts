import getList from "@controllers/measurements/getList";
import postUpdateDailyMood from "@controllers/measurements/postUpdateDailyMood";
import postUpdateDailyPain from "@controllers/measurements/postUpdateDailyPain";
import postUpdateDailyFeeling from "@controllers/measurements/postUpdateDailyFeeling";
import postUpdateAppleHealth from "@controllers/measurements/postUpdateAppleHealth";
import postUpdateDailyWeather from "@controllers/measurements/postUpdateDailyWeather";

const measurements = {
  getList,
  postUpdateDailyMood,
  postUpdateDailyPain,
  postUpdateDailyFeeling,
  postUpdateAppleHealth,
  postUpdateDailyWeather,
};

export default measurements;
