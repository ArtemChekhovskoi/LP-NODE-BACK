const MEASUREMENT_SOURCES = {
	APPLE_HEALTH: "appleHealth",
	GOOGLE_FIT: "googleFit",
};

const SLEEP_VALUES = {
	ASLEEP: "ASLEEP",
	AWAKE: "AWAKE",
	IN_BED: "IN_BED",
};

const IN_SLEEP_VALUES = {
	REM: "REM",
	DEEP: "DEEP",
	CORE: "CORE",
} as const;

const IN_SLEEP_VALUES_ARRAY = Object.values(IN_SLEEP_VALUES);

const RAW_MEASUREMENT_CODES = {
	SLEEP: "sleep",
	ACTIVITY: "activity",
	HEIGHT: "height",
	WEIGHT: "weight",
	STEPS: "steps",
	HEART_RATE: "heartRate",
	WALKING_RUNNING_DISTANCE: "walkingRunningDistance",
};

const RAW_MEASUREMENT_CODES_ARRAY = Object.values(RAW_MEASUREMENT_CODES);

const ACTIVE_MEASUREMENTS = {
	SLEEP_DURATION: "sleepDuration",
	AVG_HEART_RATE: "avgHeartRate",
	MAX_HEART_RATE: "maxHeartRate",
	MIN_HEART_RATE: "minHeartRate",
	WEIGHT: "weight",
	HEIGHT: "height",
	DAILY_STEPS: "dailySteps",
	DAILY_DISTANCE: "dailyDistance",
	DAILY_ACTIVITY_DURATION: "dailyActivityDuration",
	DAILY_SLEEP_QUALITY: "dailySleepQuality",
	DAILY_ACTIVITY_FEELING: "dailyActivityFeeling",
	DAILY_CALORIES_BURNED: "dailyCaloriesBurned",
	DAILY_EMOTION: "dailyEmotion",
	DAILY_WEATHER: "dailyWeather",
} as const;

const MEASUREMENTS_IN_PATTERNS = {
	SLEEP_DURATION: "sleepDuration",
	AVG_HEART_RATE: "avgHeartRate",
	MAX_HEART_RATE: "maxHeartRate",
	MIN_HEART_RATE: "minHeartRate",
	WEIGHT: "weight",
	HEIGHT: "height",
	DAILY_STEPS: "dailySteps",
	DAILY_DISTANCE: "dailyDistance",
	DAILY_ACTIVITY_DURATION: "dailyActivityDuration",
	DAILY_SLEEP_QUALITY: "dailySleepQuality",
	DAILY_ACTIVITY_FEELING: "dailyActivityFeeling",
	DAILY_CALORIES_BURNED: "dailyCaloriesBurned",
} as const;
const MEASUREMENTS_GROUPS = {
	DAILY_HEART_RATE: {
		code: "dailyHeartRate",
		measurements: [ACTIVE_MEASUREMENTS.AVG_HEART_RATE, ACTIVE_MEASUREMENTS.MAX_HEART_RATE, ACTIVE_MEASUREMENTS.MIN_HEART_RATE],
	},
	DAILY_REFLECTIONS: {
		code: "dailyReflections",
		measurements: [
			ACTIVE_MEASUREMENTS.DAILY_SLEEP_QUALITY,
			ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_FEELING,
			ACTIVE_MEASUREMENTS.DAILY_EMOTION,
		],
	},
	DAILY_ACTIVITY: {
		code: "dailyActivity",
		measurements: [ACTIVE_MEASUREMENTS.DAILY_ACTIVITY_DURATION, ACTIVE_MEASUREMENTS.DAILY_CALORIES_BURNED],
	},
	DAILY_STEPS: {
		code: "dailySteps",
		measurements: [ACTIVE_MEASUREMENTS.DAILY_STEPS],
	},
	DAILY_DISTANCE: {
		code: "dailyDistance",
		measurements: [ACTIVE_MEASUREMENTS.DAILY_DISTANCE],
	},
	SLEEP_DURATION: {
		code: "sleepDuration",
		measurements: [ACTIVE_MEASUREMENTS.SLEEP_DURATION],
	},
	WEIGHT: {
		code: "weight",
		measurements: [ACTIVE_MEASUREMENTS.WEIGHT],
	},
	HEIGHT: {
		code: "height",
		measurements: [ACTIVE_MEASUREMENTS.HEIGHT],
	},
	WEATHER: {
		code: "weather",
		measurements: [ACTIVE_MEASUREMENTS.DAILY_WEATHER],
	},
};

const HOURS_IN_DAY = 24;

interface HealthValue {
	id?: string;
	startDate: Date;
	endDate: Date;
	value: number;
	sourceName?: string;
	type?: string;
}

interface IMeasurementsConfig {
	code: string;
	unit?: string;
	name: string;
	precision?: number;
	valuesRange?: {
		min: number;
		max: number;
		scale: number[];
	};
	displayColor?: {
		primary?: string;
		secondary?: string;
	};
}

type IActiveMeasurementsInPatternsValues = (typeof MEASUREMENTS_IN_PATTERNS)[keyof typeof MEASUREMENTS_IN_PATTERNS];

export {
	MEASUREMENT_SOURCES,
	SLEEP_VALUES,
	IN_SLEEP_VALUES,
	IN_SLEEP_VALUES_ARRAY,
	HOURS_IN_DAY,
	RAW_MEASUREMENT_CODES,
	ACTIVE_MEASUREMENTS,
	RAW_MEASUREMENT_CODES_ARRAY,
	MEASUREMENTS_GROUPS,
	HealthValue,
	IMeasurementsConfig,
	IActiveMeasurementsInPatternsValues,
};
