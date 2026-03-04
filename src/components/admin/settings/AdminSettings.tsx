import { useState } from "react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    schoolName: "LMS School",
    allowSelfRegistration: false,
    emailNotifications: true,
    sessionTimeoutMinutes: 60,
  });

  const saveSettings = () => {
    toast.success("Settings saved.");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-5">Settings</h1>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 max-w-2xl">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">School Name</label>
          <input
            value={settings.schoolName}
            onChange={(e) => setSettings((p) => ({ ...p, schoolName: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeoutMinutes}
            onChange={(e) =>
              setSettings((p) => ({
                ...p,
                sessionTimeoutMinutes: Number(e.target.value) || 0,
              }))
            }
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-muted/30"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.allowSelfRegistration}
            onChange={(e) =>
              setSettings((p) => ({ ...p, allowSelfRegistration: e.target.checked }))
            }
          />
          Allow self-registration
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) =>
              setSettings((p) => ({ ...p, emailNotifications: e.target.checked }))
            }
          />
          Enable email notifications
        </label>

        <button
          onClick={saveSettings}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
