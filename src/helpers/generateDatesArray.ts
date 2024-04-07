import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const generateDatesArray = (startDate: Date, endDate: Date) => {
	const datesArray = [];
	while (dayjs(startDate).isBefore(endDate) || dayjs(startDate).isSame(endDate)) {
		datesArray.push(new Date(startDate));
		const newDate = dayjs(startDate).utc().add(1, "days").toDate();
		startDate = newDate;
	}
	return datesArray;
};

export default generateDatesArray;
