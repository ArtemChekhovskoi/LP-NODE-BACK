import getStartOfDay from "@helpers/getStartOfTheDay";

const generateDatesArray = (startDate: string, endDate: string) => {
  const datesArray = [];
  const currentDate = getStartOfDay(startDate);
  const stopDate = getStartOfDay(endDate);

  while (currentDate <= stopDate) {
    datesArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return datesArray;
};

export default generateDatesArray;
