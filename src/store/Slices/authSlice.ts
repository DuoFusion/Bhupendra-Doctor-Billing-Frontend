// import { createSlice } from "@reduxjs/toolkit";

// interface AuthState {
//   user: any;
//   role: string | null | undefined;
// }

// const initialState: AuthState = {
//   user: null,
//   role: undefined, 
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setUser(state, action) {
//       state.user = action.payload;
//       state.role = action.payload?.role ?? null;
//     },
//     clearUser(state) {
//       state.user = null;
//       state.role = null;
//     },
//   },
// });

// export const { setUser, clearUser } = authSlice.actions;
// export default authSlice.reducer;
