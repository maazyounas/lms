import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Clock, TrendingUp, Users } from "lucide-react";
import {
  COURSES,
  STUDENTS,
  type Course,
  type CourseChapter,
  type CourseTopic,
  type StudyMaterial,
  type Teacher,
} from "@/data/mockData";
import { toast } from "sonner";
import OverviewTab from "./overview/OverviewTab";
import ChaptersTab from "./chapters/ChaptersTab";
import MaterialsTab from "./materials/MaterialsTab";
import StudentsSection from "./students/StudentsSection";
import PreviewTab from "./preview/PreviewTab";

interface Props {
  teacher: Teacher;
  selectedClass: Course | null;
  onSelectClass: (course: Course | null) => void;
  onNavigate: (nav: string, options?: { assignmentId?: number; testId?: number }) => void;
}

const TeacherClasses = ({ teacher, selectedClass, onSelectClass }: Props) => {
  const myCourses = COURSES.filter((c) => c.teacher === teacher.name);
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "chapters" | "materials" | "preview" | "students"
  >("overview");
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [classData, setClassData] = useState<Course | null>(null);

  useEffect(() => {
    if (!selectedClass) {
      setClassData(null);
      return;
    }
    const normalized: Course = {
      ...selectedClass,
      description: selectedClass.description || "",
      materials: selectedClass.materials ? [...selectedClass.materials] : [],
      chapters: selectedClass.chapters
        ? selectedClass.chapters.map((ch) => ({
            ...ch,
            materials: ch.materials ? [...ch.materials] : [],
            topics: ch.topics
              ? ch.topics.map((t) => ({
                  ...t,
                  materials: t.materials ? [...t.materials] : [],
                }))
              : [],
          }))
        : [],
    };
    setClassData(normalized);
    setExpandedChapters(new Set());
    setExpandedTopics(new Set());
    setExpandedStudentId(null);
  }, [selectedClass]);

  const nextChapterId = useMemo(() => {
    if (!classData?.chapters?.length) return 1;
    return Math.max(...classData.chapters.map((c) => c.id)) + 1;
  }, [classData?.chapters]);

  const nextTopicId = useMemo(() => {
    if (!classData?.chapters?.length) return 1;
    const all = classData.chapters.flatMap((c) => c.topics || []);
    return all.length ? Math.max(...all.map((t) => t.id)) + 1 : 1;
  }, [classData?.chapters]);

  const nextMaterialId = useMemo(() => {
    if (!classData) return 1;
    const ids: number[] = [];
    classData.materials?.forEach((m) => ids.push(m.id));
    classData.chapters?.forEach((ch) => {
      ch.materials?.forEach((m) => ids.push(m.id));
      ch.topics?.forEach((t) => t.materials?.forEach((m) => ids.push(m.id)));
    });
    return ids.length ? Math.max(...ids) + 1 : 1;
  }, [classData]);

  if (selectedClass) {
    if (!classData) return null;
    const classStudents = STUDENTS;
    const avgScore =
      classStudents.length > 0
        ? (
            classStudents.reduce((a, s) => {
              const t = s.tests.find(
                (test) => test.subject === teacher.subject && test.test === "Mid-Term",
              );
              return a + (t ? (t.marks / t.total) * 100 : 0);
            }, 0) / classStudents.length
          ).toFixed(0)
        : "0";

    const toggleStudent = (studentId: number) => {
      setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
    };

    const toggleChapter = (chapterId: number) => {
      const newSet = new Set(expandedChapters);
      if (newSet.has(chapterId)) newSet.delete(chapterId);
      else newSet.add(chapterId);
      setExpandedChapters(newSet);
    };

    const toggleTopic = (topicId: number) => {
      const newSet = new Set(expandedTopics);
      if (newSet.has(topicId)) newSet.delete(topicId);
      else newSet.add(topicId);
      setExpandedTopics(newSet);
    };

    const handleUpdateDescription = (value: string) => {
      setClassData((prev) => (prev ? { ...prev, description: value } : prev));
    };

    const handleAddCourseMaterial = (material: Omit<StudyMaterial, "id">) => {
      setClassData((prev) =>
        prev
          ? {
              ...prev,
              materials: [...(prev.materials || []), { ...material, id: nextMaterialId }],
            }
          : prev,
      );
      toast.success("Material added to course.");
    };

    const handleAddChapter = (data: {
      chapterNumber: number;
      chapterName: string;
      description?: string;
    }) => {
      setClassData((prev) => {
        if (!prev) return prev;
        const newChapter: CourseChapter & { description?: string } = {
          id: nextChapterId,
          chapterNumber: data.chapterNumber,
          chapterName: data.chapterName,
          description: data.description,
          materials: [],
          topics: [],
        };
        return { ...prev, chapters: [...(prev.chapters || []), newChapter] };
      });
      toast.success("Chapter added.");
    };

    const handleUpdateChapter = (
      chapterId: number,
      patch: { chapterNumber?: number; chapterName?: string; description?: string },
    ) => {
      setClassData((prev) => {
        if (!prev?.chapters) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map((ch) => (ch.id === chapterId ? { ...ch, ...patch } : ch)),
        };
      });
    };

    const handleAddChapterMaterial = (chapterId: number, material: Omit<StudyMaterial, "id">) => {
      setClassData((prev) => {
        if (!prev?.chapters) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map((ch) =>
            ch.id === chapterId
              ? { ...ch, materials: [...(ch.materials || []), { ...material, id: nextMaterialId }] }
              : ch,
          ),
        };
      });
      toast.success("Material added to chapter.");
    };

    const handleAddTopic = (chapterId: number, topicName: string) => {
      setClassData((prev) => {
        if (!prev?.chapters) return prev;
        const newTopic: CourseTopic = {
          id: nextTopicId,
          topicName,
          materials: [],
        };
        return {
          ...prev,
          chapters: prev.chapters.map((ch) =>
            ch.id === chapterId ? { ...ch, topics: [...(ch.topics || []), newTopic] } : ch,
          ),
        };
      });
      toast.success("Topic added.");
    };

    const handleUpdateTopic = (chapterId: number, topicId: number, topicName: string) => {
      setClassData((prev) => {
        if (!prev?.chapters) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map((ch) =>
            ch.id === chapterId
              ? {
                  ...ch,
                  topics: (ch.topics || []).map((t) =>
                    t.id === topicId ? { ...t, topicName } : t,
                  ),
                }
              : ch,
          ),
        };
      });
    };

    const handleAddTopicMaterial = (
      chapterId: number,
      topicId: number,
      material: Omit<StudyMaterial, "id">,
    ) => {
      setClassData((prev) => {
        if (!prev?.chapters) return prev;
        return {
          ...prev,
          chapters: prev.chapters.map((ch) =>
            ch.id === chapterId
              ? {
                  ...ch,
                  topics: (ch.topics || []).map((t) =>
                    t.id === topicId
                      ? {
                          ...t,
                          materials: [...(t.materials || []), { ...material, id: nextMaterialId }],
                        }
                      : t,
                  ),
                }
              : ch,
          ),
        };
      });
      toast.success("Material added to topic.");
    };

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => onSelectClass(null)}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Classes
        </button>

        {/* Class Header Card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Title & Description */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {classData.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span>{classData.code}</span>
                <span className="hidden sm:inline">•</span>
                <span>{classData.room}</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {classData.schedule}
                </span>
              </div>
              {classData.description && (
                <p className="text-sm text-muted-foreground max-w-2xl mt-3 leading-relaxed">
                  {classData.description}
                </p>
              )}
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Students", value: classStudents.length, icon: Users },
                { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp },
                { label: "Progress", value: `${classData.progress}%`, icon: BookOpen },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 min-w-[120px]"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Syllabus completion</span>
              <span className="font-medium text-foreground">{classData.progress}%</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${classData.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex flex-wrap gap-1">
            {(["overview", "chapters", "materials", "preview", "students"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                  activeTab === tab
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
          {activeTab === "overview" && (
            <OverviewTab
              selectedClass={classData}
              onUpdateDescription={handleUpdateDescription}
              onAddMaterial={handleAddCourseMaterial}
            />
          )}
          {activeTab === "chapters" && (
            <ChaptersTab
              selectedClass={classData}
              expandedChapters={expandedChapters}
              expandedTopics={expandedTopics}
              onToggleChapter={toggleChapter}
              onToggleTopic={toggleTopic}
              onAddChapter={handleAddChapter}
              onUpdateChapter={handleUpdateChapter}
              onAddChapterMaterial={handleAddChapterMaterial}
              onAddTopic={handleAddTopic}
              onUpdateTopic={handleUpdateTopic}
              onAddTopicMaterial={handleAddTopicMaterial}
            />
          )}
          {activeTab === "materials" && <MaterialsTab selectedClass={classData} />}
          {activeTab === "preview" && (
            <PreviewTab selectedClass={classData} studentCount={classStudents.length} />
          )}
          {activeTab === "students" && (
            <StudentsSection
              classStudents={classStudents}
              teacher={teacher}
              expandedStudentId={expandedStudentId}
              onToggleStudent={toggleStudent}
            />
          )}
        </div>
      </div>
    );
  }

  // Class List View
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">My Classes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {myCourses.map((c) => {
          const classStudents = STUDENTS;
          const avgScore = (
            classStudents.reduce((a, s) => {
              const t = s.tests.find(
                (test) => test.subject === teacher.subject && test.test === "Mid-Term",
              );
              return a + (t ? (t.marks / t.total) * 100 : 0);
            }, 0) / classStudents.length
          ).toFixed(0);

          return (
            <button
              key={c.id}
              onClick={() => onSelectClass(c)}
              className="group text-left bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{c.code}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Room:</span> {c.room}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {c.schedule}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {classStudents.length} Students
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Avg Score: {avgScore}%
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Syllabus progress</span>
                  <span className="font-medium text-foreground">{c.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300 group-hover:bg-primary/80"
                    style={{ width: `${c.progress}%` }}
                  />
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