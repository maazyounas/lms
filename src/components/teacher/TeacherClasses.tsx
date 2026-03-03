import { useState } from "react";
import { ArrowLeft, Users, BookOpen, TrendingUp, Clock } from "lucide-react";
import { STUDENTS, COURSES, type Teacher, type Course } from "@/data/mockData";

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
  const [studentTab, setStudentTab] = useState<"performance" | "attendance">("performance");

  if (selectedClass) {
    // Get students in this class grade
    const classStudents = STUDENTS; // all students for demo
    const avgScore = classStudents.length > 0
      ? (classStudents.reduce((a, s) => {
          const t = s.tests.find((t) => t.subject === teacher.subject && t.test === "Mid-Term");
          return a + (t ? (t.marks / t.total) * 100 : 0);
        }, 0) / classStudents.length).toFixed(0)
      : "0";

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

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(["performance", "attendance"] as const).map((t) => (
            <button key={t} onClick={() => setStudentTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${studentTab === t ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Student Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {studentTab === "performance"
                    ? ["Student", "Grade", "Mid-Term", "Quiz", "Average", "Grade"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
                      ))
                    : ["Student", "Grade", "Present", "Absent", "Late", "Rate"].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
                      ))
                  }
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s) => {
                  const subTests = s.tests.filter((t) => t.subject === teacher.subject);
                  const midTerm = subTests.find((t) => t.test === "Mid-Term");
                  const quiz = subTests.find((t) => t.test !== "Mid-Term" && t.test !== "Lab Practical");
                  const avg = subTests.length > 0 ? subTests.reduce((a, t) => a + (t.marks / t.total) * 100, 0) / subTests.length : 0;
                  const attRate = ((s.attendance.present / s.attendance.total) * 100).toFixed(0);

                  return (
                    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{s.avatar}</div>
                          <span className="text-sm font-medium text-foreground">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-foreground">{s.grade}</td>
                      {studentTab === "performance" ? (
                        <>
                          <td className="px-5 py-3 text-sm text-foreground">{midTerm ? `${midTerm.marks}/${midTerm.total}` : "-"}</td>
                          <td className="px-5 py-3 text-sm text-foreground">{quiz ? `${quiz.marks}/${quiz.total}` : "-"}</td>
                          <td className="px-5 py-3">
                            <span className={`text-sm font-bold ${avg >= 80 ? "text-success" : avg >= 60 ? "text-warning" : "text-destructive"}`}>{avg.toFixed(0)}%</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-sm font-bold ${midTerm ? gradeColor(midTerm.grade) : "text-muted-foreground"}`}>{midTerm?.grade || "-"}</span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3 text-sm text-success">{s.attendance.present}</td>
                          <td className="px-5 py-3 text-sm text-destructive">{s.attendance.absent}</td>
                          <td className="px-5 py-3 text-sm text-warning">{s.attendance.late}</td>
                          <td className="px-5 py-3">
                            <span className={`text-sm font-bold ${Number(attRate) >= 90 ? "text-success" : Number(attRate) >= 75 ? "text-warning" : "text-destructive"}`}>{attRate}%</span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
