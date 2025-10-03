import { create } from "zustand";
import { IncidentFormData } from "@/lib/validation/incidents";

// The initial state for the form, including defaults for new fields
const initialData: Partial<IncidentFormData> = {
  title: "",
  description: "",
  occurredAt: new Date(),
  severity: "MEDIUM",
  priority: "NORMAL",
  locationAddress: "",
  affectedServices: [],
};

type IncidentFormStore = {
  data: Partial<IncidentFormData>;
  setData: (values: Partial<IncidentFormData>) => void;
  clear: () => void;
};

export const useIncidentFormStore = create<IncidentFormStore>((set) => ({
  data: initialData,
  setData: (values) => set((state) => ({ data: { ...state.data, ...values } })),
  clear: () => set({ data: initialData }),
}));

// This store holds UI-related state, like the names of selected items
type IncidentUIForm = {
  uiData: {
    categoryName?: string;
    departmentName?: string;
    assigneeName?: string; // Changed from assignedToName
  };
  setUiData: (values: Partial<IncidentUIForm["uiData"]>) => void;
  clearUI: () => void;
};

export const useIncidentUIForm = create<IncidentUIForm>((set) => ({
  uiData: {},
  setUiData: (values) =>
    set((state) => ({ uiData: { ...state.uiData, ...values } })),
  clearUI: () => set({ uiData: {} }),
}));
