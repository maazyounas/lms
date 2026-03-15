import { useState } from "react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import {
  TEACHER_ASSIGNMENTS,
  type Teacher,
  type TeacherAssignment,
} from "@/data/mockData";
import { toast } from "sonner";
import CreateAssignmentView, {
  type NewAssignmentDraft,
} from "./create/CreateAssignmentView";
import AssignmentDetailView from "./detail/AssignmentDetailView";
import AssignmentsListView from "./list/AssignmentsListView";

interface Props {
  teacher: Teacher;
}

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    Submitted: "bg-success/15 text-success",
    Late: "bg-warning/15 text-warning",
    Missing: "bg-destructive/15 text-destructive",
    Pending: "bg-muted text-muted-foreground",
  };
  return map[s] || "bg-muted text-muted-foreground";
};

const statusIcon = (s: string) => {
  if (s === "Submitted") return <CheckCircle className="h-3.5 w-3.5" />;
  if (s === "Late") return <Clock className="h-3.5 w-3.5" />;
  if (s === "Missing") return <XCircle className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
};

const TeacherAssignments = ({ teacher }: Props) => {
  const [assignments, setAssignments] = useState(
    TEACHER_ASSIGNMENTS.filter((a) => a.subject === teacher.subject),
  );

  const [view, setView] = useState<"list" | "detail" | "create">("list");
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherAssignment | null>(null);

  const [gradingStudent, setGradingStudent] = useState<number | null>(null);
  const [gradingMarks, setGradingMarks] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");

  const [filterClass, setFilterClass] = useState<string>("all");

  const [newAssignment, setNewAssignment] = useState<NewAssignmentDraft>({
    title: "",
    classGrade: teacher.classes[0] || "10-A",
    dueDate: "",
    totalMarks: 20,
    description: "",
    question: "",
    chapterName: "",
    chapterNumber: 1,
    submissionType: "Handwritten" as "Handwritten" | "Word" | "PDF",
    instructions: "",
    assignedStudentIds: [],
  });

  const filteredAssignments =
    filterClass === "all"
      ? assignments
      : assignments.filter((a) => a.classGrade === filterClass);

  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.dueDate || !newAssignment.question || !newAssignment.instructions) {
      toast.error("Please fill all required fields!");
      return;
    }

    const newA: TeacherAssignment = {
      id: assignments.length + 100,
      title: newAssignment.title,
      subject: teacher.subject,
      classGrade: newAssignment.classGrade,
      dueDate: newAssignment.dueDate,
      totalMarks: newAssignment.totalMarks,
      description: newAssignment.description,
      createdDate: new Date().toISOString().split("T")[0],
      submissions: [],
      question: newAssignment.question,
      chapterName: newAssignment.chapterName,
      chapterNumber: newAssignment.chapterNumber,
      submissionType: newAssignment.submissionType,
      instructions: newAssignment.instructions,
      assignedStudentIds: newAssignment.assignedStudentIds,
    };

    setAssignments([newA, ...assignments]);
    setNewAssignment({
      title: "",
      classGrade: teacher.classes[0] || "10-A",
      dueDate: "",
      totalMarks: 20,
      description: "",
      question: "",
      chapterName: "",
      chapterNumber: 1,
      submissionType: "Handwritten",
      instructions: "",
      assignedStudentIds: [],
    });

    setView("list");
    toast.success("Assignment created successfully!");
  };

  const handleGradeSubmission = () => {
    if (!selectedAssignment || gradingStudent === null) return;

    const marks = Number(gradingMarks);
    if (isNaN(marks) || marks < 0 || marks > selectedAssignment.totalMarks) {
      toast.error(`Marks must be between 0 and ${selectedAssignment.totalMarks}`);
      return;
    }

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === selectedAssignment.id
          ? {
              ...a,
              submissions: a.submissions.map((s) =>
                s.studentId === gradingStudent ? { ...s, marks, feedback: gradingFeedback } : s,
              ),
            }
          : a,
      ),
    );

    setSelectedAssignment((prev) =>
      prev
        ? {
            ...prev,
            submissions: prev.submissions.map((s) =>
              s.studentId === gradingStudent ? { ...s, marks, feedback: gradingFeedback } : s,
            ),
          }
        : null,
    );

    setGradingStudent(null);
    setGradingMarks("");
    setGradingFeedback("");
    toast.success("Marks saved successfully!");
  };

  if (view === "create") {
    return (
      <CreateAssignmentView
        teacher={teacher}
        newAssignment={newAssignment}
        onChange={setNewAssignment}
        onCreate={handleCreateAssignment}
        onBack={() => setView("list")}
      />
    );
  }

  if (view === "detail" && selectedAssignment) {
    return (
      <AssignmentDetailView
        selectedAssignment={selectedAssignment}
        gradingStudent={gradingStudent}
        gradingMarks={gradingMarks}
        gradingFeedback={gradingFeedback}
        onBack={() => {
          setView("list");
          setSelectedAssignment(null);
          setGradingStudent(null);
        }}
        onSaveMarks={handleGradeSubmission}
        onSetGradingStudent={setGradingStudent}
        onSetGradingMarks={setGradingMarks}
        onSetGradingFeedback={setGradingFeedback}
        statusColor={statusColor}
        statusIcon={statusIcon}
      />
    );
  }

  return (
    <AssignmentsListView
      teacher={teacher}
      assignments={filteredAssignments}
      filterClass={filterClass}
      onFilterClass={setFilterClass}
      onCreate={() => setView("create")}
      onSelectAssignment={(assignment) => {
        setSelectedAssignment(assignment);
        setView("detail");
      }}
    />
  );
};

export default TeacherAssignments;
