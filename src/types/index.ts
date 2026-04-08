export type UserRole = 'user' | 'organizer' | 'admin';
export type ProStatus = 'free' | 'pending' | 'approved';
export type EventStatus = 'draft' | 'published' | 'ended';
export type TicketStatus = 'active' | 'checked_in' | 'expired';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash?: string;
  whatsapp: string;
  role: UserRole;
  pro_status: ProStatus;
  pro_payment_proof_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  poster_url?: string;
  organizer_id: string;
  organizer?: User;
  status: EventStatus;
  ticket_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  event_id: string;
  ticket_code: string;
  qr_token: string;
  status: TicketStatus;
  created_at: string;
  checked_in_at?: string;
  user?: User;
  event?: Event;
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
