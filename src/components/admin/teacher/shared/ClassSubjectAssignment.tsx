import type { ClassSubjectForm } from "../types";

interface Props {
  form: ClassSubjectForm;
  classOptions: string[];
  subjectOptions: string[];
  onToggleClass: (className: string) => void;
  onToggleSubject: (className: string, subject: string) => void;
}

const ClassSubjectAssignment = ({
  form,
  classOptions,
  subjectOptions,
  onToggleClass,
  onToggleSubject,
}: Props) => {
  return (
    <>
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Assign Classes</p>
        <div className="flex flex-wrap gap-2">
          {classOptions.map((className) => (
            <label
              key={className}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={form.classes.includes(className)}
                onChange={() => onToggleClass(className)}
              />
              {className}
            </label>
          ))}
        </div>
      </div>

      {form.classes.map((className) => (
        <div key={className} className="space-y-2 rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium text-foreground">{className}: Assign Subjects</p>
          <div className="flex flex-wrap gap-2">
            {subjectOptions.map((subject) => (
              <label
                key={`${className}-${subject}`}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs"
              >
                <input
                  type="checkbox"
                  checked={(form.classSubjects[className] || []).includes(subject)}
                  onChange={() => onToggleSubject(className, subject)}
                />
                {subject}
              </label>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default ClassSubjectAssignment;
