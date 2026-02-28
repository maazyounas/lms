import { TIMETABLE } from "@/data/mockData";

const StudentTimetable = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Timetable</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Time", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE.map((row, i) => {
                const isBreak = row.mon === "BREAK";
                return (
                  <tr key={i} className={`border-b border-border last:border-0 ${isBreak ? "bg-warning/5" : "hover:bg-muted/30"} transition-colors`}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground whitespace-nowrap">{row.time}</td>
                    {[row.mon, row.tue, row.wed, row.thu, row.fri].map((cell, j) => (
                      <td key={j} className={`px-4 py-3 text-sm ${isBreak ? "text-warning font-medium" : "text-foreground"}`}>{cell}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
