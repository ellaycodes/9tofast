export const PRESET_SCHEDULES = [
  {
    label: "Skip Breakfast 16:8 (12pm - 8pm)",
    start: new Date(new Date().setHours(12, 0, 0, 0)),
    end: new Date(new Date().setHours(20, 0, 0, 0)),
  },
  {
    label: "Work-Lunch Window 14:10 (9am - 7pm)",
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(19, 0, 0, 0)),
  },
  {
    label: "After-Hours Fast 18:6 (1pm - 7pm)",
    start: new Date(new Date().setHours(13, 0, 0, 0)),
    end: new Date(new Date().setHours(19, 0, 0, 0)),
  },
];
