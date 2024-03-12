const DATA_PRESENTATION = {
	DAY: "day",
	WEEK: "week",
	MONTH: "month",
};

const PRESENTATION_FORMAT = {
	day: "YYYY-MM-DD",
	week: "YYYY-ww",
	month: "YYYY-MM",
};
const DATA_PRESENTATION_ARRAY = Object.values(DATA_PRESENTATION);

type IDataPresentationByDate = "week" | "month" | "day";

export { DATA_PRESENTATION, DATA_PRESENTATION_ARRAY, PRESENTATION_FORMAT, IDataPresentationByDate };
