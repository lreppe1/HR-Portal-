import { createSlice, nanoid } from "@reduxjs/toolkit";

const STORAGE_KEY = "hr_portal_employees";

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const save = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
};

const seeded = load() ?? [
  { id: "e-1001", name: "Employee User", email: "employee@company.com", department: "Operations", title: "Associate", status: "Active" },
  { id: "e-1002", name: "Jordan Smith", email: "jordan@company.com", department: "Engineering", title: "Developer", status: "Active" },
];

const employeesSlice = createSlice({
  name: "employees",
  initialState: { items: seeded },
  reducers: {
    addEmployee(state, action) {
      const emp = { id: `e-${nanoid(6)}`, ...action.payload };
      state.items.push(emp);
      save(state);
    },
    updateEmployee(state, action) {
      const { id, updates } = action.payload;
      const idx = state.items.findIndex((e) => e.id === id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...updates };
        save(state);
      }
    },
    deleteEmployee(state, action) {
      state.items = state.items.filter((e) => e.id !== action.payload);
      save(state);
    },
  },
});

export const { addEmployee, updateEmployee, deleteEmployee } = employeesSlice.actions;
console.log("LOADED Employeeslice.js ✅", import.meta.url);
export default employeesSlice.reducer;


