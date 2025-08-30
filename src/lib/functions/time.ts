export function getSimpleDateTime(date:Date) {
  
  const year =  date.getFullYear();
  const month = String( date.getMonth() + 1).padStart(2, '0'); // ماه از 0 شروع می‌شود
  const day = String( date.getDate()).padStart(2, '0');
  const hours = String( date.getHours()).padStart(2, '0');
  const minutes = String( date.getMinutes()).padStart(2, '0');
  const seconds = String( date.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}