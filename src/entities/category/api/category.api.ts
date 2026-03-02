const BASE = "categories";

export const categoryApi = {
  list: () => BASE,
  detail: (id: string) => `${BASE}/${id}`,
  create: () => BASE,
  update: (id: string) => `${BASE}/${id}`,
  delete: (id: string) => `${BASE}/${id}`,
  presets: () => `${BASE}/presets`,
};
