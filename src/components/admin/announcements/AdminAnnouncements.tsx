import { useEffect, useMemo, useState } from "react";
import { ANNOUNCEMENTS, STUDENTS, type Announcement } from "@/data/mockData";
import TeacherAnnouncements from "@/components/teacher/announcements/TeacherAnnouncements";

interface Props {
  onAnnouncementsChange?: (announcements: Announcement[]) => void;
}

const AdminAnnouncements = ({ onAnnouncementsChange }: Props) => {
  const [sharedAnnouncements, setSharedAnnouncements] = useState<Announcement[]>(() => {
    const raw = localStorage.getItem("announcements");
    if (!raw) return ANNOUNCEMENTS;
    try {
      const parsed = JSON.parse(raw) as Announcement[];
      return Array.isArray(parsed) ? parsed : ANNOUNCEMENTS;
    } catch {
      return ANNOUNCEMENTS;
    }
  });
  const classes = useMemo(
    () => Array.from(new Set(STUDENTS.map((student) => student.grade))).sort(),
    []
  );
  const receivedAnnouncements = useMemo(() => sharedAnnouncements, [sharedAnnouncements]);

  useEffect(() => {
    localStorage.setItem("announcements", JSON.stringify(sharedAnnouncements));
    onAnnouncementsChange?.(sharedAnnouncements);
  }, [sharedAnnouncements, onAnnouncementsChange]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "announcements") return;
      const raw = localStorage.getItem("announcements");
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as Announcement[];
        if (Array.isArray(parsed)) setSharedAnnouncements(parsed);
      } catch {
        return;
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <TeacherAnnouncements
      senderName="Admin Office"
      classes={classes}
      students={STUDENTS}
      receivedAnnouncements={receivedAnnouncements}
      allStudentsLabel="All Students"
      hideReceived
      lockTargetAll
      onAnnouncementCreated={(announcement) => {
        setSharedAnnouncements((prev) => [announcement, ...prev]);
      }}
    />
  );
};

export default AdminAnnouncements;
