import mongoose from "mongoose";

const calendarDateSchema = new mongoose.Schema(
  {
    date: { type: Number },
    month: { type: Number },
    year: { type: Number },
    day: { type: Number },
  },
  { timestamps: false }
);

const CalendarDate = mongoose.model("CalendarDate", calendarDateSchema);
export default CalendarDate;
