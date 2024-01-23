const MEASUREMENT_SOURCES = {
	APPLE_HEALTH: "appleHealth",
	GOOGLE_FIT: "googleFit",
};

const SLEEP_VALUES = {
	ASLEEP: "ASLEEP",
	AWAKE: "AWAKE",
	IN_BED: "IN_BED",
};

const MEASUREMENT_CODES = {
	SLEEP: "sleep",
	ACTIVITY: "activity",
	HEIGHT: "height",
	WEIGHT: "weight",
	STEPS: "steps",
	HEART_RATE: "heartRate",
	WALKING_RUNNING_DISTANCE: "walkingRunningDistance",
};

const MINUTES_IN_DAY = 1440;

interface HealthValue {
	id?: string;
	startDate: string;
	endDate: string;
	value: number;
	type?: string;
}

export { MEASUREMENT_SOURCES, SLEEP_VALUES, MINUTES_IN_DAY, MEASUREMENT_CODES, HealthValue };
