import { useState } from "react";
import { User, Lock, Camera, Save } from "lucide-react";
import type { Student } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  student: Student;
}

const StudentProfile = ({ student }: Props) => {
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  // Editable fields now start empty
  const [form, setForm] = useState({
    phone: "",
    address: "",
    email: "",
    dob: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const handleSave = () => {
    setEditing(false);
    toast.success("Profile updated successfully!");
  };

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handlePasswordUpdate = () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error("Passwords do not match!");
      return;
    }
    if (passwordForm.newPass.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }
    setShowPasswordForm(false);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    toast.success("Password updated successfully!");
  };

  return (
    <div>

      {/* Profile Header Card */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                student.avatar
              )}
            </div>

            <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-6 w-6 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setAvatarPreview(reader.result as string);
                      toast.success("Profile picture updated!");
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {student.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Student ID: STU-{String(student.id).padStart(4, "0")}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary">
                {student.grade}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/15 text-success">
                {student.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-info/15 text-info">
                {student.gender}
              </span>
            </div>
          </div>

          <button
            onClick={() => (editing ? handleSave() : setEditing(true))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {editing ? (
              <Save className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
            {editing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Personal Information */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Personal Information
          </h3>
          <div className="space-y-3">
            {[
              { label: "Full Name", value: student.name, editable: false },
              {
                label: "Student ID",
                value: `STU-${String(student.id).padStart(4, "0")}`,
                editable: false,
              },
              {
                label: "Date of Birth",
                value: form.dob,
                editable: true,
                key: "dob" as const,
              },
              { label: "Gender", value: student.gender, editable: false },
              {
                label: "Email",
                value: form.email,
                editable: true,
                key: "email" as const,
              },
              {
                label: "Phone",
                value: form.phone,
                editable: true,
                key: "phone" as const,
              },
              {
                label: "Address",
                value: form.address,
                editable: true,
                key: "address" as const,
              },
              {
                label: "Enrolled Since",
                value: student.enrollDate,
                editable: false,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4"
              >
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {item.label}
                </span>
                {editing && item.editable && item.key ? (
                  <input
                    type={item.key === "dob" ? "date" : "text"}
                    value={form[item.key]}
                    onChange={(e) =>
                      setForm({ ...form, [item.key!]: e.target.value })
                    }
                    className="text-sm text-foreground text-right bg-muted/50 border border-border rounded px-2 py-1 w-48 outline-none focus:border-primary"
                  />
                ) : (
                  <span className="text-sm text-foreground text-right">
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guardian Information */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Father / Guardian Information
          </h3>
          <div className="space-y-3">
            {[
              { label: "Father / Guardian Name", value: student.guardian },
              { label: "Guardian Phone", value: student.guardianPhone },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm text-foreground">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Password Section */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-warning" /> Password
              </h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-xs text-primary hover:underline"
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>
            {showPasswordForm && (
              <div className="space-y-3">
                {[
                  { label: "Current Password", key: "current" as const },
                  { label: "New Password", key: "newPass" as const },
                  { label: "Confirm Password", key: "confirm" as const },
                ].map((field) => (
                  <input
                    key={field.key}
                    type="password"
                    placeholder={field.label}
                    value={passwordForm[field.key]}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        [field.key]: e.target.value,
                      })
                    }
                    className="w-full text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
                  />
                ))}
                <button
                  onClick={handlePasswordUpdate}
                  className="w-full py-2 bg-warning text-warning-foreground rounded-lg text-sm font-medium hover:bg-warning/90 transition-colors"
                >
                  Update Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;