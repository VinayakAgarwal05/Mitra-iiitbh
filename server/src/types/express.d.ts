export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  roll_number: string;
  academic_year: string;
  department: string;
  role: 'super_admin' | 'admin' | 'representative' | 'student';
  is_verified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
