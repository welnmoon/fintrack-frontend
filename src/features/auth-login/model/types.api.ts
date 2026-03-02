export type LoginResponse = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
};

export interface AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}
