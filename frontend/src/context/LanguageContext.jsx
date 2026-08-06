import { createContext, useContext, useState } from "react";

const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard", myChildren: "My Children", students: "Students", teachers: "Teachers",
    classes: "Classes", attendance: "Attendance", timetable: "Timetable", homework: "Homework",
    examination: "Examination", quizzes: "Quizzes", fees: "Fees", library: "Library",
    transport: "Transport", hostel: "Hostel", leaveManagement: "Leave Management", payroll: "Payroll",
    certificates: "Certificates", announcements: "Announcements", reportsAnalytics: "Reports & Analytics",
    userAccess: "User Access", auditLog: "Audit Log", settings: "Settings", enquiries: "Admissions/Enquiries",
    events: "Events & Calendar", inventory: "Inventory", analytics: "Student Analytics", logout: "Logout", save: "Save", cancel: "Cancel",
    add: "Add", search: "Search...", loading: "Loading...", welcome: "Welcome",
  },
  hi: {
    dashboard: "डैशबोर्ड", myChildren: "मेरे बच्चे", students: "छात्र", teachers: "शिक्षक",
    classes: "कक्षाएँ", attendance: "उपस्थिति", timetable: "समय सारणी", homework: "गृहकार्य",
    examination: "परीक्षा", quizzes: "क्विज़", fees: "फीस", library: "पुस्तकालय",
    transport: "परिवहन", hostel: "छात्रावास", leaveManagement: "अवकाश प्रबंधन", payroll: "वेतन",
    certificates: "प्रमाणपत्र", announcements: "सूचनाएँ", reportsAnalytics: "रिपोर्ट व विश्लेषण",
    userAccess: "उपयोगकर्ता पहुँच", auditLog: "गतिविधि लॉग", settings: "सेटिंग्स", enquiries: "प्रवेश पूछताछ",
    events: "कार्यक्रम व कैलेंडर", inventory: "इन्वेंटरी", analytics: "छात्र विश्लेषण", logout: "लॉग आउट", save: "सहेजें", cancel: "रद्द करें",
    add: "जोड़ें", search: "खोजें...", loading: "लोड हो रहा है...", welcome: "स्वागत है",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("erp_lang") || "en");

  const setLanguage = (l) => {
    setLang(l);
    localStorage.setItem("erp_lang", l);
  };

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
