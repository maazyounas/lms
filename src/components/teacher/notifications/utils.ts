import { ANNOUNCEMENTS, TEACHER_ASSIGNMENTS, type Teacher } from "@/data/mockData";
import type { Notification, TeacherAnnouncement } from "./types";

export const buildInitialNotifications = (teacher: Teacher): Notification[] => {
  const myAssignments = TEACHER_ASSIGNMENTS.filter((a) => a.subject === teacher.subject);
  const assignmentNotifs: Notification[] = myAssignments.flatMap((a) =>
    a.submissions
      .filter((s) => s.status === "Submitted" || s.status === "Late")
      .map((s) => ({
        id: `sub-${a.id}-${s.studentId}`,
        type: "assignment",
        title: `${s.studentName} submitted \"${a.title}\"`,
        description: `${s.status} · Class ${a.classGrade}`,
        date: s.submittedDate || a.dueDate,
        read: false,
        targetNav: "assignments",
      }))
  );

  const announcementNotifs: Notification[] = ANNOUNCEMENTS.slice(0, 3).map((a) => ({
    id: `ann-${a.id}`,
    type: "announcement",
    title: a.title,
    description: `${a.content.slice(0, 60)}...`,
    date: a.date,
    read: false,
    targetNav: "announcements",
  }));

  return [...assignmentNotifs, ...announcementNotifs].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
};

export const buildTeacherAnnouncementNotifications = (
  teacherAnnouncements: TeacherAnnouncement[]
): Notification[] => {
  return teacherAnnouncements.map((a) => ({
    id: `teacher-ann-${a.id}`,
    type: "teacher-announcement",
    title: `You announced: ${a.title}`,
    description: `${a.content.slice(0, 60)}...`,
    date: a.date,
    read: false,
    targetNav: "announcements",
  }));
};
