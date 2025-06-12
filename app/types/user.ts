export type USER = {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  role: string;
  id: string;
  isAdmin: boolean;
  organization: { id: string; role: string } | null;
  notify?: boolean;
};