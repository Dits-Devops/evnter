export const APP_NAME = 'EVNTER';
export const APP_DESCRIPTION = 'Platform tiket event yang mudah digunakan';

export const ROLES = {
  USER: 'user' as const,
  ORGANIZER: 'organizer' as const,
  ADMIN: 'admin' as const,
};

export const PRO_STATUS = {
  FREE: 'free' as const,
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
};

export const EVENT_STATUS = {
  DRAFT: 'draft' as const,
  PUBLISHED: 'published' as const,
  ENDED: 'ended' as const,
};

export const TICKET_STATUS = {
  ACTIVE: 'active' as const,
  CHECKED_IN: 'checked_in' as const,
  EXPIRED: 'expired' as const,
};
