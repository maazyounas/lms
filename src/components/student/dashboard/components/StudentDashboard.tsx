import { useMemo } from "react";
import { FileText, UserCheck, ClipboardList, Award } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Student } from "@/data/mockData";
import { ANNOUNCEMENTS } from "@/data/mockData";

interface Props {
  student: Student;
  onNavigate: (nav: string) => void;
}

// Helper to convert percentage to letter grade
const getLetterGrade = (percentage: number): string => {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
};

const getBarColor = (percentage: number): string => {
  if (percentage >= 90) return "#10b981"; // emerald-500
  if (percentage >= 80) return "#22c55e"; // green-500
  if (percentage >= 70) return "#eab308"; // yellow-500
  if (percentage >= 60) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
};

const StudentDashboard = ({ student, onNavigate }: Props) => {
  // Attendance percentage
  const attPct =
    student.attendance.total > 0
      ? Math.round(
          (student.attendance.present / student.attendance.total) * 100
        ).toString()
      : "0";

  const overallPercentage = useMemo(() => {
    const totalMarks = student.tests.reduce((sum, test) => sum + test.marks, 0);
    const totalPossible = student.tests.reduce(
      (sum, test) => sum + test.total,
      0
    );
    if (totalPossible === 0) return 0;
    return Math.round((totalMarks / totalPossible) * 100);
  }, [student.tests]);

  const overallGrade = getLetterGrade(overallPercentage);

  const pendingQuizzes = useMemo(() => {
    if (typeof window === "undefined") return 0;
    try {
      const rawQuizzes = localStorage.getItem("teacher-quizzes");
      const quizzes = rawQuizzes
        ? (JSON.parse(rawQuizzes) as { id: string; classGrade: string }[])
        : [];
      const rawSubmissions = localStorage.getItem("quiz-submissions");
      const submissions = rawSubmissions
        ? (JSON.parse(rawSubmissions) as { quizId: string; studentId: number }[])
        : [];

      const eligible = quizzes.filter((quiz) => quiz.classGrade === student.grade);
      const submitted = new Set(
        submissions
          .filter((sub) => sub.studentId === student.id)
          .map((sub) => sub.quizId)
      );
      return eligible.filter((quiz) => !submitted.has(quiz.id)).length;
    } catch {
      return 0;
    }
  }, [student.grade, student.id]);

  const pendingAssignments = (student.assignments ?? []).filter(
    (a) => a.status === "Pending"
  ).length;

  const chartData = student.tests
    .slice(-5)
    .map((test) => {
      const label = `${test.subject} ${test.test}`;
      return {
        name: label.length > 10 ? label.substring(0, 8) + "..." : label,
        percentage: (test.marks / test.total) * 100,
        fullName: label,
      };
    })
    .reverse(); // Show most recent first


  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {student.name.split(" ")[0]}! 
        </h1>
        <p className="text-muted-foreground text-sm">
          Here's your academic overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Overall Grade Card */}
        <button
          onClick={() => onNavigate("grades")}
          className="group bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Overall Grade</p>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-lg">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">
              {overallGrade}
            </p>
          </div>
        </button>

        {/* Pending Quizzes */}
<button
  onClick={() => onNavigate("quizzes")}
  className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors cursor-pointer"
>
  <div className="flex items-center justify-between mb-3">
    <p className="text-sm text-muted-foreground">Pending Quizzes</p>
    <div className="h-10 w-10 rounded-lg text-info bg-info/10 flex items-center justify-center">
      <FileText className="h-5 w-5" />
    </div>
  </div>
  <p className="text-2xl font-bold text-foreground">{pendingQuizzes}</p>
</button>

        {/* Attendance */}
        <button
          onClick={() => onNavigate("attendance")}
          className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Attendance</p>
            <div className="h-10 w-10 rounded-lg text-accent bg-accent/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{attPct}%</p>
        </button>

        {/* Pending Work */}
        <button
          onClick={() => onNavigate("assignments")}
          className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Pending Work</p>
            <div className="h-10 w-10 rounded-lg text-warning bg-warning/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {pendingAssignments}
          </p>
        </button>
      </div>

      {/* Charts & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Chart */}
        <div className="bg-card border border-border rounded-xl p-5 backdrop-blur-sm bg-opacity-50">
          <h3 className="font-semibold text-foreground mb-4">
            Recent Test Performance
          </h3>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">
              No charts available
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barCategoryGap={12}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }}
                    axisLine={false}
                    tickLine={false}
                    width={25}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg p-2 text-xs shadow-lg">
                            <p className="font-medium text-foreground">
                              {data.fullName}
                            </p>
                            <p className="text-muted-foreground">
                              Score:{" "}
                              <span className="text-foreground font-medium">
                                {data.percentage.toFixed(1)}%
                              </span>
                            </p>
                            <p className="text-muted-foreground">
                              Grade:{" "}
                              <span
                                className="font-medium"
                                style={{
                                  color: getBarColor(data.percentage),
                                }}
                              >
                                {getLetterGrade(data.percentage)}
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.percentage)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Each bar shows the percentage score for the most recent tests.
              </p>
            </>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Recent Announcements
          </h3>
          {ANNOUNCEMENTS.slice(0, 3).map((a) => (
            <div
              key={a.id}
              onClick={() => onNavigate("announcements")}
              className="p-3 rounded-lg hover:bg-muted/30 transition-colors mb-1 cursor-pointer group"
            >
              <div className="flex items-start gap-2">
                <div
                  className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                    a.priority === "high"
                      ? "bg-destructive"
                      : a.priority === "medium"
                      ? "bg-warning"
                      : "bg-muted-foreground"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {a.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
