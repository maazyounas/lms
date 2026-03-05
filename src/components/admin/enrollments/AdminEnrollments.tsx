import { useState } from "react";
import { toast } from "sonner";

const CLASSES = ["9-A", "9-B", "10-A", "10-B", "11-A"];

const COURSES = {
  "9-A": ["Math", "English", "Physics"],
  "9-B": ["Math", "Chemistry", "Biology"],
  "10-A": ["Physics", "Chemistry", "Math"],
  "10-B": ["Biology", "English"],
  "11-A": ["Computer Science", "Physics"],
};

const AdminEnrollments = () => {
  const [student, setStudent] = useState({
    name: "",
    id: "",
    class: "",
    courses: [] as string[],
  });

  const [teacher, setTeacher] = useState({
    name: "",
    id: "",
    class: "",
    courses: [] as string[],
  });

  const [resetId, setResetId] = useState("");

  /* ---------- Enroll Student ---------- */

  const enrollStudent = () => {
    if (!student.name || !student.id || !student.class) {
      toast.error("Fill all fields");
      return;
    }

    const payload = {
      ...student,
      password: student.id,
      enrollDate: new Date().toISOString().split("T")[0],
    };

    console.log("Student Enrolled:", payload);

    toast.success("Student enrolled successfully");

    setStudent({ name: "", id: "", class: "", courses: [] });
  };

  /* ---------- Enroll Teacher ---------- */

  const enrollTeacher = () => {
    if (!teacher.name || !teacher.id || !teacher.class) {
      toast.error("Fill all fields");
      return;
    }

    const payload = {
      ...teacher,
      password: teacher.id,
    };

    console.log("Teacher Enrolled:", payload);

    toast.success("Teacher enrolled successfully");

    setTeacher({ name: "", id: "", class: "", courses: [] });
  };

  /* ---------- Reset Credentials ---------- */

  const resetCredentials = () => {
    if (!resetId) {
      toast.error("Enter ID");
      return;
    }

    console.log("Password reset for:", resetId);

    toast.success("Credentials reset to default (ID)");
    setResetId("");
  };

  return (
    <div className="space-y-10">

      {/* STUDENT ENROLLMENT */}

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Enroll Student</h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            placeholder="Student Name"
            value={student.name}
            onChange={(e) =>
              setStudent({ ...student, name: e.target.value })
            }
            className="border border-border rounded-lg p-2"
          />

          <input
            placeholder="Student ID"
            value={student.id}
            onChange={(e) =>
              setStudent({ ...student, id: e.target.value })
            }
            className="border border-border rounded-lg p-2"
          />

          {/* Select Class */}

          <select
            value={student.class}
            onChange={(e) =>
              setStudent({ ...student, class: e.target.value, courses: [] })
            }
            className="border border-border rounded-lg p-2"
          >
            <option value="">Select Class</option>
            {CLASSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* Select Courses */}

          <select
            multiple
            value={student.courses}
            onChange={(e) =>
              setStudent({
                ...student,
                courses: Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                ),
              })
            }
            className="border border-border rounded-lg p-2 h-24"
          >
            {(COURSES as any)[student.class]?.map((course: string) => (
              <option key={course}>{course}</option>
            ))}
          </select>

        </div>

        <button
          onClick={enrollStudent}
          className="mt-4 bg-primary text-white px-5 py-2 rounded-lg"
        >
          Enroll Student
        </button>
      </div>

      {/* TEACHER ENROLLMENT */}

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Enroll Teacher</h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            placeholder="Teacher Name"
            value={teacher.name}
            onChange={(e) =>
              setTeacher({ ...teacher, name: e.target.value })
            }
            className="border border-border rounded-lg p-2"
          />

          <input
            placeholder="Teacher ID"
            value={teacher.id}
            onChange={(e) =>
              setTeacher({ ...teacher, id: e.target.value })
            }
            className="border border-border rounded-lg p-2"
          />

          {/* Assign Class */}

          <select
            value={teacher.class}
            onChange={(e) =>
              setTeacher({ ...teacher, class: e.target.value, courses: [] })
            }
            className="border border-border rounded-lg p-2"
          >
            <option value="">Assign Class</option>
            {CLASSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          {/* Assign Courses */}

          <select
            multiple
            value={teacher.courses}
            onChange={(e) =>
              setTeacher({
                ...teacher,
                courses: Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                ),
              })
            }
            className="border border-border rounded-lg p-2 h-24"
          >
            {(COURSES as any)[teacher.class]?.map((course: string) => (
              <option key={course}>{course}</option>
            ))}
          </select>

        </div>

        <button
          onClick={enrollTeacher}
          className="mt-4 bg-primary text-white px-5 py-2 rounded-lg"
        >
          Enroll Teacher
        </button>
      </div>

      {/* RESET CREDENTIALS */}

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          Reset Student / Teacher Credentials
        </h2>

        <div className="flex gap-3">

          <input
            placeholder="Enter Student or Teacher ID"
            value={resetId}
            onChange={(e) => setResetId(e.target.value)}
            className="border border-border rounded-lg p-2 flex-1"
          />

          <button
            onClick={resetCredentials}
            className="bg-warning text-white px-4 py-2 rounded-lg"
          >
            Reset Password
          </button>

        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Password will be reset to the user ID.
        </p>
      </div>

    </div>
  );
};

export default AdminEnrollments;