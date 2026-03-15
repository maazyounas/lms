import { UserPlus } from "lucide-react";
import ClassSubjectAssignment from "../shared/ClassSubjectAssignment";
import type { ClassSubjectForm } from "../types";

type EnrollForm = ClassSubjectForm & {
  name: string;
  id: string;
  gender: string;
  qualification: string;
};

interface Props {
  enrollForm: EnrollForm;
  onChange: (next: EnrollForm) => void;
  onEnroll: () => void;
  classOptions: string[];
  subjectOptions: string[];
  genderOptions: string[];
  onToggleClass: (className: string) => void;
  onToggleSubject: (className: string, subject: string) => void;
}

const EnrollTeacherSection = ({
  enrollForm,
  onChange,
  onEnroll,
  classOptions,
  subjectOptions,
  genderOptions,
  onToggleClass,
  onToggleSubject,
}: Props) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Enroll Teacher</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          value={enrollForm.name}
          onChange={(e) => onChange({ ...enrollForm, name: e.target.value })}
          placeholder="Teacher Name"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <input
          value={enrollForm.id}
          onChange={(e) => onChange({ ...enrollForm, id: e.target.value })}
          placeholder="Teacher ID"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <select
          value={enrollForm.gender}
          onChange={(e) => onChange({ ...enrollForm, gender: e.target.value })}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {genderOptions.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <input
          value={enrollForm.qualification}
          onChange={(e) => onChange({ ...enrollForm, qualification: e.target.value })}
          placeholder="Qualification"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <ClassSubjectAssignment
        form={enrollForm}
        classOptions={classOptions}
        subjectOptions={subjectOptions}
        onToggleClass={onToggleClass}
        onToggleSubject={onToggleSubject}
      />

      <button
        onClick={onEnroll}
        className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Enroll Teacher
      </button>
    </div>
  );
};

export default EnrollTeacherSection;
