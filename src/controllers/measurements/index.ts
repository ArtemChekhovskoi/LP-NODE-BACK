import getList from "@controllers/measurements/getList";
import getEmptyDays from "@controllers/measurements/getEmptyDays";
import postUpdateDailyMood from "@controllers/measurements/postUpdateDailyMood";
import postUpdateDailyPain from "@controllers/measurements/postUpdateDailyPain";
import postUpdateDailyFeeling from "@controllers/measurements/postUpdateDailyFeeling";
import postUpdateAppleHealth from "@controllers/measurements/postUpdateAppleHealth";

const measurements = {
  getList,
  getEmptyDays,
  postUpdateDailyMood,
  postUpdateDailyPain,
  postUpdateDailyFeeling,
  postUpdateAppleHealth,
};

export default measurements;
