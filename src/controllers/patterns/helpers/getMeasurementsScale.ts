const MAX_VALUE_MULTIPLIER = 1.2;

type TFieldToMakeScaleFrom = "value" | "maxValue" | "minValue";
interface GetMeasurementsScaleParams {
	name: string;
	unit?: string;
	code: string;
	precision?: number;
	valuesRange?: {
		min: number;
		max: number;
	};
	measurements: Array<{
		value: number;
		maxValue?: number;
		minValue?: number;
		date?: Date;
		startDate?: Date;
	}>;
}
const getMeasurementsScale = (measurementsInfo: GetMeasurementsScaleParams[], fieldToMakeScaleFrom: TFieldToMakeScaleFrom = "value") => {
	const generateScale = (values: (number | undefined)[]) => {
		const filteredValues = values.filter((value) => value !== undefined) as number[];
		const maxValue = Math.max(...filteredValues) * MAX_VALUE_MULTIPLIER;
		const minValue = Math.min(...filteredValues);
		const scaleValues = [];
		if (maxValue > 0) {
			const step = maxValue / 5;
			for (let i = 0; i < 6; i += 1) {
				scaleValues.push(Math.round(step * i));
			}
		} else {
			const step = minValue / 5;
			for (let i = 0; i < 6; i += 1) {
				scaleValues.push(Math.round(step * i));
			}
		}
		return scaleValues;
	};

	const measurementsValues = measurementsInfo.map((measurement) => {
		if (measurement?.valuesRange) {
			const { min, max } = measurement.valuesRange;
			const scale = Array.from({ length: max - min + 1 })
				.map((_, index) => min + index)
				.reverse();
			return {
				...measurement,
				scale,
				minScaleValue: min,
				maxScaleValue: max,
				maxMultiplier: MAX_VALUE_MULTIPLIER,
			};
		}

		const scaleValues = generateScale(measurement.measurements.map((item) => item[fieldToMakeScaleFrom])).reverse();
		const minScaleValue = scaleValues[scaleValues.length - 1];
		const maxScaleValue = scaleValues[0];
		return {
			...measurement,
			scale: scaleValues,
			minScaleValue,
			maxScaleValue,
			maxMultiplier: MAX_VALUE_MULTIPLIER,
		};
	});
	return measurementsValues;
};

export { getMeasurementsScale };
