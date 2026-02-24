export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
};
