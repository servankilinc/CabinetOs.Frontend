export interface CurrentUserDto {
  id: string;
  userName: string | null;
  email: string | null;
  fullName: string;
  companyId: string;
  companyName: string | null;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}
