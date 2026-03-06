import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Student } from "@/data/mockData";
import type { AdminTeacherRecord } from "@/components/admin/teacher/AdminTeacher";
import type { PlannerAllocation } from "@/components/admin/types";

interface Props {
  students: Student[];
  teachers: AdminTeacherRecord[];
  allocations: PlannerAllocation[];
  onAllocationsChange: (next: PlannerAllocation[]) => void;
}

const DAYS: PlannerAllocation["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DEFAULT_SUBJECTS = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Urdu",
  "Computer Science",
  "Biology",
];

const AdminTimetablePlanner = ({
  students,
  teachers,
  allocations,
  onAllocationsChange,
}: Props) => {
  const [day, setDay] = useState<PlannerAllocation["day"]>("Mon");
  const [time, setTime] = useState("8:00 AM - 8:45 AM");
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");

  const [customClasses, setCustomClasses] = useState<string[]>([]);
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);

  const classOptions = useMemo(() => {
    const fromStudents = students.map((s) => s.grade);
    const fromAllocations = allocations.map((a) => a.className);
    return Array.from(new Set([...fromStudents, ...fromAllocations, ...customClasses])).sort();
  }, [students, allocations, customClasses]);

  const subjectOptions = useMemo(() => {
    const fromTeachers = teachers.flatMap((t) =>
      t.subject
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
    const fromAllocations = allocations.map((a) => a.subject);
    return Array.from(
      new Set([...DEFAULT_SUBJECTS, ...fromTeachers, ...fromAllocations, ...customSubjects])
    ).sort();
  }, [teachers, allocations, customSubjects]);

  const conflicts = useMemo(
    () =>
      allocations.filter((slot, idx) =>
        allocations.some(
          (other, j) =>
            j !== idx &&
            slot.day === other.day &&
            slot.time === other.time &&
            slot.teacherId === other.teacherId &&
            slot.className !== other.className
        )
      ),
    [allocations]
  );

  const addAllocation = () => {
    const numericTeacherId = Number(teacherId);
    const selectedTeacher = teachers.find((t) => t.id === numericTeacherId);
    if (!selectedTeacher || !className || !subject || !time) {
      toast.error("Select teacher, class, subject, day and time.");
      return;
    }

    const next: PlannerAllocation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      day,
      time,
      className,
      subject,
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
    };

    const hasTeacherConflict = allocations.some(
      (slot) =>
        slot.day === next.day &&
        slot.time === next.time &&
        slot.teacherId === next.teacherId &&
        slot.className !== next.className
    );
    const hasClassConflict = allocations.some(
      (slot) =>
        slot.day === next.day &&
        slot.time === next.time &&
        slot.className === next.className
    );

    if (hasClassConflict) {
      toast.error("Class timetable conflict: this class already has a subject in this slot.");
      return;
    }

    onAllocationsChange([next, ...allocations]);
    if (hasTeacherConflict) {
      toast.warning("Allocation added, but teacher conflict detected. Review conflicts below.");
      return;
    }
    toast.success("Allocation added without conflicts.");
  };

  const addNewClass = () => {
    const value = newClassName.trim();
    if (!value) {
      toast.error("Enter a class name.");
      return;
    }
    if (classOptions.some((c) => c.toLowerCase() === value.toLowerCase())) {
      toast.error("Class already exists.");
      return;
    }
    setCustomClasses((prev) => [...prev, value]);
    setClassName(value);
    setNewClassName("");
    toast.success("New class added.");
  };

  const addNewSubject = () => {
    const value = newSubjectName.trim();
    if (!value) {
      toast.error("Enter a subject name.");
      return;
    }
    if (subjectOptions.some((s) => s.toLowerCase() === value.toLowerCase())) {
      toast.error("Subject already exists.");
      return;
    }
    setCustomSubjects((prev) => [...prev, value]);
    setSubject(value);
    setNewSubjectName("");
    toast.success("New subject added.");
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-foreground">Timetable + Workload Planner</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="font-semibold text-foreground">Add New Class</p>
          <div className="flex gap-2">
            <input
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. 12-A"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={addNewClass}
              className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              Add Class
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="font-semibold text-foreground">Add New Subject</p>
          <div className="flex gap-2">
            <input
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="e.g. Pak Studies"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={addNewSubject}
              className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              Add Subject
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <select
            value={day}
            onChange={(e) => setDay(e.target.value as PlannerAllocation["day"])}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="Time Slot"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Class</option>
            {classOptions.map((cn) => (
              <option key={cn} value={cn}>
                {cn}
              </option>
            ))}
          </select>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Subject</option>
            {subjectOptions.map((sn) => (
              <option key={sn} value={sn}>
                {sn}
              </option>
            ))}
          </select>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addAllocation}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Add Allocation
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-semibold text-foreground mb-3">Conflict Alerts ({conflicts.length})</p>
        <div className="space-y-2">
          {conflicts.length === 0 && (
            <p className="text-sm text-muted-foreground">No scheduling conflicts detected.</p>
          )}
          {conflicts.map((slot) => (
            <div
              key={`conflict-${slot.id}`}
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm"
            >
              {slot.teacherName} conflict on {slot.day} {slot.time} between classes.
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Day", "Time", "Class", "Subject", "Teacher", "Actions"].map((head) => (
                <th key={head} className="px-4 py-2 text-left text-xs text-muted-foreground">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allocations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-sm text-muted-foreground">
                  No allocations yet.
                </td>
              </tr>
            )}
            {allocations.map((slot) => (
              <tr key={slot.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2 text-sm">{slot.day}</td>
                <td className="px-4 py-2 text-sm">{slot.time}</td>
                <td className="px-4 py-2 text-sm">{slot.className}</td>
                <td className="px-4 py-2 text-sm">{slot.subject}</td>
                <td className="px-4 py-2 text-sm">{slot.teacherName}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => onAllocationsChange(allocations.filter((x) => x.id !== slot.id))}
                    className="rounded-md border border-border px-2 py-1 text-xs"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTimetablePlanner;
