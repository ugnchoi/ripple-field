import resumeJson from '../../docs/resume/resume.json';

export interface Profile {
  network: string;
  username: string;
  url: string;
}

export interface Basics {
  name: string;
  title: string;
  specialties: string[];
  tagline: string;
  oneLiner: string;
  summary: string;
  email?: string;
  phone?: string;
  location: { current: string; openToWork?: string[] };
  profiles: Profile[];
  stats?: { connections?: string; followers?: number };
}

export interface Pillar {
  title: string;
  description: string;
}

export interface SubRole {
  period: string;
  title: string;
  role: string;
  highlights: string[];
}

export interface Work {
  company: string;
  position: string;
  team?: string;
  employmentType?: string;
  location?: string;
  workMode?: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  summary: string;
  highlights?: string[];
  subRoles?: SubRole[];
  skills?: string[];
  recognition?: string;
}

export interface SkillGroup {
  category: string;
  keywords: string[];
}

export interface Education {
  institution: string;
  degree: string;
  area: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  activities?: string[];
  coursework?: {
    graduationWork?: string;
    advancedStudies?: string[];
    fundamentals?: string[];
  };
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
}

export interface Award {
  title: string;
  result: string;
  date: string;
  category: string;
}

export interface Language {
  language: string;
  fluency: string;
}

export interface OtherRole {
  role: string;
  organization: string;
  startDate: string;
  endDate: string;
  summary?: string;
  languages?: string[];
}

export interface Recommendation {
  name: string;
  title: string;
  date: string;
  relationship: string;
  text: string;
}

export interface Resume {
  basics: Basics;
  pillars: Pillar[];
  work: Work[];
  skills: SkillGroup[];
  education: Education[];
  certifications: Certification[];
  certificationsNote?: string;
  awards: Award[];
  languages: Language[];
  volunteerAndOther: OtherRole[];
  recommendations: Recommendation[];
  meta?: Record<string, unknown>;
}

export const resume = resumeJson as Resume;
