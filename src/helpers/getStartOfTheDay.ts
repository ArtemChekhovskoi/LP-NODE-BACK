import moment from "moment";

export default function getStartOfDay(date: string | Date): Date {
  const currentDateStartMoment = moment(new Date(date)).utc().startOf("day");
  return new Date(currentDateStartMoment.toString());
}
