export type UserRole = 'OWNER' | 'ADMIN' | 'BOARD' | 'GN' | 'CR' | 'COORDINATOR' | 'AGENT';

export interface UserProfile {
  id: string;
  enrollment: string; // matricula
  name: string;
  role: UserRole;
  whatsapp?: string;
  unit_id?: string;
  polo_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Unit {
  id: string;
  name: string;
  polo_id: string;
}

export interface Polo {
  id: string;
  name: string;
}

export interface GoalForm {
  id: string;
  title: string;
  description: string;
  created_by: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Question {
  id: string;
  form_id: string;
  text: string;
  type: 'number' | 'text';
  min_delivery?: number;
  created_at: string;
}

export interface Response {
  id: string;
  question_id: string;
  coordinator_id: string;
  value: string | number;
  week_number: number;
  year: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details?: string;
  created_at: string;
}
