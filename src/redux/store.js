import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../redux/Authslice";
import employeesReducer from "../redux/Employeeslice";
import leaveReducer from "../redux/Leaveslice";

export default configureStore({
  reducer: {
    auth: authReducer,
    employees: employeesReducer,
    leave: leaveReducer,
  },
});
