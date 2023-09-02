import { useEffect } from "react";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import { store, type RootState, type AppDispatch, initialOneState } from "lib/redux/store";
import {
  loadStateFromLocalStorage,
  saveStateToLocalStorage,
} from "lib/redux/local-storage";
import { deepMerge } from "lib/deep-merge";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook to save store to local storage on store change
 */
export const useSaveStateToLocalStorageOnChange = () => {
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      saveStateToLocalStorage(store.getState());
    });
    return unsubscribe;
  }, []);
};

export const useSetInitialStore = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const state = loadStateFromLocalStorage();
    console.log("state " + JSON.stringify(state));
    if (!state) return;
    // For each resume in state, merge with initial state to ensure backward compatibility,
    // adding any new fields from the initial state to the stored state.
    for (let i = 0; i < state.resumes.length; i++) {
      state.resumes[i] = deepMerge(initialOneState, state.resumes[i]);
    }
    // Set all state
    dispatch({ type: "resumeList/setAll", payload: state });
  }, []);
};
