import { IPatternsListResponseData } from "@controllers/patterns/getPatternsList";

const MAX_VALUE_MULTIPLIER = 1.2;

const getMeasurementsScale = (measurementsInfo: IPatternsListResponseData[]) => {
	const generateScale = (values: number[]) => {
		const maxValue = Math.max(...values) * MAX_VALUE_MULTIPLIER;
		const minValue = Math.min(...values);
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
		const scaleValues = generateScale(measurement.measurements.map((item) => item.value)).reverse();
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
