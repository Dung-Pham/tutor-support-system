import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    start: { type: Date },
    end: { type: Date },
    date_id: { type: mongoose.Schema.Types.ObjectId, ref: "CalendarDate" },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
