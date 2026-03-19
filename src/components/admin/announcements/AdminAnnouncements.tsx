import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Announcement, Student } from "@/data/mockData";
import TeacherAnnouncements from "@/components/teacher/announcements/TeacherAnnouncements";

interface Props {
  announcements: Announcement[];
  students: Student[];
  onAnnouncementsChange: Dispatch<SetStateAction<Announcement[]>>;
}

const AdminAnnouncements = ({ announcements, students, onAnnouncementsChange }: Props) => {
  const classes = useMemo(
    () => Array.from(new Set(students.map((student) => student.grade))).sort(),
    [students]
  );
  const receivedAnnouncements = useMemo(() => announcements, [announcements]);

  return (
    <TeacherAnnouncements
      senderName="Admin Office"
      classes={classes}
      students={students}
      receivedAnnouncements={receivedAnnouncements}
      allStudentsLabel="All Students"
      hideReceived
      lockTargetAll
      onAnnouncementCreated={(announcement) => {
        onAnnouncementsChange((prev) => [announcement, ...prev]);
      }}
    />
  );
};

export default AdminAnnouncements;
