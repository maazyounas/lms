import { useEffect, useMemo, useState } from "react";
import { ANNOUNCEMENTS, STUDENTS, type Announcement } from "@/data/mockData";
import TeacherAnnouncements from "@/components/teacher/announcements/TeacherAnnouncements";

interface Props {
  onAnnouncementsChange?: (announcements: Announcement[]) => void;
}

const AdminAnnouncements = (_props: Props) => {
  const [inboxAnnouncements, setInboxAnnouncements] = useState<Announcement[]>([]);
  const classes = useMemo(
    () => Array.from(new Set(STUDENTS.map((student) => student.grade))).sort(),
    []
  );
  const receivedAnnouncements = useMemo(
    () => [...inboxAnnouncements, ...ANNOUNCEMENTS],
    [inboxAnnouncements]
  );

  useEffect(() => {
    const key = "admin-announcements";
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Announcement[];
      if (Array.isArray(parsed)) {
        setInboxAnnouncements(parsed);
      }
    } catch {
      setInboxAnnouncements([]);
    }
  }, []);

  return (
    <TeacherAnnouncements
      senderName="Admin Office"
      classes={classes}
      students={STUDENTS}
      receivedAnnouncements={receivedAnnouncements}
      allStudentsLabel="All Students"
    />
  );
};

export default AdminAnnouncements;
