import { useState } from "react";
import { BookOpen, ArrowLeft, FileText, User } from "lucide-react";
import { COURSES, TEACHERS } from "@/data/mockData";

const StudentCourses = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COURSES.map(course => (
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