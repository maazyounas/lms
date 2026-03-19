import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ClipboardCheck, Timer } from "lucide-react";
import type { Student } from "@/data/mockData";
import { getEnrolledCourses } from "@/components/admin/fee/utils/feeUtils";
import { cambridgeGradeColor, percentageToCambridgeGrade } from "@/lib/grades";

type Option = {
  id: string;
  text: string;
};

type Question = {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string | null;
};

type TeacherQuiz = {
  id: string;
  title: string;
  description: string;
  classGrade: string;
  chapterName: string;
  topicName: string;
  dueDate: string;
  questions: Question[];
  teacherName?: string;
  teacherId?: number;
  subject?: string;
  createdAt?: string;
};

type QuizSubmission = {
  id: string;
  quizId: string;
  studentId: number;
  submittedAt: string;
  answers: Record<string, string>;
  score: number;
  total: number;
  subject?: string;
  teacherName?: string;
  checked: boolean;
};

type Props = {
  student: Student;
};

const quizStorageKey = "teacher-quizzes";
const submissionStorageKey = "quiz-submissions";

const StudentQuizzes = ({ student }: Props) => {
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewSubmissionId, setReviewSubmissionId] = useState<string | null>(null);
  const [visibleAvailable, setVisibleAvailable] = useState(6);
  const [visibleSubmissions, setVisibleSubmissions] = useState(6);

  const enrolledSubjects = useMemo(() => getEnrolledCourses(student), [student]);

  const quizzes = useMemo(() => {
    const raw = localStorage.getItem(quizStorageKey);
    const parsed = raw ? (JSON.parse(raw) as TeacherQuiz[]) : [];
    return parsed.filter((quiz) => quiz.classGrade === student.grade);
  }, [student.grade]);

  const submissions = useMemo(() => {
    const raw = localStorage.getItem(submissionStorageKey);
    const parsed = raw ? (JSON.parse(raw) as QuizSubmission[]) : [];
    return parsed.filter((sub) => sub.studentId === student.id);
  }, [student.id]);

  const filteredQuizzes = useMemo(() => {
    if (selectedSubject === "all") return quizzes;
    return quizzes.filter((quiz) => quiz.subject === selectedSubject);
  }, [quizzes, selectedSubject]);

  useEffect(() => {
    setVisibleAvailable(6);
  }, [selectedSubject, quizzes.length]);

  useEffect(() => {
    setVisibleSubmissions(6);
  }, [submissions.length]);

  const submittedQuizIds = useMemo(
    () => new Set(submissions.map((sub) => sub.quizId)),
    [submissions]
  );

  const availableQuizzes = useMemo(
    () => filteredQuizzes.filter((quiz) => !submittedQuizIds.has(quiz.id)),
    [filteredQuizzes, submittedQuizIds]
  );

  const selectedQuiz = useMemo(
    () => filteredQuizzes.find((quiz) => quiz.id === activeQuizId) || null,
    [filteredQuizzes, activeQuizId]
  );

  const reviewSubmission = useMemo(
    () => submissions.find((sub) => sub.id === reviewSubmissionId) || null,
    [submissions, reviewSubmissionId]
  );

  const reviewQuiz = useMemo(() => {
    if (!reviewSubmission) return null;
    return quizzes.find((quiz) => quiz.id === reviewSubmission.quizId) || null;
  }, [reviewSubmission, quizzes]);

  const summary = useMemo(() => {
    if (submissions.length === 0) {
      return { total: 0, avg: 0 };
    }
    const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
    const totalQuestions = submissions.reduce((sum, s) => sum + s.total, 0);
    const avg = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    return { total: submissions.length, avg };
  }, [submissions]);

  const handleStartQuiz = (quiz: TeacherQuiz) => {
    setActiveQuizId(quiz.id);
    setAnswers({});
    setReviewSubmissionId(null);
  };

  const handleSubmitQuiz = () => {
    if (!selectedQuiz) return;
    const total = selectedQuiz.questions.length;
    if (total === 0) {
      toast.error("This quiz has no questions.");
      return;
    }
    const answeredCount = selectedQuiz.questions.filter((q) => answers[q.id]).length;
    if (answeredCount < total) {
      toast.error("Answer all questions before submitting.");
      return;
    }

    const score = selectedQuiz.questions.reduce((sum, q) => {
      const picked = answers[q.id];
      return picked && picked === q.correctOptionId ? sum + 1 : sum;
    }, 0);

    const newSubmission: QuizSubmission = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      quizId: selectedQuiz.id,
      studentId: student.id,
      submittedAt: new Date().toISOString(),
      answers,
      score,
      total,
      subject: selectedQuiz.subject,
      teacherName: selectedQuiz.teacherName,
      checked: true,
    };

    const raw = localStorage.getItem(submissionStorageKey);
    const existing = raw ? (JSON.parse(raw) as QuizSubmission[]) : [];
    localStorage.setItem(submissionStorageKey, JSON.stringify([newSubmission, ...existing]));

    toast.success("Quiz submitted to teacher.");
    setActiveQuizId(null);
    setAnswers({});
    setReviewSubmissionId(newSubmission.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Quizzes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Attempt quizzes created by your teachers and review your results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <ClipboardCheck className="h-4 w-4" /> Available Quizzes
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{availableQuizzes.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CheckCircle2 className="h-4 w-4" /> Completed
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{summary.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Timer className="h-4 w-4" /> Average Score
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold text-foreground">{summary.avg}%</p>
            {summary.total > 0 && (
              <span
                className={`text-sm font-semibold ${cambridgeGradeColor(
                  percentageToCambridgeGrade(summary.avg)
                )}`}
              >
                {percentageToCambridgeGrade(summary.avg)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSubject("all")}
          className={`rounded-full px-3 py-1.5 text-xs border ${
            selectedSubject === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          All Subjects
        </button>
        {enrolledSubjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={`rounded-full px-3 py-1.5 text-xs border ${
              selectedSubject === subject
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Available Quizzes</h3>
            {availableQuizzes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No quizzes available. If this looks wrong, check your class and subject filters.
              </p>
            ) : (
              <div className="space-y-3">
                {availableQuizzes.slice(0, visibleAvailable).map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => handleStartQuiz(quiz)}
                    className="w-full text-left rounded-lg border border-border bg-background p-3 hover:border-primary/60 transition-colors"
                  >
                    <p className="text-sm font-semibold text-foreground">{quiz.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quiz.subject || "Subject"} · {quiz.chapterName} · {quiz.topicName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {quiz.dueDate} · {quiz.questions.length} Qs
                    </p>
                  </button>
                ))}
                {availableQuizzes.length > visibleAvailable && (
                  <button
                    onClick={() => setVisibleAvailable((prev) => prev + 6)}
                    className="text-xs text-primary hover:underline text-left"
                  >
                    Show more quizzes
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Past Performance</h3>
            {submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No submissions yet. Attempt a quiz and your results will appear here.
              </p>
            ) : (
              <div className="space-y-2">
                {submissions.slice(0, visibleSubmissions).map((sub) => {
                  const percentage = Math.round((sub.score / sub.total) * 100);
                  const grade = percentageToCambridgeGrade(percentage);
                  return (
                  <div
                    key={sub.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {sub.subject || "Subject"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sub.submittedAt).toLocaleDateString("en-PK", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {sub.score}/{sub.total}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage}%
                          <span className={`ml-2 font-semibold ${cambridgeGradeColor(grade)}`}>
                            {grade}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setReviewSubmissionId(sub.id);
                        setActiveQuizId(null);
                      }}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      Review Attempt
                    </button>
                  </div>
                  );
                })}
                {submissions.length > visibleSubmissions && (
                  <button
                    onClick={() => setVisibleSubmissions((prev) => prev + 6)}
                    className="text-xs text-primary hover:underline text-left"
                  >
                    Show more submissions
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {!selectedQuiz && !reviewSubmission && (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Select a quiz to start or review a past attempt.
            </div>
          )}

          {selectedQuiz && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{selectedQuiz.title}</h2>
                {selectedQuiz.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedQuiz.description}</p>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {selectedQuiz.subject || "Subject"} · {selectedQuiz.chapterName} ·{" "}
                  {selectedQuiz.topicName} · Due {selectedQuiz.dueDate}
                </div>
              </div>

              <div className="space-y-4">
                {selectedQuiz.questions.map((q, index) => (
                  <div key={q.id} className="rounded-lg border border-border bg-background p-4">
                    <p className="font-medium text-foreground">
                      {index + 1}. {q.text}
                    </p>
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                            answers[q.id] === opt.id
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`answer-${q.id}`}
                            checked={answers[q.id] === opt.id}
                            onChange={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                            }
                            className="text-primary"
                          />
                          {opt.text}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveQuizId(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  Submit to Teacher
                </button>
              </div>
            </div>
          )}

          {reviewSubmission && reviewQuiz && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Review</h2>
                  <p className="text-sm text-muted-foreground">
                    {reviewQuiz.title} · {reviewSubmission.score}/{reviewSubmission.total}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted {new Date(reviewSubmission.submittedAt).toLocaleString("en-PK")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    reviewSubmission.checked
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {reviewSubmission.checked ? "Checked" : "Pending"}
                </span>
              </div>

              {!reviewSubmission.checked ? (
                <p className="text-sm text-muted-foreground">
                  Your teacher has not checked this quiz yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviewQuiz.questions.map((q, index) => {
                    const selected = reviewSubmission.answers[q.id];
                    return (
                      <div key={q.id} className="rounded-lg border border-border bg-background p-4">
                        <p className="font-medium text-foreground">
                          {index + 1}. {q.text}
                        </p>
                        <div className="mt-3 space-y-2">
                          {q.options.map((opt) => {
                            const isCorrect = opt.id === q.correctOptionId;
                            const isPicked = opt.id === selected;
                            const wrongPicked = isPicked && !isCorrect;
                            return (
                              <div
                                key={opt.id}
                                className={`rounded-md border px-3 py-2 text-sm ${
                                  isCorrect
                                    ? "border-success/50 bg-success/10 text-success"
                                    : wrongPicked
                                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                                    : "border-border text-muted-foreground"
                                }`}
                              >
                                {opt.text}
                                {isCorrect && " (Correct)"}
                                {wrongPicked && " (Your choice)"}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQuizzes;
