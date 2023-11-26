import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
export default function getStartOfDay(date: string | Date): Date {
  const currentDateStartMoment = dayjs(new Date(date)).utc().startOf("day");
  return new Date(currentDateStartMoment.toString());
}
