export interface WorkPeriod {
  startYear: number;
  endYear?: number;
}

export function getWorkPeriod(period?: WorkPeriod) {
  if (!period) return { label: undefined, years: [], sortDate: 0 };
  const end = period.endYear ?? period.startYear;
  return {
    label:
      end === period.startYear ? String(end) : `${period.startYear}–${end}`,
    years: Array.from({ length: end - period.startYear + 1 }, (_, index) =>
      String(period.startYear + index),
    ),
    sortDate: Date.UTC(end, 0, 1),
  };
}
