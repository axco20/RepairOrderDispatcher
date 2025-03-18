export interface User {
    name: string;
    email: string;
    password: string;
    role: "admin" | "technician";
    skill_level: 1 | 2 | 3;
  }
  