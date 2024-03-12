import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
export default function getStartOfDay(date: string | Date): Date {
	const dateToConvert = new Date(date);
	return dayjs(dateToConvert).utc().startOf("day").toDate();
}
