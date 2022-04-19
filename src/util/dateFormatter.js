export default function formatDate(date, format) {
  if (!date) {
    return '';
  }

  if (!format) {
    format = 'yyyy-MM-dd';
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return format
    .replace(/yyyy/g, year)
    .replace(/MM/g, month < 10 ? `0${month}` : month)
    .replace(/dd/g, day < 10 ? `0${day}` : day)
    .replace(/HH/g, hour < 10 ? `0${hour}` : hour)
    .replace(/mm/g, minute < 10 ? `0${minute}` : minute)
    .replace(/ss/g, second < 10 ? `0${second}` : second);
}