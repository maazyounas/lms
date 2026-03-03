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
} from "recharts";
interface Props {
  student: Student;
}

const gradeColor = (g: string) => {
  if (g.startsWith("A")) return "text-success";
  if (g.startsWith("B")) return "text-info";
  if (g.startsWith("C")) return "text-warning";
  return "text-destructive";
};

const gradeBg = (g: string) => {
  if (g.startsWith("A")) return "bg-success/15";
  if (g.startsWith("B")) return "bg-info/15";
  if (g.startsWith("C")) return "bg-warning/15";
  return "bg-destructive/15";
};

const StudentGrades = ({ student }: Props) => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const subjects = Array.from(new Set(student.tests.map((t) => t.subject)));

  const subjectData = subjects.map((subj) => {
    const tests = student.tests.filter((t) => t.subject === subj);
    const avgPct =
      tests.reduce((a, t) => a + (t.marks / t.total) * 100, 0) / tests.length;

    const overallGrade =
      avgPct >= 90
        ? "A+"
        : avgPct >= 85
          ? "A"
          : avgPct >= 80
            ? "B+"
            : avgPct >= 75
              ? "B"
              : avgPct >= 70
                ? "C+"
                : avgPct >= 60
                  ? "C"
                  : "D";

    return { subject: subj, tests, avgPct, overallGrade };
  });

  // ✅ MOVE IT HERE
  const chartData = subjectData.map((sub) => ({
    subject: sub.subject,
    average: Number(sub.avgPct.toFixed(0)),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Grades</h1>
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
                }}
              />
              <Bar
                dataKey="average"
                radius={[6, 6, 0, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="space-y-4">
        {subjectData.map((sub) => {
          const isOpen = expandedSubject === sub.subject;
          return (
            <div
              key={sub.subject}
              className="bg-card border border-border rounded-xl overflow-hidden"
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
                    className={`px-3 py-1 rounded-full text-sm font-bold ${gradeColor(sub.overallGrade)} ${gradeBg(sub.overallGrade)}`}
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

              {/* Expanded Detail */}
              {isOpen && (
                <div className="border-t border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["Test", "Date", "Marks", "%", "Grade"].map((h) => (
                            <th
                              key={h}
                              className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3"
                            >
                              {h}
                            </th>
                          ))}
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
                            <td className="px-5 py-3 text-sm text-muted-foreground">
                              {((t.marks / t.total) * 100).toFixed(0)}%
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`font-bold text-sm ${gradeColor(t.grade)}`}
                              >
                                {t.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentGrades;
