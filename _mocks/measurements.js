const measurements = {
  data: [
    {
      name: "Weight",
      code: "weight",
      unit: "kg",
      precision: 2,
      isUsedOnMainScreen: false,
      type: "auto",
      active: true,
    },
    {
      name: "Height",
      code: "height",
      unit: "cm",
      precision: 2,
      isUsedOnMainScreen: false,
      type: "auto",
      active: true,
    },
    {
      name: "Heart Rate Sample",
      code: "heartRate",
      unit: "bpm",
      precision: 0,
      isUsedOnMainScreen: true,
      type: "auto",
      active: true,
    },
    {
      name: "Steps",
      code: "steps",
      unit: "steps",
      precision: 0,
      isUsedOnMainScreen: false,
      type: "auto",
      active: true,
    },
    {
      name: "Walking Running Distance",
      code: "walkingRunningDistance",
      unit: "km",
      precision: 2,
      isUsedOnMainScreen: false,
      type: "auto",
      active: true,
    },
    {
      name: "Sleep",
      code: "sleep",
      unit: "minutes",
      precision: 0,
      isUsedOnMainScreen: false,
      type: "custom",
      active: true,
    },
    {
      name: "Activity",
      code: "activity",
      unit: "minutes",
      precision: 0,
      isUsedOnMainScreen: true,
      type: "custom",
      active: true,
    },
  ],
  name: "measurements",
};

module.exports = measurements;