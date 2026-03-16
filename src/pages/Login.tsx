import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, ChevronRight, BookOpen, Users, Trophy, Award } from "lucide-react";
import loginBg from "@/assets/login-bg.jpg";
import { toast } from "sonner";

const Login = () => {
  const [role, setRole] = useState<"admin" | "teacher" | "student">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotId, setForgotId] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/${role}`);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = forgotId.trim();
    if (!value) {
      toast.error("Enter your ID");
      return;
    }

    const key = "admin-announcements";
    const existingRaw = localStorage.getItem(key);
    const existing = existingRaw ? (JSON.parse(existingRaw) as unknown[]) : [];
    const announcement = {
      id: Date.now(),
      title: "Password Reset Request",
      content: `Reset request from ${role} ID: ${value}`,
      priority: "medium",
      author: "Login Portal",
      date: new Date().toISOString().slice(0, 10),
    };
    localStorage.setItem(key, JSON.stringify([announcement, ...existing]));
    toast.success("Password reset request sent to admin.");
    setForgotId("");
    setForgotOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-primary/10" />
        <img src={loginBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.06] mix-blend-lighten" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduVerse LMS</h1>
          </div>
          <p className="text-muted-foreground text-sm">Learning Management System</p>
        </div>

        <div className="relative z-10 max-w-lg">
          <blockquote className="text-3xl font-light text-foreground leading-relaxed">
            "Education is the most powerful weapon which you can use to change the world."
          </blockquote>
          <p className="mt-4 text-primary font-medium">— Nelson Mandela</p>
        </div>

        <div className="relative z-10 grid grid-cols-4 gap-6">
          {[
            { icon: Users, label: "Students", value: "500+" },
            { icon: BookOpen, label: "Courses", value: "50+" },
            { icon: Trophy, label: "Pass Rate", value: "98%" },
            { icon: Award, label: "Years", value: "15+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-foreground">EduVerse LMS</h1>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          {/* Role Tabs */}
          <div className="flex bg-card rounded-lg p-1 mb-6 border border-border">
            {(["admin", "teacher", "student"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all capitalize ${
                  role === r
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${role}@school.edu`}
                  className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border accent-primary" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Sign In <ChevronRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            © 2026 EduVerse LMS. All rights reserved.
          </p>
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">Reset Password</h3>
              <p className="text-sm text-muted-foreground">
                Enter your ID to send a reset request to admin.
              </p>
            </div>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">ID</label>
                <input
                  value={forgotId}
                  onChange={(e) => setForgotId(e.target.value)}
                  placeholder={`${role} ID`}
                  className="w-full h-11 px-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
