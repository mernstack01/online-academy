export const translations = {
  en: {
    nav: {
      courses: 'Courses',
      dashboard: 'Dashboard',
      greeting: 'Hi,',
      logout: 'Log out',
      login: 'Login',
      signup: 'Sign Up',
      language: 'Language',
    },
    home: {
      badge: 'Future of Education',
      titlePrefix: 'Unlock Your',
      titleEmphasis: 'Creative',
      titleSuffix: 'Potential',
      description:
        'Experience a new way of learning with our high-impact courses, expert mentors, and a community dedicated to growth.',
      exploreCourses: 'Explore Courses',
      getStarted: 'Get Started',
      features: {
        expertTitle: 'Expert Tutoring',
        expertDesc: 'Learn from the best in the industry with personalized feedback loops.',
        flexibleTitle: 'Flexible Learning',
        flexibleDesc: 'Learn at your own pace with lifetime access to all course materials.',
        careerTitle: 'Career Support',
        careerDesc: 'Get the tools you need to succeed in your professional journey.',
      },
    },
    footer: {
      summary:
        'Modern courses, experienced mentors, and a strong community to take your skills to the next level.',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      courses: 'Courses',
      login: 'Login',
      register: 'Sign Up',
      contactDesc: 'Questions? Message us on Telegram. We respond quickly.',
      contactCta: 'Message on Telegram',
      rights: 'All rights reserved.',
      tagline: 'A comfortable platform for learners and mentors.',
    },
    courses: {
      title: 'Explore Courses',
      subtitle: 'Expand your skills with our premium academy content',
      empty: 'No courses available yet. Check back later!',
      viewDetails: 'View Details',
      contactAdmin: 'Contact Admin to Buy',
      freeEnroll: 'Free Course — Enroll Inside',
      freeBadge: 'FREE',
      instructorFallback: 'Instructor',
    },
    auth: {
      googleButton: 'Continue with Google',
      or: 'or',
      labels: {
        name: 'Full Name',
        email: 'Email address',
        password: 'Password',
      },
      placeholders: {
        name: 'John Doe',
        email: 'you@example.com',
        password: '••••••••',
        passwordMin: 'Min. 6 characters',
      },
      login: {
        title: 'Welcome Back',
        subtitle: 'Please enter your credentials to access your account',
        forgotPassword: 'Forgot password?',
        submit: 'Log In',
        submitting: 'Logging in...',
        googleLoading: 'Signing in with Google...',
        noAccount: "Don't have an account?",
        signupLink: 'Sign up for free',
      },
      register: {
        title: 'Create Account',
        subtitle: 'Join our academy and start learning today',
        submit: 'Create Account',
        submitting: 'Creating account...',
        googleLoading: 'Signing up with Google...',
        haveAccount: 'Already have an account?',
        loginLink: 'Log in',
      },
    },
    courseDetail: {
      errors: {
        notFound: 'Course not found',
        loadFailed: 'Failed to load course',
        unableToLoad: 'Unable to load course',
      },
      actions: {
        backToCourses: 'Back to Courses',
        contactAdminToBuy: 'Contact Admin to Buy',
        enrollNow: 'Enroll Now',
        loginToEnroll: 'Login to Enroll',
        continueLearning: 'Continue Learning',
        processing: 'Processing...',
      },
      alerts: {
        paidContactAdmin: 'Paid course. Please contact admin to enroll.',
        onlyStudents: 'Only students can enroll in courses.',
        enrolled: 'Successfully enrolled!',
        enrollFailed: 'Enrollment failed',
        enrollError: 'An error occurred during enrollment',
      },
      meta: {
        modulesCount: '{count} Modules',
        lessonsCount: '{count} Lessons',
      },
      labels: {
        description: 'Description',
        syllabus: 'Syllabus',
        curriculumUpdating: 'Curriculum is being updated...',
        pricePaidNote: 'One-time payment for lifetime access',
        priceFreeNote: 'Free access to all materials',
        paidAccessNote: 'Paid course. Access is granted by admin after payment.',
        featureLifetime: 'Lifetime access to all materials',
        featureDownloadable: 'Downloadable resources',
        featureCertificate: 'Certificate of completion',
      },
      hero: {
        academyFallback: 'ACADEMY',
      },
    },
    studentDashboard: {
      title: 'Student Dashboard',
      subtitle: "Welcome back! Here's a summary of your learning progress.",
      stats: {
        enrolledCourses: 'Enrolled Courses',
        totalGrades: 'Total Grades',
        upcomingDeadlines: 'Upcoming Deadlines',
        portfolioItems: 'Portfolio Items',
      },
      tabs: {
        courses: 'My Courses',
        assignments: 'Deadlines',
        grades: 'Recent Grades',
        portfolio: 'Portfolio',
      },
      courses: {
        progress: 'Progress',
        continueLearning: 'Continue Learning',
      },
      assignments: {
        title: 'Upcoming Assignments',
        subtitle: "Don't miss these deadlines.",
        table: {
          assignment: 'Assignment',
          course: 'Course',
          dueDate: 'Due Date',
          action: 'Action',
        },
        viewDetails: 'View Details',
        empty: 'No upcoming assignments.',
      },
      grades: {
        title: 'Recent Grades',
        subtitle: 'Track your performance across courses.',
        submittedOn: 'Submitted on {date}',
        gradeLabel: 'Grade: {grade}%',
        pending: 'Pending Review',
        empty: 'No submissions yet.',
      },
      portfolio: {
        originalAssignment: 'Original Assignment',
        viewWork: 'View Work',
        emptyTitle: 'No portfolio items yet',
        emptySubtitle: 'Mark your best submissions as portfolio items to showcase them here.',
      },
    },
    studentCourse: {
      curriculum: 'Curriculum',
      questionLabel: 'Question {index}',
      submitTest: 'Submit Test',
      score: 'Score: {score} / {total}',
      noVideo: 'No video content for this lesson.',
      readingOnly: 'Reading Material Only',
      lessonNotes: 'Lesson Notes',
      resources: 'Resources',
      selectPromptTitle: 'Select a lesson or test',
      selectPromptSubtitle: 'Choose a topic from the curriculum to start learning.',
    },
    studentAssignment: {
      backToDashboard: 'Back to Dashboard',
      due: 'Due: {date}',
      pointsMax: '100 Points Max',
      finalGrade: 'Final Grade',
      status: 'Status',
      pendingReview: 'Pending Review',
      instructions: 'Instructions',
      teacherFeedback: 'Teacher Feedback',
      yourSubmission: 'Your Submission',
      updatePrevious: 'Update your previous work',
      submitFinal: 'Submit your final work here',
      projectUrlLabel: 'Project URL / File Link',
      projectUrlPlaceholder: 'https://github.com/...',
      commentsLabel: 'Comments (Optional)',
      commentsPlaceholder: 'Write something to your teacher...',
      submitting: 'Submitting...',
      updateSubmission: 'Update Submission',
      submitProject: 'Submit Project',
      pastDue: 'Assignment is past due and cannot be submitted.',
      alerts: {
        missingFile: 'Please provide a file URL or link to your work.',
        submitted: 'Assignment submitted successfully!',
        failed: 'Submission failed',
        error: 'An error occurred during submission',
      },
    },
    lessonVideo: {
      invalidUrl: 'Invalid video URL. Only Vimeo or YouTube links are supported.',
    },
  },
  uz: {
    nav: {
      courses: 'Kurslar',
      dashboard: 'Panel',
      greeting: 'Salom,',
      logout: 'Chiqish',
      login: 'Kirish',
      signup: "Ro'yxatdan o'tish",
      language: 'Til',
    },
    home: {
      badge: "Ta'limning kelajagi",
      titlePrefix: 'Ijodiy',
      titleEmphasis: 'salohiyatingizni',
      titleSuffix: "o'ching",
      description:
        "Yuqori samarali kurslarimiz, tajribali mentorlar va o'sishga bag'ishlangan hamjamiyat bilan o'qishning yangi usulini his qiling.",
      exploreCourses: "Kurslarni ko'rish",
      getStarted: 'Boshlash',
      features: {
        expertTitle: 'Mutaxassis mentorlar',
        expertDesc: "Sohadagi eng yaxshilardan shaxsiy fikr-mulohazalar bilan o'rganing.",
        flexibleTitle: "Moslashuvchan o'qish",
        flexibleDesc: "O'zingizga qulay sur'atda va barcha materiallarga umrboqiy kirish bilan o'rganing.",
        careerTitle: "Karyera qo'llab-quvvatlovi",
        careerDesc: "Kasbiy yo'lingizda muvaffaqiyatga erishish uchun zarur vositalarni oling.",
      },
    },
    footer: {
      summary:
        "Zamonaviy kurslar, tajribali mentorlar va kuchli hamjamiyat bilan bilimlaringizni yangi bosqichga olib chiqing.",
      quickLinks: 'Tezkor havolalar',
      contact: 'Murojaat',
      courses: 'Kurslar',
      login: 'Kirish',
      register: "Ro'yxatdan o'tish",
      contactDesc: "Savollaringiz bo'lsa, Telegram orqali yozing. Tezkor javob beramiz.",
      contactCta: 'Telegramga yozish',
      rights: 'Barcha huquqlar himoyalangan.',
      tagline: "O'quvchi va mentorlar uchun qulay platforma.",
    },
    courses: {
      title: "Kurslarni ko'ring",
      subtitle: "Akademiyamizning premium kontenti bilan ko'nikmalaringizni oshiring",
      empty: "Hozircha kurslar yo'q. Keyinroq qayta tekshiring!",
      viewDetails: 'Tafsilotlar',
      contactAdmin: "Sotib olish uchun admin bilan bog'laning",
      freeEnroll: "Bepul kurs — ichkarida yoziling",
      freeBadge: 'BEPUL',
      instructorFallback: 'Mentor',
    },
    auth: {
      googleButton: 'Google bilan davom etish',
      or: 'yoki',
      labels: {
        name: 'Ism va familiya',
        email: 'Email manzil',
        password: 'Parol',
      },
      placeholders: {
        name: 'Ism Familiya',
        email: 'you@example.com',
        password: '••••••••',
        passwordMin: 'Kamida 6 ta belgi',
      },
      login: {
        title: 'Xush kelibsiz',
        subtitle: "Akkauntingizga kirish uchun ma'lumotlaringizni kiriting",
        forgotPassword: 'Parolni unutdingizmi?',
        submit: 'Kirish',
        submitting: 'Kirilmoqda...',
        googleLoading: 'Google orqali kirilmoqda...',
        noAccount: "Akkauntingiz yo'qmi?",
        signupLink: "Bepul ro'yxatdan o'ting",
      },
      register: {
        title: 'Akkaunt yarating',
        subtitle: "Akademiyamizga qo'shiling va bugun o'qishni boshlang",
        submit: 'Akkaunt yaratish',
        submitting: 'Akkaunt yaratilmoqda...',
        googleLoading: "Google orqali ro'yxatdan o'tilmoqda...",
        haveAccount: 'Akkauntingiz bormi?',
        loginLink: 'Kirish',
      },
    },
    courseDetail: {
      errors: {
        notFound: 'Kurs topilmadi',
        loadFailed: "Kursni yuklab bo'lmadi",
        unableToLoad: "Kursni yuklab bo'lmadi",
      },
      actions: {
        backToCourses: 'Kurslarga qaytish',
        contactAdminToBuy: "Sotib olish uchun admin bilan bog'laning",
        enrollNow: "Hozir yozilish",
        loginToEnroll: 'Yozilish uchun kiring',
        continueLearning: "O'qishni davom ettirish",
        processing: 'Jarayon...',
      },
      alerts: {
        paidContactAdmin: "Pullik kurs. Yozilish uchun admin bilan bog'laning.",
        onlyStudents: "Faqat talabalar kurslarga yozila oladi.",
        enrolled: "Muvaffaqiyatli yozildingiz!",
        enrollFailed: "Yozilish amalga oshmadi",
        enrollError: "Yozilish vaqtida xatolik yuz berdi",
      },
      meta: {
        modulesCount: '{count} Modul',
        lessonsCount: '{count} Dars',
      },
      labels: {
        description: 'Tavsif',
        syllabus: 'Dastur',
        curriculumUpdating: 'Dastur yangilanmoqda...',
        pricePaidNote: "Umrbod kirish uchun bir martalik to'lov",
        priceFreeNote: 'Barcha materiallarga bepul kirish',
        paidAccessNote: "Pullik kurs. To'lovdan so'ng admin kirish beradi.",
        featureLifetime: 'Barcha materiallarga umrbod kirish',
        featureDownloadable: 'Yuklab olinadigan resurslar',
        featureCertificate: 'Yakunlovchi sertifikat',
      },
      hero: {
        academyFallback: 'AKADEMIYA',
      },
    },
    studentDashboard: {
      title: 'Talaba paneli',
      subtitle: "Xush kelibsiz! O'qish jarayoningiz bo'yicha qisqa ma'lumot.",
      stats: {
        enrolledCourses: "Yozilgan kurslar",
        totalGrades: 'Umumiy baholar',
        upcomingDeadlines: 'Yaqin muddatlar',
        portfolioItems: 'Portfolio ishlari',
      },
      tabs: {
        courses: 'Mening kurslarim',
        assignments: 'Muddatlar',
        grades: "So'nggi baholar",
        portfolio: 'Portfolio',
      },
      courses: {
        progress: 'Jarayon',
        continueLearning: "O'qishni davom ettirish",
      },
      assignments: {
        title: 'Yaqin topshiriqlar',
        subtitle: "Muddatlarni o'tkazib yubormang.",
        table: {
          assignment: 'Topshiriq',
          course: 'Kurs',
          dueDate: 'Muddati',
          action: 'Amal',
        },
        viewDetails: 'Tafsilotlar',
        empty: "Yaqin topshiriqlar yo'q.",
      },
      grades: {
        title: "So'nggi baholar",
        subtitle: "Kurslar bo'yicha natijalarni kuzating.",
        submittedOn: 'Topshirildi: {date}',
        gradeLabel: 'Baho: {grade}%',
        pending: "Ko'rib chiqilmoqda",
        empty: "Hali topshiriqlar yo'q.",
      },
      portfolio: {
        originalAssignment: 'Asl topshiriq',
        viewWork: "Ishni ko'rish",
        emptyTitle: "Portfolio hali bo'sh",
        emptySubtitle: "Eng yaxshi topshiriqlaringizni portfolio sifatida belgilab, bu yerda ko'rsating.",
      },
    },
    studentCourse: {
      curriculum: 'Dastur',
      questionLabel: 'Savol {index}',
      submitTest: 'Testni yuborish',
      score: 'Natija: {score} / {total}',
      noVideo: "Bu dars uchun video yo'q.",
      readingOnly: "Faqat o'qish materiali",
      lessonNotes: 'Dars yozuvlari',
      resources: 'Resurslar',
      selectPromptTitle: 'Dars yoki testni tanlang',
      selectPromptSubtitle: "O'qishni boshlash uchun dasturdan mavzu tanlang.",
    },
    studentAssignment: {
      backToDashboard: 'Panelga qaytish',
      due: 'Muddati: {date}',
      pointsMax: 'Maksimal 100 ball',
      finalGrade: 'Yakuniy baho',
      status: 'Holat',
      pendingReview: "Ko'rib chiqilmoqda",
      instructions: "Ko'rsatmalar",
      teacherFeedback: "O'qituvchi izohi",
      yourSubmission: "Sizning topshirig'ingiz",
      updatePrevious: 'Oldingi ishingizni yangilang',
      submitFinal: 'Yakuniy ishni shu yerda yuboring',
      projectUrlLabel: 'Loyiha URL / Fayl havolasi',
      projectUrlPlaceholder: 'https://github.com/...',
      commentsLabel: 'Izohlar (ixtiyoriy)',
      commentsPlaceholder: "O'qituvchingizga izoh yozing...",
      submitting: 'Yuborilmoqda...',
      updateSubmission: "Topshiriqni yangilash",
      submitProject: 'Ishni yuborish',
      pastDue: "Topshiriq muddati o'tgan, yuborib bo'lmaydi.",
      alerts: {
        missingFile: 'Ishingizga havola yoki fayl URL kiriting.',
        submitted: 'Topshiriq muvaffaqiyatli yuborildi!',
        failed: "Yuborish amalga oshmadi",
        error: "Yuborish vaqtida xatolik yuz berdi",
      },
    },
    lessonVideo: {
      invalidUrl: "Video havolasi noto'g'ri. Faqat Vimeo yoki YouTube havolalari qo'llab-quvvatlanadi.",
    },
  },
} as const;

export type Language = keyof typeof translations;
export const supportedLanguages: Language[] = ['uz', 'en'];

export const languageLabels: Record<Language, string> = {
  uz: "O'zbek",
  en: 'English',
};

export type TranslationParams = Record<string, string | number>;

function getNestedValue(obj: Record<string, any>, key: string) {
  return key.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

function applyParams(value: string, params?: TranslationParams) {
  if (!params) return value;
  return Object.entries(params).reduce((result, [token, replacement]) => {
    return result.replace(new RegExp(`\\{${token}\\}`, 'g'), String(replacement));
  }, value);
}

export function getTranslation(
  language: Language,
  key: string,
  params?: TranslationParams,
  fallback?: string
) {
  const primary = getNestedValue(translations[language] as Record<string, any>, key);
  if (typeof primary === 'string') {
    return applyParams(primary, params);
  }

  const english = getNestedValue(translations.en as Record<string, any>, key);
  if (typeof english === 'string') {
    return applyParams(english, params);
  }

  return fallback ?? key;
}
