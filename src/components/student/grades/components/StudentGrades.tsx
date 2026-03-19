import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import type { Student } from "@/data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { cambridgeGradeColor, percentageToCambridgeGrade } from "@/lib/grades";

interface Props {
  student: Student;
}

const gradeColor = (g: string) => cambridgeGradeColor(g);

const gradeBg = (g: string) => {
  if (g.startsWith("A")) return "bg-success/15";
  if (g.startsWith("B")) return "bg-info/15";
  if (g.startsWith("C")) return "bg-warning/15";
  if (g.startsWith("D") || g.startsWith("E")) return "bg-warning/15";
  return "bg-destructive/15";
};

// Helper to assign a color based on performance (percentage)
const getBarColor = (percentage: number) => {
  if (percentage >= 90) return "#22c55e"; // green-500
  if (percentage >= 80) return "#3b82f6"; // blue-500
  if (percentage >= 70) return "#eab308"; // yellow-500
  if (percentage >= 60) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
};

const StudentGrades = ({ student }: Props) => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const subjects = Array.from(new Set(student.tests.map((t) => t.subject)));

  const subjectData = subjects.map((subj) => {
    const tests = student.tests.filter((t) => t.subject === subj);
    const avgPct =
      tests.reduce((a, t) => a + (t.marks / t.total) * 100, 0) / tests.length;

    const overallGrade = percentageToCambridgeGrade(avgPct);

    return { subject: subj, tests, avgPct, overallGrade };
  });

  // Data for the chart
  const chartData = subjectData.map((sub) => ({
    subject: sub.subject,
    average: Number(sub.avgPct.toFixed(0)),
    grade: sub.overallGrade,
  }));

  return (
    <div>

      {/* Grades Overview Chart */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Overall Subject Performance
        </h2>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="subject"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{
                  fontWeight: "bold",
                  marginBottom: "0.25rem",
                  color: "hsl(var(--foreground))",
                }}
                itemStyle={{
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number, name: string, props) => {
                  const grade = props.payload.grade;
                  return [`${value}% (Grade: ${grade})`, "Average"];
                }}
              />
              <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.average)}
                    style={{ transition: "fill 0.2s ease" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.filter = "brightness(0.9)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.filter = "brightness(1)")
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-4">
        {subjectData.map((sub) => {
          const isOpen = expandedSubject === sub.subject;
          return (
            <div
              key={sub.subject}
              className="bg-card border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Subject Header */}
              <button
                onClick={() => setExpandedSubject(isOpen ? null : sub.subject)}
                className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {sub.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sub.tests.length} tests/quizzes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-2">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-lg font-bold text-foreground">
                      {sub.avgPct.toFixed(0)}%
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-bold ${gradeColor(sub.overallGrade)} ${gradeBg(sub.overallGrade)}`}
                  >
                    {sub.overallGrade}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Detail with animation */}
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-muted/20">
                            {["Test", "Date", "Marks", "%", "Grade"].map(
                              (h) => (
                                <th
                                  key={h}
                                  className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3"
                                >
                                  {h}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {sub.tests.map((t, i) => (
                            <tr
                              key={i}
                              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-5 py-3 text-sm text-foreground">
                                {t.test}
                              </td>
                              <td className="px-5 py-3 text-sm text-muted-foreground">
                                {t.date}
                              </td>
                              <td className="px-5 py-3 text-sm text-foreground font-medium">
                                {t.marks}/{t.total}
                              </td>
                              {(() => {
                                const percent = (t.marks / t.total) * 100;
                                const grade = percentageToCambridgeGrade(percent);
                                return (
                                  <>
                                    <td className="px-5 py-3 text-sm text-muted-foreground">
                                      {percent.toFixed(0)}%
                                    </td>
                                    <td className="px-5 py-3">
                                      <span className={`font-bold text-sm ${gradeColor(grade)}`}>
                                        {grade}
                                      </span>
                                    </td>
                                  </>
                                );
                              })()}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentGrades;
