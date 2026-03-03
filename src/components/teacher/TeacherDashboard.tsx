import { useState } from "react";
import {
  BookOpen,
  Users,
  TrendingUp,
  ClipboardList,
  ArrowRight,
  Search,
} from "lucide-react";
import {
  STUDENTS,
  COURSES,
  ANNOUNCEMENTS,
  TEACHER_ASSIGNMENTS,
  type Teacher,
  type Course,
  type Student,
} from "@/data/mockData";

interface Props {
  teacher: Teacher;
  onNavigate: (nav: string) => void;
  onSelectClass: (course: Course) => void;
}

const TeacherDashboard = ({
  teacher,
  onNavigate,
}: Props) => {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const myCourses = COURSES.filter((c) => c.teacher === teacher.name);
  const myAssignments = TEACHER_ASSIGNMENTS.filter(
    (a) => a.subject === teacher.subject
  );
  const pendingGrading = myAssignments.reduce(
    (acc, a) =>
      acc +
      a.submissions.filter(
        (s) => s.status === "Submitted" && s.marks === undefined
      ).length,
    0
  );

  const avgScore =
    STUDENTS.length > 0
      ? (
          STUDENTS.reduce((a, s) => {
            const t = s.tests.find(
              (t) => t.subject === teacher.subject && t.test === "Mid-Term"
            );
            return a + (t ? (t.marks / t.total) * 100 : 0);
          }, 0) / STUDENTS.length
        ).toFixed(0)
      : "0";

  const filteredStudents = STUDENTS.filter((s) => {
    const query = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      String(s.id).includes(query) ||
      `STU-${String(s.id).padStart(4, "0")}`.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {teacher.name.split(" ").slice(1).join(" ")}! 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          Subject: {teacher.subject} · Classes: {teacher.classes.join(", ")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "My Classes",
            value: myCourses.length,
            icon: BookOpen,
            color: "text-success bg-success/10",
          },
          {
            label: "Avg Class Score",
            value: `${avgScore}%`,
            icon: TrendingUp,
            color: "text-accent bg-accent/10",
          },
          {
            label: "Pending Grading",
            value: pendingGrading,
            icon: ClipboardList,
            color: "text-warning bg-warning/10",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <div
                className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Student Search */}
      <div className="bg-card border border-border rounded-xl p-5 mb-8">
        <h3 className="font-semibold text-foreground mb-3">
          Search Student
        </h3>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
          />
        </div>

        <div className="mt-4 max-h-60 overflow-y-auto">
          {filteredStudents.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No student found.
            </p>
          )}

          {filteredStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {s.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  ID: STU-{String(s.id).padStart(4, "0")}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Student Details */}
      {selectedStudent && (
        <div className="bg-card border border-border rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              Student Details
            </h3>
            <button
              onClick={() => setSelectedStudent(null)}
              className="text-xs text-primary hover:underline"
            >
              Close
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <p>
              <strong>Name:</strong> {selectedStudent.name}
            </p>
            <p>
              <strong>Student ID:</strong>{" "}
              STU-{String(selectedStudent.id).padStart(4, "0")}
            </p>
            <p>
              <strong>Grade:</strong> {selectedStudent.grade}
            </p>
            <p>
              <strong>Attendance:</strong>{" "}
              {selectedStudent.attendance.present}/
              {selectedStudent.attendance.total} (
              {(
                (selectedStudent.attendance.present /
                  selectedStudent.attendance.total) *
                100
              ).toFixed(0)}
              %)
            </p>
            <p>
              <strong>Fees Status:</strong> {selectedStudent.fees.status}
            </p>
            <p>
              <strong>Pending Fees:</strong> {selectedStudent.fees.pending}
            </p>
          </div>

          <button
            onClick={() => {
              onNavigate("profile");
            }}
            className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            View Full Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;