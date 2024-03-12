import { IMeasurementsConfig } from "@constants/measurements";

type ReducedMeasurementsConfig = { [key: string]: IMeasurementsConfig };
type MeasurementObj = { [key: string]: { value: number; date: Date }[] };
type TPrepareMeasurementsToReturnResponse = IMeasurementsConfig & { measurements: { value: number; date: Date }[] };

const prepareMeasurementsForReturn = (
	measurementsObj: MeasurementObj[],
	reducedMeasurementsConfig: ReducedMeasurementsConfig
): TPrepareMeasurementsToReturnResponse[] | [] => {
	const preparedMeasurements = [];
	for (const measurementsGroup of measurementsObj) {
		for (const [key, measurements] of Object.entries(measurementsGroup)) {
			const measurementConfig = reducedMeasurementsConfig[key];
			if (!measurementConfig) {
				continue;
			}
			if (measurements.length === 0) {
				continue;
			}
			preparedMeasurements.push({
				...measurementConfig,
				measurements,
			});
		}
	}
	return preparedMeasurements;
};

export default prepareMeasurementsForReturn;
