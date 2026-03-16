import { useEffect, useMemo, useState } from "react";
import { STUDENTS } from "@/data/mockData";
import AttendanceDetails from "./components/AttendanceDetails";
import AttendanceFilters from "./components/AttendanceFilters";
import StudentList from "./components/StudentList";
import type {
  AdminAttendanceProps,
  AttendanceRecord,
  AttendanceStatus,
} from "./types/attendance";
import { buildAttendanceLog } from "./utils/buildAttendanceLog";

const AdminAttendance = ({ students = STUDENTS }: AdminAttendanceProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("All Classes");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<AttendanceStatus | null>(
    null
  );
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>("All Subjects");
  const [attendanceLogs, setAttendanceLogs] = useState<
    Record<number, AttendanceRecord[]>
  >(() => {
    const initial: Record<number, AttendanceRecord[]> = {};
    students.forEach((student) => {
      initial[student.id] = buildAttendanceLog(student);
    });
    return initial;
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const classOptions = useMemo(() => {
    const set = new Set(students.map((student) => student.grade));
    return ["All Classes", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const classMatch = selectedClass === "All Classes" || student.grade === selectedClass;
      if (!classMatch) return false;
      if (!normalizedQuery) return true;
      const nameMatch = student.name.toLowerCase().includes(normalizedQuery);
      const idMatch = `${student.id}`.includes(normalizedQuery);
      return nameMatch || idMatch;
    });
  }, [normalizedQuery, selectedClass, students]);

  useEffect(() => {
    setAttendanceLogs((prev) => {
      const next = { ...prev };
      students.forEach((student) => {
        if (!next[student.id]) {
          next[student.id] = buildAttendanceLog(student);
        }
      });
      return next;
    });
  }, [students]);

  useEffect(() => {
    if (selectedStudentId && !students.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(null);
    }
  }, [selectedStudentId, students]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;
  const selectedLog = useMemo(() => {
    if (!selectedStudent) return [];
    return attendanceLogs[selectedStudent.id] ?? [];
  }, [attendanceLogs, selectedStudent]);
  const subjectOptions = useMemo(() => {
    if (!selectedStudent) return ["All Subjects"];
    const courseSet = new Set<string>();
    selectedLog.forEach((record) => courseSet.add(record.className));
    return ["All Subjects", ...Array.from(courseSet).sort((a, b) => a.localeCompare(b))];
  }, [selectedLog, selectedStudent]);

  const subjectFilteredLog = useMemo(() => {
    if (!selectedStudent) return [];
    if (activeSubjectFilter === "All Subjects") return selectedLog;
    return selectedLog.filter((record) => record.className === activeSubjectFilter);
  }, [activeSubjectFilter, selectedLog, selectedStudent]);

  const statusCounts = useMemo(() => {
    return subjectFilteredLog.reduce(
      (acc, record) => {
        acc[record.status] += 1;
        return acc;
      },
      { Present: 0, Absent: 0, Late: 0, Leave: 0 } as Record<AttendanceStatus, number>
    );
  }, [subjectFilteredLog]);

  const visibleRecords = useMemo(() => {
    if (!activeStatusFilter) return subjectFilteredLog;
    return subjectFilteredLog.filter((record) => record.status === activeStatusFilter);
  }, [activeStatusFilter, subjectFilteredLog]);

  const updateRecordStatus = (recordId: string, status: AttendanceStatus) => {
    if (!selectedStudent) return;
    setAttendanceLogs((prev) => {
      const current = prev[selectedStudent.id] ?? [];
      const next = current.map((record) =>
        record.id === recordId ? { ...record, status } : record
      );
      return { ...prev, [selectedStudent.id]: next };
    });
  };

  return (
    <div>

      <AttendanceFilters
        selectedClass={selectedClass}
        onSelectClass={setSelectedClass}
        classOptions={classOptions}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        filteredCount={filteredStudents.length}
        totalCount={students.length}
      />

      <StudentList
        students={filteredStudents}
        onSelectStudent={(student) => {
          setSelectedStudentId(student.id);
          setActiveStatusFilter(null);
          setActiveSubjectFilter("All Subjects");
        }}
      />

      {selectedStudent && (
        <AttendanceDetails
          selectedStudent={selectedStudent}
          subjectOptions={subjectOptions}
          activeSubjectFilter={activeSubjectFilter}
          onSubjectFilterChange={setActiveSubjectFilter}
          statusCounts={statusCounts}
          activeStatusFilter={activeStatusFilter}
          onStatusFilterChange={setActiveStatusFilter}
          visibleRecords={visibleRecords}
          subjectFilteredTotal={subjectFilteredLog.length}
          onClose={() => setSelectedStudentId(null)}
          onUpdateRecordStatus={updateRecordStatus}
        />
      )}
    </div>
  );
};

export default AdminAttendance;
