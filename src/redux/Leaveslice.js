import { createSlice, nanoid } from "@reduxjs/toolkit";

const STORAGE_KEY = "hr_portal_leave";

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
  {
    id: "lr-1",
    employeeId: "e-1001",
    employeeName: "Employee User",
    startDate: "2026-02-10",
    endDate: "2026-02-12",
    reason: "Family event",
    status: "Pending", // Pending | Approved | Denied
    decisionNote: "",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
];

const leaveSlice = createSlice({
  name: "leave",
  initialState: { items: seeded },
  reducers: {
    submitLeave(state, action) {
      const req = {
        id: `lr-${nanoid(8)}`,
        status: "Pending",
        decisionNote: "",
        createdAt: Date.now(),
        ...action.payload,
      };
      state.items.unshift(req);
      save(state);
    },
    decideLeave(state, action) {
      const { id, status, decisionNote } = action.payload; // Approved | Denied
      const idx = state.items.findIndex((r) => r.id === id);
      if (idx !== -1) {
        state.items[idx].status = status;
        state.items[idx].decisionNote = decisionNote || "";
        save(state);
      }
    },
  },
});

export const { submitLeave, decideLeave } = leaveSlice.actions;

console.log("LOADED Leaveslice.js ✅", import.meta.url);
export default leaveSlice.reducer;

