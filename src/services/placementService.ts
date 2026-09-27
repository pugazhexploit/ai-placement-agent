import { Application, ApplicationStatus, Company, PlacementDrive, UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_COMPANIES, INITIAL_DRIVES, INITIAL_APPLICATIONS, INITIAL_STUDENTS } from '../lib/mockData';

const STORAGE_KEYS = {
  COMPANIES: 'campushire_companies',
  DRIVES: 'campushire_drives',
  APPLICATIONS: 'campushire_applications',
};

function getLocal<T>(key: string, initial: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initial;
  }
}

function setLocal<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const placementService = {
  async getCompanies(): Promise<Company[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('companies').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Company[];
    }
    return getLocal<Company[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  },

  async addCompany(company: Omit<Company, 'id'>): Promise<Company> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('companies').insert([company]).select().single();
      if (!error && data) return data as Company;
    }
    const companies = getLocal<Company[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    const newCompany: Company = {
      ...company,
      id: 'c_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    companies.unshift(newCompany);
    setLocal(STORAGE_KEYS.COMPANIES, companies);
    return newCompany;
  },

  async getDrives(): Promise<PlacementDrive[]> {
    const companies = await this.getCompanies();
    const companyMap = new Map(companies.map(c => [c.id, c]));

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('placement_drives').select('*').order('deadline', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(d => ({
          ...d,
          company: companyMap.get(d.company_id),
        })) as PlacementDrive[];
      }
    }

    const drives = getLocal<PlacementDrive[]>(STORAGE_KEYS.DRIVES, INITIAL_DRIVES);
    return drives.map(d => ({
      ...d,
      company: companyMap.get(d.company_id),
    }));
  },

  async addDrive(drive: Omit<PlacementDrive, 'id' | 'company'>): Promise<PlacementDrive> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('placement_drives').insert([drive]).select().single();
      if (!error && data) {
        const companies = await this.getCompanies();
        return {
          ...data,
          company: companies.find(c => c.id === data.company_id),
        } as PlacementDrive;
      }
    }

    const drives = getLocal<PlacementDrive[]>(STORAGE_KEYS.DRIVES, INITIAL_DRIVES);
    const newDrive: PlacementDrive = {
      ...drive,
      id: 'd_' + Date.now(),
      created_at: new Date().toISOString(),
    };
    drives.unshift(newDrive);
    setLocal(STORAGE_KEYS.DRIVES, drives);
    const companies = await this.getCompanies();
    return {
      ...newDrive,
      company: companies.find(c => c.id === newDrive.company_id),
    };
  },

  async getApplications(studentId?: string): Promise<Application[]> {
    const drives = await this.getDrives();
    const driveMap = new Map(drives.map(d => [d.id, d]));
    const studentMap = new Map<string, UserProfile>(INITIAL_STUDENTS.map(s => [s.id, s]));

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('applications').select('*').order('applied_at', { ascending: false });
        if (studentId) query = query.eq('student_id', studentId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(app => ({
            id: app.id,
            student_id: app.student_id,
            drive_id: app.drive_id,
            status: app.status,
            applied_at: app.applied_at,
            student: studentMap.get(app.student_id) || {
              id: app.student_id,
              full_name: 'Alex Turner',
              email: 'student@campus.edu',
              department: 'CSE',
              register_number: '21CS042',
              skills: ['React', 'TypeScript'],
              role: 'student',
            },
            drive: driveMap.get(app.drive_id) || {
              id: app.drive_id,
              company_id: 'c1',
              job_role: 'Associate Software Engineer',
              description: 'Campus Placement Drive',
              package: '18.0 LPA',
              location: 'Bengaluru',
              eligibility: 'Min 7.5 CGPA',
              deadline: new Date().toISOString(),
              drive_date: new Date().toISOString(),
              company: { id: 'c1', name: 'Technology Partner', description: 'Campus Partner' },
            },
          })) as Application[];
        }
      } catch (err) {
        console.warn('Supabase applications fetch error, falling back to local dataset:', err);
      }
    }

    const applications = getLocal<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const filtered = studentId ? applications.filter(a => a.student_id === studentId) : applications;

    return filtered.map(app => ({
      ...app,
      student: app.student || studentMap.get(app.student_id) || {
        id: app.student_id,
        full_name: 'Alex Turner',
        email: 'student@campus.edu',
        department: 'CSE',
        register_number: '21CS042',
        skills: ['React', 'TypeScript'],
        role: 'student',
      },
      drive: app.drive || driveMap.get(app.drive_id) || {
        id: app.drive_id,
        company_id: 'c1',
        job_role: 'Associate Software Engineer',
        description: 'Campus Placement Drive',
        package: '18.0 LPA',
        location: 'Bengaluru',
        eligibility: 'Min 7.5 CGPA',
        deadline: new Date().toISOString(),
        drive_date: new Date().toISOString(),
        company: { id: 'c1', name: 'Google', description: 'Campus Partner' },
      },
    }));
  },

  async applyToDrive(studentId: string, driveId: string): Promise<Application> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('applications')
        .insert([{ student_id: studentId, drive_id: driveId, status: 'Applied' }])
        .select()
        .single();
      if (!error && data) return data as Application;
    }

    const applications = getLocal<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const existing = applications.find(a => a.student_id === studentId && a.drive_id === driveId);
    if (existing) return existing;

    const newApp: Application = {
      id: 'app_' + Date.now(),
      student_id: studentId,
      drive_id: driveId,
      status: 'Applied',
      applied_at: new Date().toISOString(),
    };
    applications.unshift(newApp);
    setLocal(STORAGE_KEYS.APPLICATIONS, applications);
    return newApp;
  },

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.from('applications').update({ status }).eq('id', applicationId);
    }
    const applications = getLocal<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    const index = applications.findIndex(a => a.id === applicationId);
    if (index !== -1) {
      applications[index].status = status;
      setLocal(STORAGE_KEYS.APPLICATIONS, applications);
    }
  }
};
