export type UserCategory = {
  id: string;
  type: "INCOME" | "EXPENSE";
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  name: string;
  colorKey: string | null;
  iconKey: string | null;
};
