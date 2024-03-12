import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const generateDatesArray = (startDate: Date, endDate: Date) => {
	const datesArray = [];
	while (startDate <= endDate) {
		datesArray.push(new Date(startDate));
		startDate.setDate(startDate.getDate() + 1);
	}
	return datesArray;
};

export default generateDatesArray;
