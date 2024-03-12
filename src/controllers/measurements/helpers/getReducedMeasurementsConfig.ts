import { Measurements } from "@models/measurements";
import { IMeasurementsConfig } from "@constants/measurements";

const getReducedMeasurementsConfig = async () => {
	const measurementsConfig = await Measurements.find({ active: true }, { active: false, _id: false, __v: false }).lean();
	const reducedMeasurementsConfig = measurementsConfig.reduce(
		(acc, item) => {
			if (!acc || !item.code) return acc;
			acc[`${item.code}`] = item;
			return acc;
		},
		{} as { [key: string]: IMeasurementsConfig }
	);
	return reducedMeasurementsConfig;
};

export default getReducedMeasurementsConfig;
