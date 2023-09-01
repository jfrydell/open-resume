import {  configureStore } from "@reduxjs/toolkit";
import { OneState } from "./types";
import resumeSlice, { initialResumeState } from "./resumeSlice";
import settingsSlice, { initialSettings } from "./settingsSlice";

export const initialOneState: OneState = {
  resume: initialResumeState,
  settings: initialSettings,
};

export const store = configureStore({
  // Reducer delegating most actions to currently selected resume via oneStateSlice
  reducer: (state = {resumes: [initialOneState], current: 0}, action) => {
    if (action.type.startsWith("resume/")) {
      let new_resume = resumeSlice(state.resumes[state.current].resume, action);
      return {
        ...state,
        resumes: state.resumes.map((oneState: OneState, idx: Number) => {
          if (idx === state.current) {
            return {
              ...oneState,
              resume: new_resume,
            };
          }
          return oneState;
        }),
      }
    } else if (action.type.startsWith("settings/")) {
      let new_settings = settingsSlice(state.resumes[state.current].settings, action);
      return {
        ...state,
        resumes: state.resumes.map((oneState: OneState, idx: Number) => {
          if (idx === state.current) {
            return {
              ...oneState,
              settings: new_settings,
            };
          }
          return oneState;
        }),
      };
    } else {
      // Error, unrecognized action
      console.error("Unrecognized action: ", action);
      return state;
    }
  },
  // Set initial state to oneStateSlice
  preloadedState: {
    resumes: [initialOneState],
    current: 0,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
