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
  CalendarOff,
  type LucideIcon,
} from "lucide-react";
import {
  STUDENTS,
  TIMETABLE,
  COURSES,
  TEACHER_ASSIGNMENTS,
  type Teacher,
  type Course,
  type Student,
} from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  teacher: Teacher;
  onNavigate: (nav: string) => void;
  onSelectClass?: (course: Course) => void;
}

// Mock leaves data
const PENDING_LEAVES = 3;

// Helper to convert GPA to letter grade
const gpaToLetter = (gpa: number): string => {
  if (gpa >= 3.7) return "A";
  if (gpa >= 3.0) return "B";
  if (gpa >= 2.0) return "C";
  if (gpa >= 1.0) return "D";
  return "F";
};

// Helper to get color class for grade
const gradeColor = (grade: string) => {
  switch (grade) {
    case "A": return "text-success";
    case "B": return "text-info";
    case "C": return "text-warning";
    default: return "text-destructive";
  }
};

const TeacherDashboard = ({ teacher, onNavigate }: Props) => {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "tests" | "assignments" | "monthly" | "timetable">("overview");

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

  const handleAvatarClick = () => {
    toast.info("Profile picture preview – this would open the full image.");
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {teacher.name.split(" ").slice(1).join(" ")}!
        </h1>
        <p className="text-muted-foreground text-sm">
          Subject: {teacher.subject} · Classes: {teacher.classes.join(", ")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="My Classes"
          value={myCourses.length}
          icon={BookOpen}
          color="text-success bg-success/10"
          onClick={() => onNavigate("courses")}
        />
        <StatCard
          label="Avg Class Score"
          value={`${avgScore}%`}
          icon={TrendingUp}
          color="text-accent bg-accent/10"
        />
        <StatCard
          label="Pending Grading"
          value={pendingGrading}
          icon={ClipboardList}
          color="text-warning bg-warning/10"
          onClick={() => onNavigate("assignments")}
        />
        <StatCard
          label="Pending Leaves"
          value={PENDING_LEAVES}
          icon={CalendarOff}
          color="text-info bg-info/10"
          onClick={() => onNavigate("leave")}
        />
      </div>

      {/* Student Search & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Search Card */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" /> Search Student
          </h3>
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
          />
          <div className="mt-4 max-h-60 overflow-y-auto space-y-1">
            {filteredStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No student found.</p>
            ) : (
              filteredStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStudent(s);
                    setActiveTab("overview"); // Reset to overview when new student selected
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {s.avatar}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: STU-{String(s.id).padStart(4, "0")} · {s.grade}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Student Detail Panel */}
        {selectedStudent ? (
          <div className="bg-card border border-border rounded-xl p-5">
            {/* Header with avatar and close */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  onClick={handleAvatarClick}
                  className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {selectedStudent.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedStudent.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    ID: STU-{String(selectedStudent.id).padStart(4, "0")} · {selectedStudent.grade}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 hover:bg-muted/30 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-2 mb-4 border-b border-border pb-3">
              {(["overview", "tests", "assignments", "monthly", "timetable"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {tab === "overview" && "Overview"}
                  {tab === "tests" && "Test Scores"}
                  {tab === "assignments" && "Assignments"}
                  {tab === "monthly" && "Monthly Grades"}
                  {tab === "timetable" && "Timetable"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-4 max-h-[500px] overflow-y-auto pr-1">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Attendance</p>
                      <p className="text-lg font-semibold">
                        {selectedStudent.attendance.present}/{selectedStudent.attendance.total}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((selectedStudent.attendance.present / selectedStudent.attendance.total) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground">Fees Status</p>
                      <p className={`text-lg font-semibold ${
                        selectedStudent.fees.status === "Paid"
                          ? "text-success"
                          : selectedStudent.fees.status === "Partial"
                          ? "text-warning"
                          : "text-destructive"
                      }`}>
                        {selectedStudent.fees.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pending: Rs. {selectedStudent.fees.pending.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Personal Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem icon={Mail} label="Email" value={selectedStudent.email} />
                    <InfoItem icon={Phone} label="Phone" value={selectedStudent.phone} />
                    <InfoItem icon={Calendar} label="DOB" value={new Date(selectedStudent.dob).toLocaleDateString()} />
                    <InfoItem icon={User} label="Gender" value={selectedStudent.gender} />
                    <InfoItem icon={MapPin} label="Address" value={selectedStudent.address} />
                    <InfoItem icon={User} label="Guardian" value={selectedStudent.guardian} />
                    <InfoItem icon={Phone} label="Guardian Phone" value={selectedStudent.guardianPhone} />
                    <InfoItem icon={Calendar} label="Enrolled" value={new Date(selectedStudent.enrollDate).toLocaleDateString()} />
                  </div>
                </div>
              )}

              {activeTab === "tests" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-2">Subject</th>
                        <th className="text-left p-2">Test</th>
                        <th className="text-left p-2">Marks</th>
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
                          <td className="p-2">{test.marks}/{test.total}</td>
                          <td className="p-2">{((test.marks / test.total) * 100).toFixed(1)}%</td>
                          <td className="p-2 font-medium" style={{ color: `hsl(var(--${test.grade.startsWith("A") ? "success" : test.grade.startsWith("B") ? "info" : test.grade.startsWith("C") ? "warning" : "destructive"}))` }}>
                            {test.grade}
                          </td>
                          <td className="p-2">{new Date(test.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Subject</th>
                        <th className="text-left p-2">Due</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.assignments.map((ass, idx) => (
                        <tr key={idx} className="border-b border-border">
                          <td className="p-2">{ass.title}</td>
                          <td className="p-2">{ass.subject}</td>
                          <td className="p-2">{new Date(ass.due).toLocaleDateString()}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              ass.status === "Submitted"
                                ? "bg-success/10 text-success"
                                : ass.status === "Late"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-warning/10 text-warning"
                            }`}>
                              {ass.status}
                            </span>
                          </td>
                          <td className="p-2">{ass.score || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "monthly" && (
                <div>
                  <h4 className="font-medium text-foreground mb-3">Monthly Grades</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {selectedStudent.progress.map((p, idx) => {
                      const letter = gpaToLetter(p.gpa);
                      return (
                        <div key={idx} className="bg-muted/20 p-2 rounded-lg text-center">
                          <div className="text-sm font-semibold">{p.month}</div>
                          <div className={`text-lg font-bold ${gradeColor(letter)}`}>
                            {letter}
                          </div>
                          <div className="text-xs text-muted-foreground">({p.gpa.toFixed(1)})</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "timetable" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Mon</th>
                        <th className="text-left p-2">Tue</th>
                        <th className="text-left p-2">Wed</th>
                        <th className="text-left p-2">Thu</th>
                        <th className="text-left p-2">Fri</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TIMETABLE.map((slot) => (
                        <tr key={slot.time} className="border-b border-border last:border-0">
                          <td className="p-2">{slot.time}</td>
                          <td className="p-2">{slot.mon || "-"}</td>
                          <td className="p-2">{slot.tue || "-"}</td>
                          <td className="p-2">{slot.wed || "-"}</td>
                          <td className="p-2">{slot.thu || "-"}</td>
                          <td className="p-2">{slot.fri || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-center text-muted-foreground">
            <p>Select a student to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components (StatCard, InfoItem) remain the same as before...

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`bg-card border border-border rounded-xl p-5 transition-all hover:shadow-md ${
      onClick ? "cursor-pointer hover:border-primary/50" : ""
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
  </div>
);

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
    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium truncate ${valueClassName}`}>{value}</p>
    </div>
  </div>
);

export default TeacherDashboard;