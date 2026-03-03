import { useState } from "react";
import {
  BookOpen,
  Users,
  TrendingUp,
  ClipboardList,
  ArrowRight,
  Search,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  type LucideIcon,
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
  onSelectClass?: (course: Course) => void;
}

const TeacherDashboard = ({ teacher, onNavigate }: Props) => {
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

      {/* Full Student Details */}
      {selectedStudent && (
        <div className="bg-card border border-border rounded-xl p-5 mb-8">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Student Profile: {selectedStudent.name}
            </h3>
            <button
              onClick={() => setSelectedStudent(null)}
              className="p-1 hover:bg-muted/30 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Personal Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <InfoItem icon={User} label="Full Name" value={selectedStudent.name} />
            <InfoItem
              icon={Calendar}
              label="Date of Birth"
              value={new Date(selectedStudent.dob).toLocaleDateString()}
            />
            <InfoItem icon={Mail} label="Email" value={selectedStudent.email} />
            <InfoItem icon={Phone} label="Phone" value={selectedStudent.phone} />
            <InfoItem icon={User} label="Gender" value={selectedStudent.gender} />
            <InfoItem
              icon={MapPin}
              label="Address"
              value={selectedStudent.address}
            />
            <InfoItem
              icon={User}
              label="Guardian"
              value={`${selectedStudent.guardian} (${selectedStudent.guardianPhone})`}
            />
            <InfoItem
              icon={Calendar}
              label="Enrollment Date"
              value={new Date(selectedStudent.enrollDate).toLocaleDateString()}
            />
            <InfoItem
              icon={selectedStudent.status === "Active" ? CheckCircle : AlertCircle}
              label="Status"
              value={selectedStudent.status}
              valueClassName={
                selectedStudent.status === "Active"
                  ? "text-success"
                  : "text-destructive"
              }
            />
          </div>

          {/* Attendance & Fees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Attendance Card */}
            <div className="bg-muted/20 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Attendance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Present:</span>
                  <span className="font-medium">
                    {selectedStudent.attendance.present}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Absent:</span>
                  <span className="font-medium">
                    {selectedStudent.attendance.absent}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Late:</span>
                  <span className="font-medium">
                    {selectedStudent.attendance.late}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span>Total Days:</span>
                  <span className="font-medium">
                    {selectedStudent.attendance.total}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Attendance %:</span>
                  <span>
                    {(
                      (selectedStudent.attendance.present /
                        selectedStudent.attendance.total) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Fees Card */}
            <div className="bg-muted/20 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" /> Fees Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Fees:</span>
                  <span className="font-medium">
                    Rs. {selectedStudent.fees.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span className="font-medium">
                    Rs. {selectedStudent.fees.paid.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span
                    className={`font-medium ${
                      selectedStudent.fees.pending > 0
                        ? "text-destructive"
                        : "text-success"
                    }`}
                  >
                    Rs. {selectedStudent.fees.pending.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
                  <span>Status:</span>
                  <span
                    className={
                      selectedStudent.fees.status === "Paid"
                        ? "text-success"
                        : selectedStudent.fees.status === "Partial"
                        ? "text-warning"
                        : "text-destructive"
                    }
                  >
                    {selectedStudent.fees.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tests Table */}
          <div className="mb-6">
            <h4 className="font-medium text-foreground mb-3">Test Scores</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-2">Subject</th>
                    <th className="text-left p-2">Test</th>
                    <th className="text-left p-2">Marks</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">%</th>
                    <th className="text-left p-2">Grade</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.tests.map((test, idx) => (
                    <tr key={idx} className="border-b border-border">
                      <td className="p-2">{test.subject}</td>
                      <td className="p-2">{test.test}</td>
                      <td className="p-2">{test.marks}</td>
                      <td className="p-2">{test.total}</td>
                      <td className="p-2">
                        {((test.marks / test.total) * 100).toFixed(1)}%
                      </td>
                      <td className="p-2">{test.grade}</td>
                      <td className="p-2">
                        {new Date(test.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="mb-6">
            <h4 className="font-medium text-foreground mb-3">Assignments</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Subject</th>
                    <th className="text-left p-2">Due Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudent.assignments.map((ass, idx) => (
                    <tr key={idx} className="border-b border-border">
                      <td className="p-2">{ass.title}</td>
                      <td className="p-2">{ass.subject}</td>
                      <td className="p-2">
                        {new Date(ass.due).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            ass.status === "Submitted"
                              ? "bg-success/10 text-success"
                              : ass.status === "Late"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {ass.status}
                        </span>
                      </td>
                      <td className="p-2">{ass.score || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Behavior Log */}
          <div className="mb-6">
            <h4 className="font-medium text-foreground mb-3">Behavior</h4>
            <div className="space-y-2">
              {selectedStudent.behavior.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg"
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full ${
                      b.type === "Positive"
                        ? "bg-success"
                        : b.type === "Warning"
                        ? "bg-warning"
                        : "bg-destructive"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{b.note}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(b.date).toLocaleDateString()} · {b.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Progress */}
          <div className="mb-6">
            <h4 className="font-medium text-foreground mb-3">Monthly GPA</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {selectedStudent.progress.map((p, idx) => (
                <div key={idx} className="bg-muted/20 p-2 rounded-lg text-center">
                  <div className="text-sm font-semibold">{p.month}</div>
                  <div className="text-lg font-bold text-primary">{p.gpa}</div>
                </div>
              ))}
            </div>
          </div>

          {/* View Full Profile button (optional) */}
          <button
            onClick={() => onNavigate("profile")}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            View Full Profile Page
          </button>
        </div>
      )}
    </div>
  );
};

// Helper component for info items
const InfoItem = ({
  icon: Icon,
  label,
  value,
  valueClassName = "",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <div className="flex items-start gap-2">
    <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium ${valueClassName}`}>{value}</p>
    </div>
  </div>
);

export default TeacherDashboard;
