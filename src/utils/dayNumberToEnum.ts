import { Day } from "src/domain/workingHours.entity.js";

export function utcDayToDayEnum(day: number): Day {
  switch (day) {
    case 0: return 'SUNDAY';
    case 1: return 'MONDAY';
    case 2: return 'TUESDAY';
    case 3: return 'WEDNESDAY';
    case 4: return 'THURSDAY';
    case 5: return 'FRIDAY';
    case 6: return 'SATURDAY';
    default: return 'SUNDAY';
  }
}
