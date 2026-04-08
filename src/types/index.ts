export type UserRole = 'user' | 'organizer' | 'admin';
export type ProStatus = 'free' | 'pending' | 'approved';
export type EventStatus = 'draft' | 'published' | 'ended';
export type TicketStatus = 'active' | 'checked_in' | 'expired';
export type RegistrationApprovalStatus = 'pending_approval' | 'approved' | 'rejected';
export type PaymentStatus = 'belum_bayar' | 'menunggu_verifikasi' | 'sudah_bayar' | 'ditolak';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  whatsapp: string;
  role: UserRole;
  pro_status: ProStatus;
  pro_payment_proof_url?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price?: number;
  poster_url?: string;
  organizer_id: string;
  organizer?: User;
  status: EventStatus;
  ticket_count?: number;
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  approval_status: RegistrationApprovalStatus;
  payment_status: PaymentStatus;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
  user?: User;
  event?: Event;
}

export interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  registration_id?: string;
  ticket_code: string;
  qr_token: string;
  status: TicketStatus;
  created_at: string;
  checked_in_at?: string;
  user?: User;
  event?: Event;
}

export interface PaymentSettings {
  id: string;
  payment_name: string;
  account_name: string;
  account_number: string;
  qris_image?: string;
  whatsapp_admin: string;
  description?: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pro_status: ProStatus;
  whatsapp: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
