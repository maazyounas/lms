import { useState } from "react";
import { BookOpen, ArrowLeft, FileText, User } from "lucide-react";
import { COURSES, TEACHERS, type StudyMaterial } from "@/data/mockData";
import { materialIcon } from "@/components/teacher/classes/classUtils";

const StudentCourses = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const selectedCourse = COURSES.find(c => c.id === selectedCourseId);
  const teacher = selectedCourse
    ? TEACHERS.find(t => t.id === selectedCourse.teacherId)
    : null;

  if (selectedCourse) {
    return (
      <div>
        <button
          onClick={() => setSelectedCourseId(null)}
          className="flex items-center gap-1 text-sm text-primary hover:underline mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </button>

        <div className="bg-card border border-border rounded-xl p-6 space-y-6">

          {/* Course Header */}
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {selectedCourse.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedCourse.code}
            </p>
          </div>

          {/* Course Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard label="Schedule" value={selectedCourse.schedule} />
            <InfoCard label="Room" value={selectedCourse.room} />
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Course Description</h3>
            <p className="text-sm text-muted-foreground">
              {selectedCourse.description}
            </p>
          </div>

          {/* Course Content */}
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold mb-4">Course Content</h3>

            <div className="mb-4">
              <p className="text-sm font-medium text-foreground mb-2">Course Materials</p>
              {selectedCourse.materials && selectedCourse.materials.length > 0 ? (
                <div className="space-y-2">
                  {selectedCourse.materials.map((mat) => {
                    const Icon = materialIcon(mat.type as StudyMaterial["type"]);
                    return (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm text-foreground">{mat.title}</p>
                            {mat.content && (
                              <p className="text-xs text-muted-foreground">{mat.content}</p>
                            )}
                          </div>
                        </div>
                        {mat.url && (
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            View
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No course materials added yet.</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">Chapters & Topics</p>
              {selectedCourse.chapters && selectedCourse.chapters.length > 0 ? (
                <div className="space-y-4">
                  {selectedCourse.chapters.map((ch) => (
                    <div key={ch.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Chapter {ch.chapterNumber}: {ch.chapterName}
                          </p>
                          {ch.description && (
                            <p className="text-xs text-muted-foreground mt-1">{ch.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {ch.topics?.length || 0} Topics
                        </span>
                      </div>

                      {ch.materials && ch.materials.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-foreground mb-2">
                            Chapter Materials
                          </p>
                          <div className="space-y-2">
                            {ch.materials.map((mat) => {
                              const Icon = materialIcon(mat.type as StudyMaterial["type"]);
                              return (
                                <div
                                  key={mat.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-primary" />
                                    <span>{mat.title}</span>
                                  </div>
                                  {mat.url && (
                                    <a
                                      href={mat.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary text-xs hover:underline"
                                    >
                                      View
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {ch.topics && ch.topics.length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {ch.topics.map((topic) => (
                            <div
                              key={topic.id}
                              className="border border-border rounded-md p-3 bg-muted/10"
                            >
                              <p className="text-sm font-medium text-foreground">
                                {topic.topicName}
                              </p>
                              {topic.materials && topic.materials.length > 0 ? (
                                <div className="mt-2 space-y-2">
                                  {topic.materials.map((mat) => {
                                    const Icon = materialIcon(mat.type as StudyMaterial["type"]);
                                    return (
                                      <div
                                        key={mat.id}
                                        className="flex items-center justify-between text-sm"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Icon className="h-4 w-4 text-primary" />
                                          <span>{mat.title}</span>
                                        </div>
                                        {mat.url && (
                                          <a
                                            href={mat.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary text-xs hover:underline"
                                          >
                                            View
                                          </a>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground mt-1">
                                  No materials in this topic.
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-3">No topics added yet.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No chapters added yet.</p>
              )}
            </div>
          </div>

          {/* Teacher Info */}
          {teacher && (
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Teacher Information
              </h3>

              <div className="bg-muted/30 p-4 rounded-lg space-y-1">
                <p className="font-medium text-foreground">{teacher.name}</p>
                <p className="text-sm text-muted-foreground">{teacher.email}</p>
                <p className="text-sm text-muted-foreground">
                  Qualification: {teacher.qualification}
                </p>
                <p className="text-sm text-muted-foreground">
                  Phone: {teacher.phone}
                </p>
              </div>
            </div>
          )}

          {/* Past Papers */}
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Past Papers
            </h3>

            <div className="space-y-3">
              {selectedCourse.pastPapers.map((paper, i) => (
                <div
                  key={i}
                  className="bg-muted/30 p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {paper.title} ({paper.year})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total Marks: {paper.totalMarks}
                    </p>
                  </div>
                  <button className="text-primary text-sm hover:underline">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        My Courses
      </h1>

      {COURSES.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground text-center">
          No courses assigned yet. Your courses will appear here once you are enrolled.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COURSES.slice(0, visibleCount).map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourseId(course.id)}
            className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/30 hover:bg-muted/20 transition-all"
          >
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>

            <h3 className="font-semibold text-foreground text-sm">
              {course.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {course.code}
            </p>

            <div className="text-xs text-muted-foreground">
              Progress: {course.progress}%
            </div>
          </button>
        ))}
      </div>

      {COURSES.length > visibleCount && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="text-sm text-primary hover:underline"
          >
            Show more courses
          </button>
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-muted/30 p-4 rounded-lg">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

export default StudentCourses;
