import { useState } from "react";
import { PlusCircle, Trash2, X, Save } from "lucide-react";
import { COURSES, type Teacher } from "@/data/mockData";

// Types
interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string | null;
}

interface Quiz {
  title: string;
  description: string;
  classGrade: string; 
  chapterName: string;
  topicName: string;
  dueDate: string;
  questions: Question[];
}

const MAX_QUESTIONS = 20;
const MAX_OPTIONS = 5;

interface Props {
  teacher: Teacher;
}

interface Chapter {
  name: string;
  topics: string[];
}

const TeacherCreateQuiz = ({ teacher }: Props) => {
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const course = COURSES.find((c) => c.name === teacher.subject);
    const fromCourse = course?.chapters?.map((ch) => ({
      name: ch.chapterName,
      topics: (ch.topics || []).map((t) => t.topicName),
    })) ?? [];
    return fromCourse;
  });
  const [newChapterName, setNewChapterName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    description: "",
    classGrade: "",
    chapterName: "",
    topicName: "",
    dueDate: "",
    questions: [],
  });

  const addQuestion = () => {
    if (quiz.questions.length >= MAX_QUESTIONS) {
      alert(`You can only add up to ${MAX_QUESTIONS} questions.`);
      return;
    }
    const newQuestion: Question = {
      id: Date.now().toString() + Math.random(),
      text: "",
      options: [
        { id: `opt-${Date.now()}-1`, text: "" },
        { id: `opt-${Date.now()}-2`, text: "" },
      ],
      correctOptionId: null,
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
  };

  const removeQuestion = (qId: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((q) => q.id !== qId),
    });
  };

  const updateQuestionText = (qId: string, text: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === qId ? { ...q, text } : q
      ),
    });
  };

  const addOption = (qId: string) => {
    const question = quiz.questions.find((q) => q.id === qId);
    if (!question) return;
    if (question.options.length >= MAX_OPTIONS) {
      alert(`You can only add up to ${MAX_OPTIONS} options.`);
      return;
    }
    const newOption: Option = {
      id: `opt-${Date.now()}-${Math.random()}`,
      text: "",
    };
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === qId ? { ...q, options: [...q.options, newOption] } : q
      ),
    });
  };

  const removeOption = (qId: string, optId: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.filter((o) => o.id !== optId),
              correctOptionId: q.correctOptionId === optId ? null : q.correctOptionId,
            }
          : q
      ),
    });
  };

  const updateOptionText = (qId: string, optId: string, text: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)),
            }
          : q
      ),
    });
  };

  const setCorrectOption = (qId: string, optId: string) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === qId ? { ...q, correctOptionId: optId } : q
      ),
    });
  };

  const handleAddChapter = () => {
    const name = newChapterName.trim();
    if (!name) return;
    if (chapters.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert("Chapter already exists.");
      return;
    }
    const updated = [...chapters, { name, topics: [] }];
    setChapters(updated);
    setQuiz({ ...quiz, chapterName: name, topicName: "" });
    setNewChapterName("");
  };

  const handleAddTopic = () => {
    const name = newTopicName.trim();
    if (!name) return;
    if (!quiz.chapterName) {
      alert("Select a chapter first.");
      return;
    }
    const updated = chapters.map((c) =>
      c.name === quiz.chapterName
        ? { ...c, topics: c.topics.includes(name) ? c.topics : [...c.topics, name] }
        : c
    );
    setChapters(updated);
    setQuiz({ ...quiz, topicName: name });
    setNewTopicName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!quiz.title.trim()) {
      alert("Please enter a quiz title.");
      return;
    }
    if (!quiz.classGrade.trim()) {
      alert("Please select a class.");
      return;
    }
    if (!quiz.chapterName.trim()) {
      alert("Please select or add a chapter.");
      return;
    }
    if (!quiz.topicName.trim()) {
      alert("Please select or add a topic.");
      return;
    }
    if (!quiz.dueDate) {
      alert("Please set a due date.");
      return;
    }
    for (const [idx, q] of quiz.questions.entries()) {
      if (!q.text.trim()) {
        alert(`Question ${idx + 1} text is empty.`);
        return;
      }
      for (const [optIdx, opt] of q.options.entries()) {
        if (!opt.text.trim()) {
          alert(`Question ${idx + 1}, Option ${optIdx + 1} text is empty.`);
          return;
        }
      }
      if (!q.correctOptionId) {
        alert(`Question ${idx + 1} does not have a correct answer selected.`);
        return;
      }
    }
    // Mock save
    console.log("Quiz saved:", quiz);
    alert("Quiz created successfully! (Check console)");
    // Optionally reset or navigate away
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Create New Quiz</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {teacher.name} ({teacher.subject})
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz metadata */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
              Quiz Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
              placeholder="e.g., Algebra Mid-Term Quiz"
              required
            />
          </div>

          <div>
            <label htmlFor="desc" className="block text-sm font-medium text-foreground mb-1">
              Description (optional)
            </label>
            <textarea
              id="desc"
              value={quiz.description}
              onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
              placeholder="Brief description of the quiz"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-foreground mb-1">
                Class/Grade <span className="text-destructive">*</span>
              </label>
              <select
                id="class"
                value={quiz.classGrade}
                onChange={(e) => setQuiz({ ...quiz, classGrade: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
                required
              >
                <option value="">Select class</option>
                <option value="10-A">10-A</option>
                <option value="10-B">10-B</option>
                <option value="9-A">9-A</option>
                <option value="9-B">9-B</option>
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-1">
                Due Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                value={quiz.dueDate}
                onChange={(e) => setQuiz({ ...quiz, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Chapter <span className="text-destructive">*</span>
              </label>
              <select
                value={quiz.chapterName}
                onChange={(e) => setQuiz({ ...quiz, chapterName: e.target.value, topicName: "" })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
                required
              >
                <option value="">Select chapter</option>
                {chapters.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
                  placeholder="Add new chapter"
                />
                <button
                  type="button"
                  onClick={handleAddChapter}
                  className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Topic <span className="text-destructive">*</span>
              </label>
              <select
                value={quiz.topicName}
                onChange={(e) => setQuiz({ ...quiz, topicName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
                required
                disabled={!quiz.chapterName}
              >
                <option value="">{quiz.chapterName ? "Select topic" : "Select chapter first"}</option>
                {chapters
                  .find((c) => c.name === quiz.chapterName)
                  ?.topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
                  placeholder="Add new topic"
                  disabled={!quiz.chapterName}
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                  disabled={!quiz.chapterName}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Questions ({quiz.questions.length}/{MAX_QUESTIONS})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <PlusCircle className="h-4 w-4" /> Add Question
            </button>
          </div>

          {quiz.questions.length === 0 && (
            <p className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
              No questions yet. Click "Add Question" to start.
            </p>
          )}

          {quiz.questions.map((q, qIdx) => (
            <div key={q.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-foreground">Question {qIdx + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Remove question"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Question text */}
              <textarea
                value={q.text}
                onChange={(e) => updateQuestionText(q.id, e.target.value)}
                placeholder="Enter your question here..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none mb-4"
                required
              />

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Options (select correct answer)
                </label>
                {q.options.map((opt, optIdx) => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctOptionId === opt.id}
                      onChange={() => setCorrectOption(q.id, opt.id)}
                      className="h-4 w-4 text-primary focus:ring-primary border-border"
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
                      placeholder={`Option ${optIdx + 1}`}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm text-foreground focus:border-primary outline-none"
                      required
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(q.id, opt.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove option"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add option button */}
              {q.options.length < MAX_OPTIONS && (
                <button
                  type="button"
                  onClick={() => addOption(q.id)}
                  className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="h-3 w-3" /> Add Option
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted/40 transition-colors"
            >
              Preview Quiz
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Save className="h-4 w-4" /> Save Quiz
            </button>
          </div>
        </div>
      </form>

      {previewOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Quiz Preview</h3>
              <button
                onClick={() => setPreviewOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xl font-semibold text-foreground">{quiz.title || "Untitled Quiz"}</h4>
                {quiz.description && (
                  <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {quiz.classGrade || "Class not set"} · {quiz.chapterName || "Chapter not set"} ·{" "}
                  {quiz.topicName || "Topic not set"} · {quiz.dueDate || "Due date not set"}
                </div>
              </div>

              {quiz.questions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No questions added yet.</p>
              ) : (
                <div className="space-y-4">
                  {quiz.questions.map((q, idx) => (
                    <div key={q.id} className="border border-border rounded-lg p-4">
                      <p className="font-medium text-foreground">
                        {idx + 1}. {q.text || "Untitled question"}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {q.options.map((opt) => (
                          <li key={opt.id} className={opt.id === q.correctOptionId ? "text-success" : ""}>
                            {opt.id === q.correctOptionId ? "✓ " : ""}{opt.text || "Untitled option"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCreateQuiz;
