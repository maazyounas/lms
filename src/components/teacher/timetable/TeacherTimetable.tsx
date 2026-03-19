import { useMemo, useState } from "react";
import { TIMETABLE } from "@/data/mockData";
import { Filter } from "lucide-react";
import type { Teacher } from "@/data/mockData";

type Props = {
  teacher: Teacher;
};

const TeacherTimetable = ({ teacher }: Props) => {
  const [selectedCourse, setSelectedCourse] = useState<string>(teacher.subject);

  const courses = useMemo(() => {
    const courseSet = new Set<string>();
    TIMETABLE.forEach((row) => {
      [row.mon, row.tue, row.wed, row.thu, row.fri, row.sat].forEach((cell) => {
        if (cell && cell !== "BREAK") {
          courseSet.add(cell);
        }
      });
    });
    return Array.from(courseSet).sort();
  }, []);

  const filteredRows = useMemo(() => {
    if (!selectedCourse) return TIMETABLE;
    return TIMETABLE.filter((row) =>
      [row.mon, row.tue, row.wed, row.thu, row.fri, row.sat].some(
        (cell) => cell === selectedCourse
      )
    );
  }, [selectedCourse]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-foreground">Teacher Timetable</h2>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="sticky left-0 bg-card text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                  Time
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, i) => {
                  const cells = [row.mon, row.tue, row.wed, row.thu, row.fri, row.sat];
                  const isBreak = cells.some((cell) => cell === "BREAK");
                  return (
                    <tr
                      key={i}
                      className={`border-b border-border last:border-0 transition-colors ${
                        isBreak ? "bg-warning/5" : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="sticky left-0 bg-card px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">
                        {row.time}
                      </td>
                      {cells.map((cell, j) => {
                        const isMatchingCourse = selectedCourse && cell === selectedCourse;
                        return (
                          <td
                            key={j}
                            className={`px-4 py-3 text-sm ${
                              cell === "BREAK"
                                ? "text-warning font-medium"
                                : isMatchingCourse
                                ? "bg-primary/20 font-semibold text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {cell || "-"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No classes found for {selectedCourse}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCourse && (
        <p className="text-sm text-muted-foreground mt-4">
          Showing only rows with <span className="font-medium text-primary">{selectedCourse}</span>.
        </p>
      )}
    </div>
  );
};

export default TeacherTimetable;
