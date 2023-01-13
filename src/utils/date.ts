const getWeek = function (dowOffset: number) {
  const newYear = new Date(new Date().getFullYear(), 0, 1);
  let day = newYear.getDay() - dowOffset;
  day = day >= 0 ? day : day + 7;
  const daynum =
    Math.floor(
      (new Date().getTime() -
        newYear.getTime() -
        (new Date().getTimezoneOffset() - newYear.getTimezoneOffset()) *
          60000) /
        86400000,
    ) + 1;
  let weeknum = 0;
  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      const nYear = new Date(new Date().getFullYear() + 1, 0, 1);
      let nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      weeknum = nday < 4 ? 1 : 53;
    }
  } else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  return weeknum;
};
export default getWeek;
