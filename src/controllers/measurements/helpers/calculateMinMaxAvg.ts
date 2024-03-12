interface MinMaxAvg {
	min: number;
	max: number;
	avg: number;
	totalRecords: number;
}
const calculateMinMaxAvg = (measurements: number[]): MinMaxAvg => {
	const min = Math.min(...measurements);
	const max = Math.max(...measurements);
	const avg = Math.ceil(measurements.reduce((a, b) => a + b, 0) / measurements.length);
	const totalRecords = measurements.length;
	return { min, max, avg, totalRecords };
};

export default calculateMinMaxAvg;
