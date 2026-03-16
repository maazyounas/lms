import type { Student } from "@/data/mockData";
import { getEnrolledCourses, studentCode } from "../utils/feeUtils";

type Props = {
  student: Student;
};

const StudentOverviewCard = ({ student }: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{student.name}</h2>
        <p className="text-sm text-muted-foreground">
          {studentCode(student.id)} | {student.grade}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Fee Status</p>
          <p className="font-semibold text-foreground">{student.fees.status}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Class</p>
          <p className="font-semibold text-foreground">{student.grade}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p
            className={`font-semibold ${
              student.fees.pending > 0 ? "text-destructive" : "text-success"
            }`}
          >
            Rs. {student.fees.pending.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="font-semibold text-foreground">
            Rs. {student.fees.paid.toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Enrolled Courses</p>
        <div className="flex flex-wrap gap-2">
          {getEnrolledCourses(student).length > 0 ? (
            getEnrolledCourses(student).map((course) => (
              <span
                key={course}
                className="rounded-full border border-border bg-background px-2 py-1 text-xs"
              >
                {course}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No courses available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewCard;
