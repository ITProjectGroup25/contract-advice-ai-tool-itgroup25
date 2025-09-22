import { configureStore } from "@reduxjs/toolkit";
import uireducers from "./uireducers";

export const store = configureStore({
  reducer: {
    uielements: uireducers,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
