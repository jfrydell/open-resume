import {  configureStore } from "@reduxjs/toolkit";
import { OneState } from "./types";
import resumeSlice, { initialResumeState } from "./resumeSlice";
import settingsSlice, { initialSettings } from "./settingsSlice";
import { deepClone } from "lib/deep-clone";

export const initialOneState: OneState = {
  title: "Resume",
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
    } else if (action.type.startsWith("resumeList/")) {
      switch (action.type) {
        case "resumeList/addResume":
          // The new resume is the payload (if present) or otherwise a copy of the current resume
          if (action.payload) {
            return {
              resumes: [...state.resumes, action.payload],
              current: state.resumes.length,
            }
          }
          let new_resume = deepClone(state.resumes[state.current]);
          new_resume.title += " (copy)";
          return {
            resumes: [...state.resumes, new_resume],
            current: state.resumes.length,
          }
        case "resumeList/selectResume":
          return {
            ...state,
            current: action.payload,
          }
        case "resumeList/rename":
          if (action.payload === "") {
            return state;
          }
          return {
            ...state,
            resumes: state.resumes.map((oneState: OneState, idx: Number) => {
              if (idx === state.current) {
                return {
                  ...oneState,
                  title: action.payload,
                };
              }
              return oneState;
            }),
          }
        case "resumeList/deleteResume":
          if (state.resumes.length === 1) {
            return state;
          }
          return {
            resumes: state.resumes.filter((oneState: OneState, idx: Number) => {
              return idx !== state.current;
            }),
            current: Math.max(state.current - 1, 0),
          }
        case "resumeList/setAll":
          return action.payload;
        default:
          console.error("Unrecognized action: ", action);
      }
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
