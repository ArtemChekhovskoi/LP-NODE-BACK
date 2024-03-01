import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
export default function getStartOfDay(date: string | Date): Date {
	return dayjs(date).utcOffset(0).startOf("day").toDate();
}
