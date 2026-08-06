import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const SchoolProfileContext = createContext(null);

const DEFAULTS = { school_name: "Your School Name", tagline: "", logo_base64: null, primary_color: "#2f9e44" };

export function SchoolProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULTS);

  const reload = () => {
    api.get("/school-profile").then((res) => setProfile(res.data)).catch(() => {});
  };

  useEffect(reload, []);

  return (
    <SchoolProfileContext.Provider value={{ profile, reload }}>
      {children}
    </SchoolProfileContext.Provider>
  );
}

export function useSchoolProfile() {
  return useContext(SchoolProfileContext);
}
