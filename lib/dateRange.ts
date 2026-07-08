export function getTwoMonthRange(): { min: string; max: string } {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const min = `${yyyy}-${mm}-${dd}`;

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);
  const max_yyyy = maxDate.getFullYear();
  const max_mm = String(maxDate.getMonth() + 1).padStart(2, '0');
  const max_dd = String(maxDate.getDate()).padStart(2, '0');
  const max = `${max_yyyy}-${max_mm}-${max_dd}`;
  return { min, max };
}
