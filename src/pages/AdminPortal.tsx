import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Bell,
  DollarSign,
  Search,
  UserCog,
  CalendarCheck,
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import PortalLayout from "@/components/PortalLayout";
import {
  STUDENTS,
  TEACHERS,
  ANNOUNCEMENTS,
  TIMETABLE,
  TEACHER_ASSIGNMENTS,
  type Announcement,
  type Student,
  type Teacher,
  type TimetableEntry,
} from "@/data/mockData";

type LeaveStatus = "Pending" | "Approved" | "Rejected";

type LeaveRequest = {
  id: number;
  personType: "Student" | "Teacher";
  personName: string;
  leaveType: string;
  from: string;
  to: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
};

type TimetableSlot = TimetableEntry & { id: number };

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "teachers", label: "Teachers", icon: UserCog },
  { id: "leaves", label: "Leave Requests", icon: CalendarCheck },
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "announcements", label: "Announcements", icon: Bell },
  { id: "fees", label: "Fee Management", icon: DollarSign },
];

const leavesSeed: LeaveRequest[] = [
  { id: 1, personType: "Student", personName: "Ayesha Khan", leaveType: "Sick Leave", from: "2026-03-02", to: "2026-03-03", reason: "Medical rest", status: "Pending", appliedOn: "2026-02-28" },
  { id: 2, personType: "Student", personName: "Ahmed Raza", leaveType: "Personal", from: "2026-03-05", to: "2026-03-05", reason: "Family event", status: "Pending", appliedOn: "2026-02-27" },
  { id: 3, personType: "Teacher", personName: "Mr. Imran Ali", leaveType: "Casual Leave", from: "2026-03-04", to: "2026-03-04", reason: "Personal work", status: "Pending", appliedOn: "2026-02-28" },
  { id: 4, personType: "Teacher", personName: "Ms. Hira Nawaz", leaveType: "Sick Leave", from: "2026-02-20", to: "2026-02-21", reason: "Recovery", status: "Approved", appliedOn: "2026-02-18" },
];

const studentCode = (id: number) => `STU-${String(id).padStart(4, "0")}`;
const badge = (s: string) => ({
  Paid: "bg-success/15 text-success",
  Submitted: "bg-success/15 text-success",
  Approved: "bg-success/15 text-success",
  Pending: "bg-warning/15 text-warning",
  Partial: "bg-warning/15 text-warning",
  Late: "bg-warning/15 text-warning",
  Rejected: "bg-destructive/15 text-destructive",
  Missing: "bg-destructive/15 text-destructive",
  Overdue: "bg-destructive/15 text-destructive",
}[s] || "bg-muted text-muted-foreground");

const AdminPortal = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");

  const [leaveRequests, setLeaveRequests] = useState(leavesSeed);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(TIMETABLE.map((x, i) => ({ ...x, id: i + 1 })));
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [slotForm, setSlotForm] = useState<TimetableEntry>({ time: "", mon: "", tue: "", wed: "", thu: "", fri: "" });

  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [newAnn, setNewAnn] = useState({ title: "", priority: "medium" as "low" | "medium" | "high", content: "" });

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return STUDENTS;
    return STUDENTS.filter((s) => s.name.toLowerCase().includes(q) || studentCode(s.id).toLowerCase().includes(q) || String(s.id).includes(q));
  }, [studentSearch]);

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    if (!q) return TEACHERS;
    return TEACHERS.filter((t) => t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q));
  }, [teacherSearch]);

  const approveLeave = (id: number, status: LeaveStatus) => {
    setLeaveRequests((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success(`Leave ${status.toLowerCase()}.`);
  };

  const saveSlot = () => {
    if (!slotForm.time || !slotForm.mon || !slotForm.tue || !slotForm.wed || !slotForm.thu || !slotForm.fri) {
      toast.error("Fill all timetable fields.");
      return;
    }
    if (editingSlot) {
      setTimetable((prev) => prev.map((x) => (x.id === editingSlot ? { ...x, ...slotForm } : x)));
      toast.success("Timetable updated.");
    } else {
      const nextId = timetable.length ? Math.max(...timetable.map((x) => x.id)) + 1 : 1;
      setTimetable((prev) => [...prev, { id: nextId, ...slotForm }]);
      toast.success("Timetable slot added.");
    }
    setEditingSlot(null);
    setSlotForm({ time: "", mon: "", tue: "", wed: "", thu: "", fri: "" });
  };

  const createAnnouncement = () => {
    if (!newAnn.title.trim() || !newAnn.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    const nextId = announcements.length ? Math.max(...announcements.map((a) => a.id)) + 1 : 1;
    setAnnouncements((prev) => [{ id: nextId, title: newAnn.title, content: newAnn.content, priority: newAnn.priority, author: "Admin Office", date: new Date().toISOString().slice(0, 10) }, ...prev]);
    setNewAnn({ title: "", priority: "medium", content: "" });
    toast.success("Announcement published.");
  };

  const renderStudentDetail = (s: Student) => (
    <div>
      <button onClick={() => setSelectedStudent(null)} className="mb-4 flex items-center gap-2 text-sm text-primary hover:underline"><ChevronLeft className="h-4 w-4" />Back</button>
      <div className="mb-5 rounded-xl border border-border bg-card p-5">
        <h2 className="text-xl font-bold text-foreground">{s.name}</h2>
        <p className="text-sm text-muted-foreground">{studentCode(s.id)} | {s.grade} | {s.email}</p>
      </div>
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Current GPA</p><p className="text-2xl font-bold text-primary">{s.progress.at(-1)?.gpa.toFixed(2)}</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Attendance</p><p className="text-2xl font-bold text-info">{((s.attendance.present / s.attendance.total) * 100).toFixed(0)}%</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Pending Fee</p><p className="text-2xl font-bold text-destructive">Rs. {s.fees.pending.toLocaleString()}</p></div>
      </div>
      <div className="mb-5 overflow-hidden rounded-xl border border-border bg-card">
        <div className="p-4 font-semibold text-foreground">All Grades and Tests</div>
        <table className="w-full"><thead><tr className="border-b border-border">{["Subject", "Test", "Marks", "Grade", "Date"].map((h) => <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">{h}</th>)}</tr></thead>
          <tbody>{s.tests.map((t, i) => <tr key={i} className="border-b border-border last:border-0"><td className="px-4 py-2 text-sm">{t.subject}</td><td className="px-4 py-2 text-sm">{t.test}</td><td className="px-4 py-2 text-sm">{t.marks}/{t.total}</td><td className="px-4 py-2 text-sm">{t.grade}</td><td className="px-4 py-2 text-sm text-muted-foreground">{t.date}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="p-4 font-semibold text-foreground">Assignments</div>
        <table className="w-full"><thead><tr className="border-b border-border">{["Title", "Subject", "Due", "Status", "Score"].map((h) => <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">{h}</th>)}</tr></thead>
          <tbody>{s.assignments.map((a, i) => <tr key={i} className="border-b border-border last:border-0"><td className="px-4 py-2 text-sm">{a.title}</td><td className="px-4 py-2 text-sm">{a.subject}</td><td className="px-4 py-2 text-sm">{a.due}</td><td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${badge(a.status)}`}>{a.status}</span></td><td className="px-4 py-2 text-sm">{a.score}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );

  const renderTeacherDetail = (t: Teacher) => {
    const subjectStudents = STUDENTS.filter((s) => s.tests.some((x) => x.subject === t.subject));
    const assignments = TEACHER_ASSIGNMENTS.filter((a) => a.subject === t.subject);
    return (
      <div>
        <button onClick={() => setSelectedTeacher(null)} className="mb-4 flex items-center gap-2 text-sm text-primary hover:underline"><ChevronLeft className="h-4 w-4" />Back</button>
        <div className="mb-5 rounded-xl border border-border bg-card p-5">
          <h2 className="text-xl font-bold text-foreground">{t.name}</h2>
          <p className="text-sm text-muted-foreground">{t.subject} | {t.email} | Classes: {t.classes.join(", ")}</p>
        </div>
        <div className="mb-5 overflow-hidden rounded-xl border border-border bg-card">
          <div className="p-4 font-semibold text-foreground">Students in {t.subject} and Performance</div>
          <table className="w-full"><thead><tr className="border-b border-border">{["Student", "Student ID", "Class", "Average", "Attendance"].map((h) => <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>{subjectStudents.map((s) => { const tests = s.tests.filter((x) => x.subject === t.subject); const avg = tests.length ? tests.reduce((a, x) => a + (x.marks / x.total) * 100, 0) / tests.length : 0; return <tr key={s.id} className="border-b border-border last:border-0"><td className="px-4 py-2 text-sm">{s.name}</td><td className="px-4 py-2 text-sm text-muted-foreground">{studentCode(s.id)}</td><td className="px-4 py-2 text-sm">{s.grade}</td><td className="px-4 py-2 text-sm font-semibold">{avg.toFixed(0)}%</td><td className="px-4 py-2 text-sm">{((s.attendance.present / s.attendance.total) * 100).toFixed(0)}%</td></tr>; })}</tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{assignments.map((a) => { const submitted = a.submissions.filter((s) => s.status === "Submitted" || s.status === "Late").length; const missing = a.submissions.filter((s) => s.status === "Missing").length; return <div key={a.id} className="rounded-xl border border-border bg-card p-4"><p className="font-semibold text-foreground">{a.title}</p><p className="text-xs text-muted-foreground mt-1">Class {a.classGrade} | Due {a.dueDate}</p><div className="mt-2 flex gap-2"><span className="px-2 py-0.5 rounded-full text-xs bg-success/15 text-success">{submitted} submitted</span><span className="px-2 py-0.5 rounded-full text-xs bg-destructive/15 text-destructive">{missing} missing</span></div></div>; })}</div>
      </div>
    );
  };

  const renderContent = () => {
    if (selectedStudent) return renderStudentDetail(selectedStudent);
    if (selectedTeacher) return renderTeacherDetail(selectedTeacher);

    if (activeNav === "dashboard") {
      const pendingLeaves = leaveRequests.filter((x) => x.status === "Pending").length;
      const topStudents = [...STUDENTS].sort((a, b) => b.progress.at(-1)!.gpa - a.progress.at(-1)!.gpa).slice(0, 5);
      return (
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-6">Admin Control Center</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[{ label: "Students", value: STUDENTS.length }, { label: "Teachers", value: TEACHERS.length }, { label: "Pending Leaves", value: pendingLeaves }, { label: "Pending Fees", value: STUDENTS.filter((s) => s.fees.pending > 0).length }].map((x) => <div key={x.label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{x.label}</p><p className="text-2xl font-bold text-foreground">{x.value}</p></div>)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-4"><h3 className="font-semibold mb-3">Top Performers</h3>{topStudents.map((s) => <button key={s.id} onClick={() => setSelectedStudent(s)} className="w-full text-left flex items-center justify-between p-2 rounded hover:bg-muted/30"><span className="text-sm text-foreground">{s.name}</span><span className="text-sm font-bold text-primary">{s.progress.at(-1)?.gpa.toFixed(2)}</span></button>)}</div>
            <div className="rounded-xl border border-border bg-card p-4"><h3 className="font-semibold mb-3">Recent Announcements</h3>{announcements.slice(0, 4).map((a) => <div key={a.id} className="p-2 border-b border-border last:border-0"><p className="text-sm font-medium text-foreground">{a.title}</p><p className="text-xs text-muted-foreground">{a.date}</p></div>)}</div>
          </div>
        </div>
      );
    }

    if (activeNav === "students") {
      return (
        <div>
          <div className="flex items-center justify-between mb-5"><h1 className="text-2xl font-bold text-foreground">Student Management</h1><div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-card"><Search className="h-4 w-4 text-muted-foreground" /><input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} placeholder="Search by name or ID" className="bg-transparent outline-none text-sm" /></div></div>
          <div className="overflow-hidden rounded-xl border border-border bg-card"><table className="w-full"><thead><tr className="border-b border-border">{["Student", "Student ID", "Class", "GPA", "Fees"].map((h) => <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">{h}</th>)}</tr></thead><tbody>{filteredStudents.map((s) => <tr key={s.id} onClick={() => setSelectedStudent(s)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/30"><td className="px-4 py-2 text-sm">{s.name}</td><td className="px-4 py-2 text-sm text-muted-foreground">{studentCode(s.id)}</td><td className="px-4 py-2 text-sm">{s.grade}</td><td className="px-4 py-2 text-sm font-semibold">{s.progress.at(-1)?.gpa.toFixed(2)}</td><td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${badge(s.fees.status)}`}>{s.fees.status}</span></td></tr>)}</tbody></table></div>
        </div>
      );
    }

    if (activeNav === "teachers") {
      return (
        <div>
          <div className="flex items-center justify-between mb-5"><h1 className="text-2xl font-bold text-foreground">Teacher Management</h1><div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-card"><Search className="h-4 w-4 text-muted-foreground" /><input value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} placeholder="Search by teacher or subject" className="bg-transparent outline-none text-sm" /></div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filteredTeachers.map((t) => { const students = STUDENTS.filter((s) => s.tests.some((x) => x.subject === t.subject)); return <button key={t.id} onClick={() => setSelectedTeacher(t)} className="rounded-xl border border-border bg-card p-4 text-left hover:border-primary/40"><p className="font-semibold text-foreground">{t.name}</p><p className="text-sm text-muted-foreground">{t.subject}</p><p className="text-xs text-muted-foreground mt-2">Students in subject: {students.length}</p></button>; })}</div>
        </div>
      );
    }

    if (activeNav === "leaves") {
      return (
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-5">Leave Requests</h1>
          <div className="overflow-hidden rounded-xl border border-border bg-card"><table className="w-full"><thead><tr className="border-b border-border">{["Person", "Type", "Duration", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">{h}</th>)}</tr></thead><tbody>{leaveRequests.map((l) => <tr key={l.id} className="border-b border-border last:border-0"><td className="px-4 py-2 text-sm">{l.personName}<p className="text-xs text-muted-foreground">{l.personType}</p></td><td className="px-4 py-2 text-sm">{l.leaveType}</td><td className="px-4 py-2 text-sm text-muted-foreground">{l.from} to {l.to}</td><td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${badge(l.status)}`}>{l.status}</span></td><td className="px-4 py-2"><div className="flex gap-2"><button onClick={() => approveLeave(l.id, "Approved")} className="px-2 py-1 rounded bg-success text-success-foreground text-xs">Accept</button><button onClick={() => approveLeave(l.id, "Rejected")} className="px-2 py-1 rounded bg-destructive text-destructive-foreground text-xs">Deny</button></div></td></tr>)}</tbody></table></div>
        </div>
      );
    }

    if (activeNav === "timetable") {
      return (
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-5">Timetable Management</h1>
          <div className="rounded-xl border border-border bg-card p-4 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{(["time", "mon", "tue", "wed", "thu", "fri"] as (keyof TimetableEntry)[]).map((k) => <input key={k} placeholder={k.toUpperCase()} value={slotForm[k]} onChange={(e) => setSlotForm((p) => ({ ...p, [k]: e.target.value }))} className="border border-border rounded-lg px-3 py-2 text-sm bg-muted/30" />)}</div>
            <div className="flex gap-2 mt-3"><button onClick={saveSlot} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm flex items-center gap-2">{editingSlot ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editingSlot ? "Update" : "Create"}</button>{editingSlot && <button onClick={() => { setEditingSlot(null); setSlotForm({ time: "", mon: "", tue: "", wed: "", thu: "", fri: "" }); }} className="px-3 py-2 rounded-lg border border-border text-sm">Cancel</button>}</div>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card"><table className="w-full"><thead><tr className="border-b border-border">{["Time", "Mon", "Tue", "Wed", "Thu", "Fri", "Actions"].map((h) => <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">{h}</th>)}</tr></thead><tbody>{timetable.map((r) => <tr key={r.id} className="border-b border-border last:border-0"><td className="px-4 py-2 text-sm">{r.time}</td><td className="px-4 py-2 text-sm">{r.mon}</td><td className="px-4 py-2 text-sm">{r.tue}</td><td className="px-4 py-2 text-sm">{r.wed}</td><td className="px-4 py-2 text-sm">{r.thu}</td><td className="px-4 py-2 text-sm">{r.fri}</td><td className="px-4 py-2"><div className="flex gap-2"><button onClick={() => { setEditingSlot(r.id); setSlotForm({ time: r.time, mon: r.mon, tue: r.tue, wed: r.wed, thu: r.thu, fri: r.fri }); }} className="px-2 py-1 rounded bg-info text-info-foreground"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => setTimetable((p) => p.filter((x) => x.id !== r.id))} className="px-2 py-1 rounded bg-destructive text-destructive-foreground"><Trash2 className="h-3.5 w-3.5" /></button></div></td></tr>)}</tbody></table></div>
        </div>
      );
    }

    if (activeNav === "announcements") {
      return (
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-5">Announcement Management</h1>
          <div className="rounded-xl border border-border bg-card p-4 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><input value={newAnn.title} onChange={(e) => setNewAnn((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="sm:col-span-2 border border-border rounded-lg px-3 py-2 text-sm bg-muted/30" /><select value={newAnn.priority} onChange={(e) => setNewAnn((p) => ({ ...p, priority: e.target.value as "low" | "medium" | "high" }))} className="border border-border rounded-lg px-3 py-2 text-sm bg-muted/30"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
            <textarea value={newAnn.content} onChange={(e) => setNewAnn((p) => ({ ...p, content: e.target.value }))} rows={3} placeholder="Content" className="w-full mt-3 border border-border rounded-lg px-3 py-2 text-sm bg-muted/30 resize-none" />
            <button onClick={createAnnouncement} className="mt-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm flex items-center gap-2"><Plus className="h-4 w-4" />Publish</button>
          </div>
          <div className="space-y-3">{announcements.map((a) => <div key={a.id} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-3"><div><p className="font-semibold text-foreground">{a.title}</p><p className="text-sm text-muted-foreground mt-1">{a.content}</p><p className="text-xs text-muted-foreground mt-1">{a.date} | {a.author}</p></div><button onClick={() => setAnnouncements((p) => p.filter((x) => x.id !== a.id))} className="px-2 py-1 rounded bg-destructive text-destructive-foreground"><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div>
        </div>
      );
    }

    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-5">Fee Management</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">{[{ label: "Total Collected", value: STUDENTS.reduce((a, s) => a + s.fees.paid, 0) }, { label: "Total Pending", value: STUDENTS.reduce((a, s) => a + s.fees.pending, 0) }, { label: "Students with Dues", value: STUDENTS.filter((s) => s.fees.pending > 0).length }].map((x) => <div key={x.label} className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{x.label}</p><p className="text-2xl font-bold text-foreground">{typeof x.value === "number" && x.label !== "Students with Dues" ? `Rs. ${x.value.toLocaleString()}` : x.value}</p></div>)}</div>
        <div className="overflow-hidden rounded-xl border border-border bg-card"><table className="w-full"><thead><tr className="border-b border-border">{["Student", "ID", "Class", "Total", "Paid", "Pending", "Status"].map((h) => <th key={h} className="px-4 py-2 text-left text-xs text-muted-foreground">{h}</th>)}</tr></thead><tbody>{STUDENTS.map((s) => <tr key={s.id} className="border-b border-border last:border-0"><td className="px-4 py-2 text-sm">{s.name}</td><td className="px-4 py-2 text-sm text-muted-foreground">{studentCode(s.id)}</td><td className="px-4 py-2 text-sm">{s.grade}</td><td className="px-4 py-2 text-sm">Rs. {s.fees.total.toLocaleString()}</td><td className="px-4 py-2 text-sm text-success">Rs. {s.fees.paid.toLocaleString()}</td><td className="px-4 py-2 text-sm text-destructive">Rs. {s.fees.pending.toLocaleString()}</td><td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${badge(s.fees.status)}`}>{s.fees.status}</span></td></tr>)}</tbody></table></div>
      </div>
    );
  };

  return (
    <PortalLayout
      role="Administrator"
      userName="Admin User"
      userAvatar="AU"
      navItems={navItems}
      activeNav={activeNav}
      onNavChange={(id) => {
        setActiveNav(id);
        setSelectedStudent(null);
        setSelectedTeacher(null);
      }}
    >
      {renderContent()}
    </PortalLayout>
  );
};

export default AdminPortal;
