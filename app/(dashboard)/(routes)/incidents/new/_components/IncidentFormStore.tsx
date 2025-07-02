import { create } from "zustand";
import { IncidentFormData } from "@/lib/validation/incidents";

type IncidentFormStore = {
  data: Partial<IncidentFormData>;
  setData: (values: Partial<IncidentFormData>) => void;
  clear: () => void;
};

export const useIncidentFormStore = create<IncidentFormStore>((set) => ({
  data: {},
  setData: (values) => set((state) => ({ data: { ...state.data, ...values } })),
  clear: () => set({ data: {} }),
}));
