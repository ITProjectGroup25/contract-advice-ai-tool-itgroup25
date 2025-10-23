import { combineReducers } from "@reduxjs/toolkit";

import modalstripReducer from "./uireducers/modalstrip";
import progressReducer from "./uireducers/progress";

export default combineReducers({
  progress: progressReducer,
  modalstrip: modalstripReducer,
});
