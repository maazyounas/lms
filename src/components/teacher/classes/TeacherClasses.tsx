import { useState } from "react";
import { ArrowLeft, Users, BookOpen, TrendingUp, Clock, ChevronDown, ChevronUp, FileText, Download, Eye } from "lucide-react";
import { STUDENTS, COURSES, TEACHER_ASSIGNMENTS, type Teacher, type Course, type Student, type StudentAssignment } from "@/data/mockData";

interface Props {
  teacher: Teacher;
  selectedClass: Course | null;
  onSelectClass: (course: Course | null) => void;
}

const gradeColor = (g: string) => {
  if (g.startsWith("A")) return "text-success";
  if (g.startsWith("B")) return "text-info";
  if (g.startsWith("C")) return "text-warning";
  return "text-destructive";
};

const TeacherClasses = ({ teacher, selectedClass, onSelectClass }: Props) => {
  const myCourses = COURSES.filter((c) => c.teacher === teacher.name);
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

  if (selectedClass) {
    // Get students in this class grade (for demo, we use all students)
    const classStudents = STUDENTS; // all students for demo
    const avgScore = classStudents.length > 0
      ? (classStudents.reduce((a, s) => {
          const t = s.tests.find((t) => t.subject === teacher.subject && t.test === "Mid-Term");
          return a + (t ? (t.marks / t.total) * 100 : 0);
        }, 0) / classStudents.length).toFixed(0)
      : "0";

    const toggleStudent = (studentId: number) => {
      setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
    };

    return (
      <div>
        <button onClick={() => onSelectClass(null)} className="flex items-center gap-2 text-primary text-sm hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Classes
        </button>

        {/* Class Header */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{selectedClass.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{selectedClass.code} · {selectedClass.room}</p>
            </div>
            <div className="flex gap-4">
              {[
                { label: "Students", value: classStudents.length, icon: Users },
                { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp },
                { label: "Progress", value: `${selectedClass.progress}%`, icon: BookOpen },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" /> {selectedClass.schedule}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Syllabus Completion</span>
              <span className="text-foreground font-medium">{selectedClass.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${selectedClass.progress}%` }} />
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-3">
          {classStudents.map((s) => {
            const subTests = s.tests.filter((t) => t.subject === teacher.subject);
            const midTerm = subTests.find((t) => t.test === "Mid-Term");
            const quiz = subTests.find((t) => t.test !== "Mid-Term" && t.test !== "Lab Practical");
            const avg = subTests.length > 0 ? subTests.reduce((a, t) => a + (t.marks / t.total) * 100, 0) / subTests.length : 0;

            // Filter assignments for this teacher's subject
            const subjectAssignments = s.assignments.filter(a => a.subject === teacher.subject);

            // Also include submissions from TEACHER_ASSIGNMENTS if needed (but they might duplicate)
            // We'll just use student's own assignments array as it's comprehensive.

            const isExpanded = expandedStudentId === s.id;

            return (
              <div key={s.id} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Student Row (clickable) */}
                <div
                  onClick={() => toggleStudent(s.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {s.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">ID: STU-{String(s.id).padStart(4, "0")} · Grade: {s.grade}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`text-sm font-bold ${avg >= 80 ? "text-success" : avg >= 60 ? "text-warning" : "text-destructive"}`}>
                        {avg.toFixed(0)}% Avg
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border p-4 bg-muted/10">
                    <h4 className="font-semibold text-foreground mb-3">📝 Tests & Quizzes</h4>
                    {subTests.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tests recorded.</p>
                    ) : (
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30">
                            <tr>
                              <th className="text-left p-2">Test</th>
                              <th className="text-left p-2">Marks</th>
                              <th className="text-left p-2">Total</th>
                              <th className="text-left p-2">%</th>
                              <th className="text-left p-2">Grade</th>
                              <th className="text-left p-2">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subTests.map((test, idx) => (
                              <tr key={idx} className="border-b border-border">
                                <td className="p-2 font-medium">{test.test}</td>
                                <td className="p-2">{test.marks}</td>
                                <td className="p-2">{test.total}</td>
                                <td className="p-2">{((test.marks / test.total) * 100).toFixed(0)}%</td>
                                <td className={`p-2 font-bold ${gradeColor(test.grade)}`}>{test.grade}</td>
                                <td className="p-2">{new Date(test.date).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <h4 className="font-semibold text-foreground mb-3">📂 Assignments</h4>
                    {subjectAssignments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No assignments for this subject.</p>
                    ) : (
                      <div className="space-y-3">
                        {subjectAssignments.map((ass, idx) => (
                          <div key={idx} className="bg-card border border-border rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-foreground">{ass.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Due: {new Date(ass.due).toLocaleDateString()} · Status: 
                                  <span className={`ml-1 ${ass.status === "Submitted" ? "text-success" : ass.status === "Late" ? "text-destructive" : "text-warning"}`}>
                                    {ass.status}
                                  </span>
                                </p>
                                {ass.question && <p className="text-sm mt-1">{ass.question}</p>}
                                {ass.totalMarks && <p className="text-xs text-muted-foreground mt-1">Total Marks: {ass.totalMarks}</p>}
                                {ass.score && <p className="text-sm font-semibold mt-1">Score: {ass.score}</p>}
                              </div>
                              {/* If there's a file associated, show view button */}
                              {/* In mock data, assignments don't have file links, but we can simulate */}
                              {ass.status === "Submitted" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // In a real app, this would open the PDF
                                    alert(`Viewing submission for ${ass.title} (simulated PDF)`);
                                  }}
                                  className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                  title="View Submission"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            {/* Additional metadata */}
                            {(ass.chapterName || ass.submissionType) && (
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {ass.chapterName && <span>📘 {ass.chapterName}</span>}
                                {ass.submissionType && <span>📎 {ass.submissionType}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Option to recheck/give feedback - could be a button */}
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to grading or open assignment review
                          alert(`Recheck/grading for ${s.name} - feature coming soon`);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        Grade / Recheck
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Classes list
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Classes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myCourses.map((c) => {
          const classStudents = STUDENTS;
          const avgScore = (classStudents.reduce((a, s) => {
            const t = s.tests.find((t) => t.subject === teacher.subject && t.test === "Mid-Term");
            return a + (t ? (t.marks / t.total) * 100 : 0);
          }, 0) / classStudents.length).toFixed(0);

          return (
            <button
              key={c.id}
              onClick={() => onSelectClass(c)}
              className="text-left bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.code}</p>
                </div>
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md">{c.credits} credits</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>📍 {c.room}</p>
                <p>🕐 {c.schedule}</p>
                <p>👥 {classStudents.length} students</p>
                <p>📊 Avg Score: {avgScore}%</p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Syllabus Progress</span>
                  <span className="text-foreground font-medium">{c.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherClasses;