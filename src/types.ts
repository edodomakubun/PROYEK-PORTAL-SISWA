export interface Env {
  DB: D1Database;
  PORTAL_SISWA_BUCKET: R2Bucket;
  PORTAL_GURU_STORAGE?: R2Bucket;
  ASSETS?: Fetcher;
  NIK_API_KEY?: string;
  API_CO_ID_KEY?: string;
}

export type Role = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string | number;
  username: string;
  full_name?: string;
  avatar_url?: string | null;
  role: Role;
  is_active: number;
  linked_id: number | null;
  is_document_reviewer?: number;
  homeroom_class?: string | null;
}

export interface Student {
  id: number;
  nipd?: string | null;
  nisn?: string | null;
  nik?: string | null;
  name: string;
  class_name: string;
  class_id?: number | null;
  status?: 'active' | 'graduated' | 'mutation_pending' | 'pindah_sekolah' | 'tidak_bersekolah' | string;
  mutation_status?: 'pending' | 'approved' | 'rejected' | null;
  graduation_year?: string | null;
  graduation_date?: string | null;
  graduation_status?: string | null;
  photo_url: string | null;
  birth_place: string | null;
  birth_date: string | null;
  gender?: string | null;
  religion?: string | null;
  entry_date?: string | null;
  created_at?: string;
  // Parent info joined
  father_name?: string | null;
  is_father_alive?: number;
  mother_name?: string | null;
  is_mother_alive?: number;
  uploaded_docs?: string | null;
  required_photo?: number;
  required_kk?: number;
  required_akte?: number;
  akte_status?: 'pending' | 'approved' | 'rejected' | null;
  kk_status?: 'pending' | 'approved' | 'rejected' | null;
}

export interface StudentMutation {
  id: number;
  student_id: number;
  mutation_type: 'pindah_sekolah' | 'tidak_bersekolah';
  mutation_date: string;
  reason: string;
  destination_school?: string | null;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejection_note?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_by?: string | null;
  created_at?: string;
  // Joined fields
  student_name?: string;
  class_name?: string;
  nik?: string | null;
  nipd?: string | null;
  nisn?: string | null;
  birth_place?: string | null;
  birth_date?: string | null;
  photo_url?: string | null;
  father_name?: string | null;
  is_father_alive?: number | null;
  mother_name?: string | null;
  is_mother_alive?: number | null;
  akte_url?: string | null;
  akte_path?: string | null;
  akte_status?: string | null;
  kk_url?: string | null;
  kk_path?: string | null;
  kk_status?: string | null;
  doc_photo_url?: string | null;
  doc_photo_path?: string | null;
  doc_photo_status?: string | null;
}


export interface StudentParent {
  id: number;
  student_id: number;
  father_name: string | null;
  is_father_alive: number;
  mother_name: string | null;
  is_mother_alive: number;
}

export interface StudentDocument {
  id: number;
  student_id: number;
  doc_type: 'akte_kelahiran' | 'kartu_keluarga' | 'foto';
  file_path: string | null;
  file_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  uploaded_at: string;
  // Joined fields
  student_name?: string;
  class_name?: string;
}

export interface StudentDocumentPermission {
  id: number;
  student_id: number;
  doc_type: 'akte_kelahiran' | 'kartu_keluarga' | 'foto';
  is_allowed: number;
  granted_by: string | null;
  granted_at: string | null;
}

export interface AuditLog {
  id: number;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  action: string;
  status: 'SUCCESS' | 'FAILED' | 'INFO';
  ip_address: string | null;
  user_agent: string | null;
  details: string | null;
  created_at: string;
}

export interface OnlineUser {
  user_id: string;
  user_name: string;
  user_role: string;
  avatar_url: string | null;
  ip_address: string | null;
  last_seen_at: string;
}

export interface PriorityStudent {
  id: number;
  student_id: number;
  notes: string | null;
  required_photo: number;
  required_kk: number;
  required_akte: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields from students
  nipd?: string | null;
  nisn?: string | null;
  nik?: string | null;
  name?: string;
  class_name?: string;
  photo_url?: string | null;
  uploaded_docs?: string | null;
}

export interface MasterClass {
  id: number;
  name: string;
  level: number;
  next_class_id: number | null;
  description?: string | null;
  created_at?: string;
}

export interface StudentClassHistory {
  id: number;
  student_id: number;
  from_class_id: number | null;
  to_class_id: number | null;
  academic_year: string | null;
  status: string; // 'promoted', 'graduated'
  processed_by: string;
  processed_at: string;
  // Joined names
  from_class_name?: string | null;
  to_class_name?: string | null;
  student_name?: string | null;
}

export type HonoVariables = {
  user: User;
};
