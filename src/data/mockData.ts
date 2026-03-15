export interface StudentTest {
  subject: string;
  test: string;
  marks: number;
  total: number;
  date: string;
  grade: string;
}

export interface StudentAssignment {
  title: string;
  subject: string;
  due: string;
  status: string;
  score: string;

  question?: string;
totalMarks?: number;
chapterName?: string;
chapterNumber?: number;
submissionType?: "Handwritten" | "Word" | "PDF";
instructions?: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  grade: string;
  avatar: string;
  gender: string;
  dob: string;
  phone: string;
  guardian: string;
  guardianPhone: string;
  address: string;
  enrollDate: string;
  status: string;
  attendance: { present: number; absent: number; late: number; total: number };
  tests: StudentTest[];
  progress: { month: string; gpa: number }[];
  assignments: StudentAssignment[];
  behavior: { date: string; type: string; note: string }[];
  fees: { total: number; paid: number; pending: number; status: string };
}

// In mockData.ts
export interface StudyMaterial {
  id: number;
  title: string;
  type: "pdf" | "doc" | "ppt" | "link" | "video" | "note";
  url?: string;
  content?: string;
}

export interface CourseTopic {
  id: number;
  topicName: string;
  materials: StudyMaterial[];
}

export interface CourseChapter {
  id: number;
  chapterNumber: number;
  chapterName: string;
  topics: CourseTopic[];
  materials: StudyMaterial[];
}

export interface Course {
  id: number;
  name: string;
  code: string;
  teacher: string;
  teacherId: number;
  description: string;
  schedule: string;
  room: string;
  credits: number;
  progress: number;
  chapters?: CourseChapter[];
  materials?: StudyMaterial[];
  assignments?: Assignment[];

  pastPapers: {
    title: string;
    year: string;
    totalMarks: number;
    file: string;
  }[];
}

export interface Announcement {
  id: number;
  title: string;
  date: string;
  priority: string;
  content: string;
  author: string;
}

export interface TimetableEntry {
  time: string;
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;  
}

export const STUDENTS: Student[] = [
  {
    id: 1, name: "Ayesha Khan", email: "ayesha.k@school.edu", grade: "10-A", avatar: "AK", gender: "Female",
    dob: "2009-03-15", phone: "+92-321-1234567", guardian: "Farhan Khan", guardianPhone: "+92-300-9876543",
    address: "House 12, Street 5, Rawalpindi", enrollDate: "2023-08-01", status: "Active",
    attendance: { present: 142, absent: 8, late: 5, total: 155 },
    tests: [
      { subject: "Mathematics", test: "Mid-Term", marks: 88, total: 100, date: "2025-10-15", grade: "A" },
      { subject: "Mathematics", test: "Quiz 3", marks: 18, total: 20, date: "2025-11-02", grade: "A+" },
      { subject: "Physics", test: "Mid-Term", marks: 76, total: 100, date: "2025-10-16", grade: "B+" },
      { subject: "Physics", test: "Lab Practical", marks: 42, total: 50, date: "2025-11-10", grade: "A" },
      { subject: "English", test: "Mid-Term", marks: 91, total: 100, date: "2025-10-17", grade: "A+" },
      { subject: "Chemistry", test: "Mid-Term", marks: 82, total: 100, date: "2025-10-18", grade: "A" },
      { subject: "Urdu", test: "Mid-Term", marks: 78, total: 100, date: "2025-10-19", grade: "B+" },
      { subject: "Computer Science", test: "Mid-Term", marks: 95, total: 100, date: "2025-10-20", grade: "A+" },
    ],
    progress: [
      { month: "Aug", gpa: 3.5 }, { month: "Sep", gpa: 3.6 }, { month: "Oct", gpa: 3.7 },
      { month: "Nov", gpa: 3.8 }, { month: "Dec", gpa: 3.9 }, { month: "Jan", gpa: 3.85 },
    ],
   assignments: [
  {
    title: "Algebra Worksheet",
    subject: "Mathematics",
    due: "2025-09-10",
    score: "—",
    status: "Pending",
    question: "Solve all quadratic equations using factorization method.",
    totalMarks: 20,
    chapterName: "Quadratic Equations",
    chapterNumber: 4,
    submissionType: "Handwritten",
    instructions: "Show complete steps. Upload clear scanned PDF."
  },
  {
    title: "Algebra",
    subject: "Mathematics",
    due: "2025-09-10",
    score: "—",
    status: "Pending",
    question: "Solve all quadratic equations using factorization method.",
    totalMarks: 20,
    chapterName: "Quadratic Equations",
    chapterNumber: 4,
    submissionType: "Handwritten",
    instructions: "Show complete steps. Upload clear scanned PDF."
  },
  {
    title: "Essay: Climate Change",
    subject: "English",
    due: "2026-03-01",
    status: "Submitted",
    score: "18/20",
    question: "Write an essay on climate change.",
    totalMarks: 20,
    chapterName: "Essay Writing",
    chapterNumber: 6,
    submissionType: "PDF",
    instructions: "Minimum 500 words."
  }
],
    
    behavior: [
      { date: "2025-11-05", type: "Positive", note: "Helped organize science fair" },
      { date: "2025-12-10", type: "Positive", note: "Won inter-school debate competition" },
    ],
    fees: { total: 45000, paid: 45000, pending: 0, status: "Paid" },
  },
  {
    id: 2, name: "Ahmed Raza", email: "ahmed.r@school.edu", grade: "10-A", avatar: "AR", gender: "Male",
    dob: "2009-07-22", phone: "+92-333-2345678", guardian: "Raza Ali", guardianPhone: "+92-301-8765432",
    address: "Flat 3B, Satellite Town, Rawalpindi", enrollDate: "2023-08-01", status: "Active",
    attendance: { present: 130, absent: 18, late: 7, total: 155 },
    tests: [
      { subject: "Mathematics", test: "Mid-Term", marks: 72, total: 100, date: "2025-10-15", grade: "B" },
      { subject: "Mathematics", test: "Quiz 3", marks: 14, total: 20, date: "2025-11-02", grade: "B" },
      { subject: "Physics", test: "Mid-Term", marks: 68, total: 100, date: "2025-10-16", grade: "B-" },
      { subject: "Physics", test: "Lab Practical", marks: 38, total: 50, date: "2025-11-10", grade: "B+" },
      { subject: "English", test: "Mid-Term", marks: 65, total: 100, date: "2025-10-17", grade: "C+" },
      { subject: "Chemistry", test: "Mid-Term", marks: 71, total: 100, date: "2025-10-18", grade: "B" },
      { subject: "Urdu", test: "Mid-Term", marks: 80, total: 100, date: "2025-10-19", grade: "A" },
      { subject: "Computer Science", test: "Mid-Term", marks: 60, total: 100, date: "2025-10-20", grade: "C+" },
    ],
    progress: [
      { month: "Aug", gpa: 2.8 }, { month: "Sep", gpa: 2.9 }, { month: "Oct", gpa: 2.85 },
      { month: "Nov", gpa: 3.0 }, { month: "Dec", gpa: 3.1 }, { month: "Jan", gpa: 3.0 },
    ],
    assignments: [
  {
    title: "Algebra Worksheet",
    subject: "Mathematics",
    due: "2025-09-10",
    score: "—",
    status: "Pending",
    question: "Solve all quadratic equations using factorization method.",
    totalMarks: 20,
    chapterName: "Quadratic Equations",
    chapterNumber: 4,
    submissionType: "Handwritten",
    instructions: "Show complete steps. Upload clear scanned PDF."
  },
  {
    title: "Algebra",
    subject: "Mathematics",
    due: "2025-09-10",
    score: "—",
    status: "Pending",
    question: "Solve all quadratic equations using factorization method.",
    totalMarks: 20,
    chapterName: "Quadratic Equations",
    chapterNumber: 4,
    submissionType: "Handwritten",
    instructions: "Show complete steps. Upload clear scanned PDF."
  },
  {
    title: "Essay: Climate Change",
    subject: "English",
    due: "2026-03-01",
    status: "Submitted",
    score: "18/20",
    question: "Write an essay on climate change.",
    totalMarks: 20,
    chapterName: "Essay Writing",
    chapterNumber: 6,
    submissionType: "PDF",
    instructions: "Minimum 500 words."
  }
],
    behavior: [
      { date: "2025-10-20", type: "Warning", note: "Disrupted class during lecture" },
      { date: "2025-11-15", type: "Positive", note: "Improved test scores significantly" },
    ],
    fees: { total: 45000, paid: 30000, pending: 15000, status: "Partial" },
  },
  {
    id: 3, name: "Fatima Noor", email: "fatima.n@school.edu", grade: "10-B", avatar: "FN", gender: "Female",
    dob: "2009-01-10", phone: "+92-345-3456789", guardian: "Noor Ahmed", guardianPhone: "+92-302-7654321",
    address: "House 45, Westridge, Rawalpindi", enrollDate: "2023-08-01", status: "Active",
    attendance: { present: 150, absent: 3, late: 2, total: 155 },
    tests: [
      { subject: "Mathematics", test: "Mid-Term", marks: 96, total: 100, date: "2025-10-15", grade: "A+" },
      { subject: "Mathematics", test: "Quiz 3", marks: 20, total: 20, date: "2025-11-02", grade: "A+" },
      { subject: "Physics", test: "Mid-Term", marks: 92, total: 100, date: "2025-10-16", grade: "A+" },
      { subject: "Physics", test: "Lab Practical", marks: 48, total: 50, date: "2025-11-10", grade: "A+" },
      { subject: "English", test: "Mid-Term", marks: 94, total: 100, date: "2025-10-17", grade: "A+" },
      { subject: "Chemistry", test: "Mid-Term", marks: 90, total: 100, date: "2025-10-18", grade: "A+" },
      { subject: "Urdu", test: "Mid-Term", marks: 88, total: 100, date: "2025-10-19", grade: "A" },
      { subject: "Computer Science", test: "Mid-Term", marks: 98, total: 100, date: "2025-10-20", grade: "A+" },
    ],
    progress: [
      { month: "Aug", gpa: 3.9 }, { month: "Sep", gpa: 3.95 }, { month: "Oct", gpa: 4.0 },
      { month: "Nov", gpa: 4.0 }, { month: "Dec", gpa: 4.0 }, { month: "Jan", gpa: 4.0 },
    ],
    assignments: [
  {
    title: "Algebra Worksheet",
    subject: "Mathematics",
    due: "2025-09-10",
    score: "—",
    status: "Pending",
    question: "Solve all quadratic equations using factorization method.",
    totalMarks: 20,
    chapterName: "Quadratic Equations",
    chapterNumber: 4,
    submissionType: "Handwritten",
    instructions: "Show complete steps. Upload clear scanned PDF."
  },
  {
    title: "Algebra",
    subject: "Mathematics",
    due: "2025-09-10",
    score: "—",
    status: "Pending",
    question: "Solve all quadratic equations using factorization method.",
    totalMarks: 20,
    chapterName: "Quadratic Equations",
    chapterNumber: 4,
    submissionType: "Handwritten",
    instructions: "Show complete steps. Upload clear scanned PDF."
  },
  {
    title: "Essay: Climate Change",
    subject: "English",
    due: "2026-03-01",
    status: "Submitted",
    score: "18/20",
    question: "Write an essay on climate change.",
    totalMarks: 20,
    chapterName: "Essay Writing",
    chapterNumber: 6,
    submissionType: "PDF",
    instructions: "Minimum 500 words."
  }
],
    behavior: [
      { date: "2025-09-15", type: "Positive", note: "Class topper - received merit certificate" },
      { date: "2025-12-01", type: "Positive", note: "Led community service project" },
    ],
    fees: { total: 45000, paid: 45000, pending: 0, status: "Paid" },
  },
  {
    id: 4, name: "Bilal Hussain", email: "bilal.h@school.edu", grade: "10-B", avatar: "BH", gender: "Male",
    dob: "2009-11-28", phone: "+92-312-4567890", guardian: "Hussain Shah", guardianPhone: "+92-303-6543210",
    address: "Street 9, Chaklala Scheme III, Rawalpindi", enrollDate: "2024-01-15", status: "Active",
    attendance: { present: 120, absent: 25, late: 10, total: 155 },
    tests: [
      { subject: "Mathematics", test: "Mid-Term", marks: 55, total: 100, date: "2025-10-15", grade: "C" },
      { subject: "Mathematics", test: "Quiz 3", marks: 10, total: 20, date: "2025-11-02", grade: "C" },
      { subject: "Physics", test: "Mid-Term", marks: 48, total: 100, date: "2025-10-16", grade: "D+" },
      { subject: "Physics", test: "Lab Practical", marks: 30, total: 50, date: "2025-11-10", grade: "C" },
      { subject: "English", test: "Mid-Term", marks: 58, total: 100, date: "2025-10-17", grade: "C" },
      { subject: "Chemistry", test: "Mid-Term", marks: 45, total: 100, date: "2025-10-18", grade: "D+" },
      { subject: "Urdu", test: "Mid-Term", marks: 70, total: 100, date: "2025-10-19", grade: "B" },
      { subject: "Computer Science", test: "Mid-Term", marks: 52, total: 100, date: "2025-10-20", grade: "C" },
    ],
    progress: [
      { month: "Aug", gpa: 2.2 }, { month: "Sep", gpa: 2.1 }, { month: "Oct", gpa: 2.3 },
      { month: "Nov", gpa: 2.4 }, { month: "Dec", gpa: 2.5 }, { month: "Jan", gpa: 2.45 },
    ],
    assignments: [
  {
    title: "Algebra Worksheet",
    subject: "Mathematics",
    due: "2025-09-10",
    score: "—",
    status: "Pending",
    question: "Solve all quadratic equations using factorization method.",
    totalMarks: 20,
    chapterName: "Quadratic Equations",
    chapterNumber: 4,
    submissionType: "Handwritten",
    instructions: "Show complete steps. Upload clear scanned PDF."
  },
  {
    title: "Algebra",
    subject: "Mathematics",
    due: "2025-09-10",
    score: "—",
    status: "Pending",
    question: "Solve all quadratic equations using factorization method.",
    totalMarks: 20,
    chapterName: "Quadratic Equations",
    chapterNumber: 4,
    submissionType: "Handwritten",
    instructions: "Show complete steps. Upload clear scanned PDF."
  },
  {
    title: "Essay: Climate Change",
    subject: "English",
    due: "2026-03-01",
    status: "Submitted",
    score: "18/20",
    question: "Write an essay on climate change.",
    totalMarks: 20,
    chapterName: "Essay Writing",
    chapterNumber: 6,
    submissionType: "PDF",
    instructions: "Minimum 500 words."
  }
],
    behavior: [
      { date: "2025-10-05", type: "Warning", note: "Excessive absences - parent meeting scheduled" },
      { date: "2025-11-20", type: "Warning", note: "Incomplete homework multiple times" },
      { date: "2025-12-15", type: "Positive", note: "Showed improvement in December tests" },
    ],
    fees: { total: 45000, paid: 15000, pending: 30000, status: "Overdue" },
  },
  {
    id: 5, name: "Sara Malik", email: "sara.m@school.edu", grade: "10-A", avatar: "SM", gender: "Female",
    dob: "2009-05-03", phone: "+92-322-5678901", guardian: "Tariq Malik", guardianPhone: "+92-304-5432109",
    address: "House 78, Adiala Road, Rawalpindi", enrollDate: "2023-08-01", status: "Active",
    attendance: { present: 140, absent: 10, late: 5, total: 155 },
    tests: [
      { subject: "Mathematics", test: "Mid-Term", marks: 82, total: 100, date: "2025-10-15", grade: "A" },
      { subject: "Mathematics", test: "Quiz 3", marks: 16, total: 20, date: "2025-11-02", grade: "A" },
      { subject: "Physics", test: "Mid-Term", marks: 79, total: 100, date: "2025-10-16", grade: "B+" },
      { subject: "Physics", test: "Lab Practical", marks: 44, total: 50, date: "2025-11-10", grade: "A" },
      { subject: "English", test: "Mid-Term", marks: 88, total: 100, date: "2025-10-17", grade: "A" },
      { subject: "Chemistry", test: "Mid-Term", marks: 75, total: 100, date: "2025-10-18", grade: "B+" },
      { subject: "Urdu", test: "Mid-Term", marks: 85, total: 100, date: "2025-10-19", grade: "A" },
      { subject: "Computer Science", test: "Mid-Term", marks: 90, total: 100, date: "2025-10-20", grade: "A+" },
    ],
    progress: [
      { month: "Aug", gpa: 3.3 }, { month: "Sep", gpa: 3.4 }, { month: "Oct", gpa: 3.5 },
      { month: "Nov", gpa: 3.6 }, { month: "Dec", gpa: 3.65 }, { month: "Jan", gpa: 3.7 },
    ],
    assignments: [
  {
    title: "Algebra Worksheet",
    subject: "Mathematics",
    due: "2025-09-10",
    score: "—",
    status: "Pending",
    question: "Solve all quadratic equations using factorization method.",
    totalMarks: 20,
    chapterName: "Quadratic Equations",
    chapterNumber: 4,
    submissionType: "Handwritten",
    instructions: "Show complete steps. Upload clear scanned PDF."
  },
  {
    title: "Algebra",
    subject: "Mathematics",
    due: "2025-09-10",
    score: "—",
    status: "Pending",
    question: "Solve all quadratic equations using factorization method.",
    totalMarks: 20,
    chapterName: "Quadratic Equations",
    chapterNumber: 4,
    submissionType: "Handwritten",
    instructions: "Show complete steps. Upload clear scanned PDF."
  },
  {
    title: "Essay: Climate Change",
    subject: "English",
    due: "2026-03-01",
    status: "Submitted",
    score: "18/20",
    question: "Write an essay on climate change.",
    totalMarks: 20,
    chapterName: "Essay Writing",
    chapterNumber: 6,
    submissionType: "PDF",
    instructions: "Minimum 500 words."
  }
],
    behavior: [
      { date: "2025-11-01", type: "Positive", note: "Active participant in extracurricular activities" },
    ],
    fees: { total: 45000, paid: 45000, pending: 0, status: "Paid" },
  },
  {
    id: 6, name: "Usman Tariq", email: "usman.t@school.edu", grade: "10-B", avatar: "UT", gender: "Male",
    dob: "2009-09-14", phone: "+92-311-6789012", guardian: "Tariq Mehmood", guardianPhone: "+92-305-4321098",
    address: "House 23, Murree Road, Rawalpindi", enrollDate: "2023-08-01", status: "Active",
    attendance: { present: 135, absent: 14, late: 6, total: 155 },
    tests: [
      { subject: "Mathematics", test: "Mid-Term", marks: 78, total: 100, date: "2025-10-15", grade: "B+" },
      { subject: "Mathematics", test: "Quiz 3", marks: 15, total: 20, date: "2025-11-02", grade: "B+" },
      { subject: "Physics", test: "Mid-Term", marks: 85, total: 100, date: "2025-10-16", grade: "A" },
      { subject: "Physics", test: "Lab Practical", marks: 46, total: 50, date: "2025-11-10", grade: "A+" },
      { subject: "English", test: "Mid-Term", marks: 70, total: 100, date: "2025-10-17", grade: "B" },
      { subject: "Chemistry", test: "Mid-Term", marks: 88, total: 100, date: "2025-10-18", grade: "A" },
      { subject: "Urdu", test: "Mid-Term", marks: 72, total: 100, date: "2025-10-19", grade: "B" },
      { subject: "Computer Science", test: "Mid-Term", marks: 92, total: 100, date: "2025-10-20", grade: "A+" },
    ],
    progress: [
      { month: "Aug", gpa: 3.2 }, { month: "Sep", gpa: 3.3 }, { month: "Oct", gpa: 3.4 },
      { month: "Nov", gpa: 3.5 }, { month: "Dec", gpa: 3.55 }, { month: "Jan", gpa: 3.6 },
    ],
    assignments: [
      {
  title: "Algebra Worksheet",
  subject: "Mathematics",
  due: "2025-09-10",
  score: "—",
  status: "Pending",

  question: "Solve all quadratic equations using factorization method.",
  totalMarks: 20,
  chapterName: "Quadratic Equations",
  chapterNumber: 4,
  submissionType: "Handwritten",
  instructions: "Show complete steps. Use blue/black pen. Upload clear scanned PDF."
},
      { title: "Lab Report: Optics", subject: "Physics", due: "2026-02-28", status: "Submitted", score: "19/20" },
      { title: "Essay: Climate Change", subject: "English", due: "2026-03-01", status: "Late", score: "15/20" },
    ],
    behavior: [
      { date: "2025-10-10", type: "Positive", note: "Excellent lab work and practical skills" },
    ],
    fees: { total: 45000, paid: 45000, pending: 0, status: "Paid" },
  },
];

export const COURSES: Course[] = [
 {
    id: 1,
    name: "Mathematics",
    code: "MATH-10",
    teacher: "Mr. Imran Ali",
    teacherId: 1,
    description:
      "This course covers Algebra, Trigonometry, Statistics and Probability.",
    schedule: "Mon, Wed, Fri - 8:00 AM",
    room: "Room 201",
    credits: 5,
    progress: 68,

    pastPapers: [
      { title: "Mid Term Paper", year: "2025", totalMarks: 50, file: "math_mid_2025.pdf" },
      { title: "Final Term Paper", year: "2024", totalMarks: 100, file: "math_final_2024.pdf" },
    ],
  }, ];

export const ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: "Annual Sports Day - Registration Open", date: "2026-02-20", priority: "high", content: "Register your students for the Annual Sports Day by March 5th. Events include athletics, cricket, and football.", author: "Admin Office" },
  { id: 2, title: "Parent-Teacher Meeting Scheduled", date: "2026-02-18", priority: "high", content: "PTM for Grade 10 students on March 1st, Saturday, from 9 AM to 1 PM.", author: "Principal" },
  { id: 3, title: "Science Fair Projects Submission", date: "2026-02-15", priority: "medium", content: "All science fair project proposals must be submitted by February 28th.", author: "Science Dept." },
  { id: 4, title: "Library New Arrivals", date: "2026-02-12", priority: "low", content: "50+ new books added to the library including STEM and literature sections.", author: "Librarian" },
  { id: 5, title: "Mid-Term Results Published", date: "2026-02-10", priority: "medium", content: "Mid-term examination results are now available in the student portal.", author: "Exam Cell" },
];

export const TIMETABLE: TimetableEntry[] = [
  { time: "8:00 AM - 8:45 AM", mon: "Mathematics", tue: "Physics", wed: "Mathematics", thu: "Chemistry", fri: "Mathematics", sat: "-" },
  { time: "8:50 AM - 9:35 AM", mon: "English", tue: "Mathematics", wed: "Physics", thu: "Physics", fri: "English", sat: "-" },
  { time: "9:40 AM - 10:25 AM", mon: "Chemistry", tue: "English", wed: "English", thu: "Urdu", fri: "Chemistry", sat: "-" },
  { time: "10:25 AM - 10:45 AM", mon: "BREAK", tue: "BREAK", wed: "BREAK", thu: "BREAK", fri: "BREAK", sat: "BREAK" },
  { time: "10:45 AM - 11:30 AM", mon: "Urdu", tue: "Chemistry", wed: "Urdu", thu: "English", fri: "Comp. Sci", sat: "-" },
  { time: "11:35 AM - 12:20 PM", mon: "Physics", tue: "Comp. Sci", wed: "Comp. Sci", thu: "Mathematics", fri: "Urdu", sat: "-" },
  { time: "12:20 PM - 1:00 PM", mon: "Assembly", tue: "Sports", wed: "Library", thu: "Assembly", fri: "Juma Prayer", sat: "-" },
];

export interface Teacher {
  id: number;
  name: string;
  subject: string;
  email: string;
  avatar: string;
  classes: string[];
  students: number;
  phone: string;
  address: string;
  dob: string;
  gender: string;
  qualification: string;
  joinDate: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export interface TeacherAssignment {
  id: number;
  title: string;
  subject: string;
  classGrade: string;
  dueDate: string;
  totalMarks: number;
  description: string;
  createdDate: string;
  question?: string;
  chapterName?: string;
  chapterNumber?: number;
  submissionType?: "Handwritten" | "Word" | "PDF";
  instructions?: string;
  assignedStudentIds?: number[];
  submissions: {
    studentId: number;
    studentName: string;
    studentAvatar: string;
    status: string;
    submittedDate?: string;
    fileName?: string;
    marks?: number;
    feedback?: string;
  }[];
}

export const TEACHERS: Teacher[] = [
  { id: 1, name: "Mr. Imran Ali", subject: "Mathematics", email: "imran@school.edu", avatar: "IA", classes: ["10-A", "10-B"], students: 32, phone: "+92-300-1111111", address: "House 5, F-8, Islamabad", dob: "1985-04-12", gender: "Male", qualification: "M.Sc Mathematics, B.Ed", joinDate: "2018-03-01", emergencyContact: "Mrs. Imran Ali", emergencyPhone: "+92-301-2222222" },
  { id: 2, name: "Dr. Sana Fatima", subject: "Physics", email: "sana@school.edu", avatar: "SF", classes: ["10-A", "10-B"], students: 30, phone: "+92-300-3333333", address: "Flat 2A, G-9, Islamabad", dob: "1982-08-20", gender: "Female", qualification: "Ph.D Physics", joinDate: "2016-08-15", emergencyContact: "Mr. Ahmed Fatima", emergencyPhone: "+92-302-4444444" },
  { id: 3, name: "Ms. Hira Nawaz", subject: "English", email: "hira@school.edu", avatar: "HN", classes: ["10-A", "10-B"], students: 32, phone: "+92-300-5555555", address: "House 12, Bahria Town, Rawalpindi", dob: "1990-01-05", gender: "Female", qualification: "M.A English Literature, B.Ed", joinDate: "2020-01-10", emergencyContact: "Mr. Nawaz Khan", emergencyPhone: "+92-303-6666666" },
  { id: 4, name: "Mr. Waqas Ahmed", subject: "Chemistry", email: "waqas@school.edu", avatar: "WA", classes: ["10-A", "10-B"], students: 30, phone: "+92-300-7777777", address: "Street 3, Satellite Town, Rawalpindi", dob: "1988-11-30", gender: "Male", qualification: "M.Sc Chemistry", joinDate: "2019-06-01", emergencyContact: "Mrs. Waqas Ahmed", emergencyPhone: "+92-304-8888888" },
  { id: 5, name: "Ms. Nazia Bibi", subject: "Urdu", email: "nazia@school.edu", avatar: "NB", classes: ["10-A", "10-B"], students: 32, phone: "+92-300-9999999", address: "House 45, Westridge, Rawalpindi", dob: "1987-06-18", gender: "Female", qualification: "M.A Urdu, B.Ed", joinDate: "2017-09-01", emergencyContact: "Mr. Ali Raza", emergencyPhone: "+92-305-1010101" },
  { id: 6, name: "Mr. Faisal Iqbal", subject: "Computer Science", email: "faisal@school.edu", avatar: "FI", classes: ["10-A", "10-B"], students: 28, phone: "+92-300-1212121", address: "House 8, PWD Colony, Islamabad", dob: "1991-02-25", gender: "Male", qualification: "M.Sc Computer Science", joinDate: "2021-03-15", emergencyContact: "Mrs. Faisal Iqbal", emergencyPhone: "+92-306-1313131" },
];

export const TEACHER_ASSIGNMENTS: TeacherAssignment[] = [
  {
    id: 1, title: "Algebra Worksheet Ch.5", subject: "Mathematics", classGrade: "10-A", dueDate: "2026-02-25", totalMarks: 20, description: "Complete all exercises from Chapter 5 - Quadratic Equations. Show all working steps.", createdDate: "2026-02-15",
    submissions: [
      { studentId: 1, studentName: "Ayesha Khan", studentAvatar: "AK", status: "Submitted", submittedDate: "2026-02-23", fileName: "ayesha_ch5.pdf", marks: 19, feedback: "Excellent work!" },
      { studentId: 2, studentName: "Ahmed Raza", studentAvatar: "AR", status: "Late", submittedDate: "2026-02-26", fileName: "ahmed_algebra.pdf", marks: 14, feedback: "Submitted late. Missing steps in Q3." },
      { studentId: 5, studentName: "Sara Malik", studentAvatar: "SM", status: "Submitted", submittedDate: "2026-02-24", fileName: "sara_worksheet.pdf", marks: 18, feedback: "Good work." },
    ]
  },
  {
    id: 2, title: "Quadratic Equations Practice", subject: "Mathematics", classGrade: "10-B", dueDate: "2026-02-27", totalMarks: 20, description: "Solve practice problems on quadratic equations. Include graphical solutions.", createdDate: "2026-02-17",
    submissions: [
      { studentId: 3, studentName: "Fatima Noor", studentAvatar: "FN", status: "Submitted", submittedDate: "2026-02-25", fileName: "fatima_quad.pdf", marks: 20, feedback: "Perfect!" },
      { studentId: 4, studentName: "Bilal Hussain", studentAvatar: "BH", status: "Missing" },
      { studentId: 6, studentName: "Usman Tariq", studentAvatar: "UT", status: "Submitted", submittedDate: "2026-02-26", fileName: "usman_practice.pdf" },
    ]
  },
  {
    id: 3, title: "Trigonometry Basics", subject: "Mathematics", classGrade: "10-A", dueDate: "2026-03-05", totalMarks: 25, description: "Introduction to trigonometric ratios. Complete exercises 1-15.", createdDate: "2026-02-25",
    submissions: [
      { studentId: 1, studentName: "Ayesha Khan", studentAvatar: "AK", status: "Pending" },
      { studentId: 2, studentName: "Ahmed Raza", studentAvatar: "AR", status: "Pending" },
      { studentId: 5, studentName: "Sara Malik", studentAvatar: "SM", status: "Pending" },
    ]
  },
  {
    id: 4, title: "Statistics & Probability", subject: "Mathematics", classGrade: "10-B", dueDate: "2026-03-10", totalMarks: 30, description: "Data analysis project - collect and analyze real-world data using statistical methods.", createdDate: "2026-02-28",
    submissions: [
      { studentId: 3, studentName: "Fatima Noor", studentAvatar: "FN", status: "Pending" },
      { studentId: 4, studentName: "Bilal Hussain", studentAvatar: "BH", status: "Pending" },
      { studentId: 6, studentName: "Usman Tariq", studentAvatar: "UT", status: "Pending" },
    ]
  },
];
