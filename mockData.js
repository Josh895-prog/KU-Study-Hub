/**
 * MOCK DATA FOR KENYATTA UNIVERSITY (KU) STUDY RESOURCE HUB
 * Collections: courses, resources, users
 */

export const INITIAL_COURSES = [
  {
    id: "BBA310",
    code: "BBA 310",
    name: "Principles of Marketing",
    department: "School of Business",
    description: "Foundational principles of marketing management, market analysis, buyer behavior, and marketing mix strategies.",
    resourceCount: 5
  },
  {
    id: "SPH318",
    code: "SPH 318",
    name: "Quantum Mechanics I",
    department: "School of Pure & Applied Sciences",
    description: "Wave mechanics, Schrödinger wave equation, operator formalism, and atomic structure applications.",
    resourceCount: 4
  },
  {
    id: "BIT201",
    code: "BIT 201",
    name: "Data Structures & Algorithms",
    department: "Computing & IT",
    description: "Linear and non-linear data structures, algorithmic complexity (Big-O), searching, sorting, and graph algorithms.",
    resourceCount: 6
  },
  {
    id: "ECE410",
    code: "ECE 410",
    name: "Control Systems Engineering",
    department: "Engineering & Technology",
    description: "Feedback control systems, transfer functions, stability criteria (Routh-Hurwitz, Nyquist), and PID design.",
    resourceCount: 3
  },
  {
    id: "ALT100",
    code: "ALT 100",
    name: "Communication & Study Skills",
    department: "Humanities & Social Sciences",
    description: "Essential academic writing, critical listening, research methods, presentation skills, and university study habits.",
    resourceCount: 4
  },
  {
    id: "SMA200",
    code: "SMA 200",
    name: "Calculus II",
    department: "School of Pure & Applied Sciences",
    description: "Techniques of integration, improper integrals, infinite series, Taylor series, and parametric equations.",
    resourceCount: 5
  },
  {
    id: "EET302",
    code: "EET 302",
    name: "Digital Signal Processing",
    department: "Engineering & Technology",
    description: "Discrete-time signals, Z-transform, Discrete Fourier Transform (DFT/FFT), and FIR/IIR filter design.",
    resourceCount: 3
  },
  {
    id: "BAC200",
    code: "BAC 200",
    name: "Financial Accounting I",
    department: "School of Business",
    description: "Double-entry bookkeeping, trial balance preparation, financial statements, and ledger reconciliations.",
    resourceCount: 4
  }
];

export const DEPARTMENTS = [
  "All Departments",
  "School of Business",
  "Computing & IT",
  "School of Pure & Applied Sciences",
  "Engineering & Technology",
  "Humanities & Social Sciences",
  "School of Education"
];

export const RESOURCE_TYPES = [
  "All Types",
  "Notes",
  "Past Paper",
  "Assignment",
  "Other"
];

export const INITIAL_RESOURCES = [
  {
    id: "res_101",
    title: "BBA 310 End of Semester Exam (2024 with Marking Scheme)",
    description: "Complete past paper covering 4 P's, market segmentation, and case studies. Includes solved answer keys.",
    courseCode: "BBA 310",
    department: "School of Business",
    resourceType: "Past Paper",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileName: "BBA_310_2024_Exam_Solutions.pdf",
    fileSize: "1.8 MB",
    uploaderId: "user_ku_10",
    uploaderName: "Mercy Wanjiru",
    uploaderEmail: "wanjiru.m@students.ku.ac.ke",
    upvotesCount: 24,
    upvotedBy: ["user_ku_10", "user_demo_01"],
    createdAt: "2026-08-10T14:30:00.000Z"
  },
  {
    id: "res_102",
    title: "BIT 201 Comprehensive Lecture Notes & C++ Data Structures Code",
    description: "Detailed handwritten lecture notes on Linked Lists, Binary Search Trees, Graphs, and Hash Tables with C++ samples.",
    courseCode: "BIT 201",
    department: "Computing & IT",
    resourceType: "Notes",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileName: "BIT_201_Full_Lecture_Notes.pdf",
    fileSize: "4.2 MB",
    uploaderId: "user_ku_12",
    uploaderName: "Brian Omondi",
    uploaderEmail: "omondi.b@students.ku.ac.ke",
    upvotesCount: 42,
    upvotedBy: ["user_ku_12"],
    createdAt: "2026-08-08T09:15:00.000Z"
  },
  {
    id: "res_103",
    title: "SPH 318 Quantum Wave Equations Formula Sheet & CAT 1 Solutions",
    description: "Quick revision summary sheet for 1D Schrödinger equations, step potentials, and angular momentum operators.",
    courseCode: "SPH 318",
    department: "School of Pure & Applied Sciences",
    resourceType: "Notes",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileName: "SPH_318_Quantum_Formula_Sheet.pdf",
    fileSize: "950 KB",
    uploaderId: "user_ku_15",
    uploaderName: "Kevin Kiprop",
    uploaderEmail: "kiprop.k@students.ku.ac.ke",
    upvotesCount: 19,
    upvotedBy: [],
    createdAt: "2026-08-05T16:20:00.000Z"
  },
  {
    id: "res_104",
    title: "ECE 410 Group Assignment 2 Solution - MATLAB Root Locus Plots",
    description: "MATLAB script and step-by-step PDF derivation for control system stability analysis and Bode plots.",
    courseCode: "ECE 410",
    department: "Engineering & Technology",
    resourceType: "Assignment",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileName: "ECE_410_Assignment_2_MATLAB.pdf",
    fileSize: "2.1 MB",
    uploaderId: "user_ku_12",
    uploaderName: "Brian Omondi",
    uploaderEmail: "omondi.b@students.ku.ac.ke",
    upvotesCount: 15,
    upvotedBy: [],
    createdAt: "2026-08-03T11:45:00.000Z"
  },
  {
    id: "res_105",
    title: "SMA 200 Integration Techniques Practice Problem Set (50+ Solved Examples)",
    description: "Integration by parts, partial fractions, trigonometric substitution, and improper integrals practice handbook.",
    courseCode: "SMA 200",
    department: "School of Pure & Applied Sciences",
    resourceType: "Notes",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileName: "SMA_200_Integration_Mastery.pdf",
    fileSize: "3.5 MB",
    uploaderId: "user_ku_18",
    uploaderName: "Faith Muthoni",
    uploaderEmail: "muthoni.f@students.ku.ac.ke",
    upvotesCount: 31,
    upvotedBy: ["user_ku_18"],
    createdAt: "2026-08-01T10:10:00.000Z"
  },
  {
    id: "res_106",
    title: "ALT 100 APA Citation Guide & Term Paper Template",
    description: "Standard Kenyatta University library guidelines for APA 7th edition referencing, essay structure, and plagiarism checks.",
    courseCode: "ALT 100",
    department: "Humanities & Social Sciences",
    resourceType: "Other",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileName: "ALT_100_APA_Citation_Guide.docx",
    fileSize: "680 KB",
    uploaderId: "user_ku_10",
    uploaderName: "Mercy Wanjiru",
    uploaderEmail: "wanjiru.m@students.ku.ac.ke",
    upvotesCount: 28,
    upvotedBy: [],
    createdAt: "2026-07-28T08:00:00.000Z"
  }
];
