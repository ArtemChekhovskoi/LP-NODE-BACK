const measurements = {
  data: [
    {
      name: "Weight",
      code: "weight",
      unit: "kg",
      type: "auto",
      active: true,
    },
    {
      name: "Height",
      code: "height",
      unit: "cm",
      type: "auto",
      active: true,
    },
    {
      name: "Heart Rate Sample",
      code: "heartRate",
      unit: "bpm",
      type: "auto",
      active: true,
    },
    {
      name: "Steps",
      code: "steps",
      unit: "steps",
      type: "auto",
      active: true,
    },
    {
      name: "Walking Running Distance",
      code: "walkingRunningDistance",
      unit: "km",
      type: "auto",
      active: true,
    },
    {
      name: "Mood",
      code: "mood",
      unit: "",
      type: "custom",
      customFields: ["mood", "moodLevel"],
      active: true,
    },
    {
      name: "Pain",
      code: "pain",
      unit: "",
      type: "custom",
      customFields: ["isPainful", "painLocation"],
      active: true,
    },
    {
      name: "Feelings",
      code: "feelings",
      unit: "",
      type: "custom",
      customFields: ["feelings"],
      active: true,
    },
  ],
  name: "measurements",
};

module.exports = measurements;
