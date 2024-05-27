import { TPrepareMeasurementsToReturnResponse } from "@helpers/prepareMeasurementsForReturn";
import { decimalAdjust } from "@helpers/decimalAdjust";

const MAX_VALUE_MULTIPLIER = 1.2;

type TFieldToMakeScaleFrom = "value" | "maxValue" | "minValue";

interface GetMeasurementsScaleResponse extends TPrepareMeasurementsToReturnResponse {
	scale: number[];
	avgValue: number;
	minScaleValue: number;
	maxScaleValue: number;
	maxMultiplier: number;
}

const generateScale = (values: (number | undefined)[], precision: number | undefined) => {
	const filteredValues = values.filter((value) => value !== undefined) as number[];

	const maxValue = Math.max(...filteredValues) * MAX_VALUE_MULTIPLIER;
	const minValue = Math.min(...filteredValues);
	const scaleValues = [];

	if (maxValue > 0) {
		const step = maxValue / 5;
		for (let i = 0; i < 6; i += 1) {
			scaleValues.push(+(step * i).toFixed(precision || 0));
		}
	} else {
		const step = minValue / 5;
		for (let i = 0; i < 6; i += 1) {
			scaleValues.push(+(step * i).toFixed(precision || 0));
		}
	}
	return scaleValues;
};

const getAverageValue = (measurements: (number | undefined)[], precision: number | undefined) => {
	const filteredValuesWithoutZero = measurements.filter((value) => value !== 0 && value !== undefined) as number[];
	const totalValue = filteredValuesWithoutZero.reduce((sum, measurement) => sum + measurement, 0);
	const notNullMeasurementsAmount = filteredValuesWithoutZero.length;
	return decimalAdjust(notNullMeasurementsAmount > 0 ? totalValue / notNullMeasurementsAmount : 0, precision);
};
const getMeasurementsScale = (
	measurementsInfo: TPrepareMeasurementsToReturnResponse[],
	fieldToMakeScaleFrom: TFieldToMakeScaleFrom = "value"
): GetMeasurementsScaleResponse[] => {
	const measurementsValues = measurementsInfo.map((measurement) => {
		const preparedMeasurements = measurement.measurements.map((item) => item[fieldToMakeScaleFrom]);
		if (measurement?.valuesRange) {
			const { min, max } = measurement.valuesRange;
			const scale = Array.from({ length: max - min + 1 })
				.map((_, index) => min + index)
				.reverse();
			return {
				...measurement,
				scale,
				avgValue: getAverageValue(preparedMeasurements, measurement.precision),
				minScaleValue: min,
				maxScaleValue: max,
				maxMultiplier: MAX_VALUE_MULTIPLIER,
			};
		}

		const scaleValues = generateScale(preparedMeasurements, measurement.precision);
		const minValue = Math.min(...scaleValues);
		const maxValue = Math.max(...scaleValues);
		return {
			...measurement,
			avgValue: getAverageValue(preparedMeasurements, measurement.precision),
			scale: scaleValues.reverse(),
			minScaleValue: minValue,
			maxScaleValue: maxValue,
			maxMultiplier: MAX_VALUE_MULTIPLIER,
		};
	});
	return measurementsValues;
};

export { getMeasurementsScale };
