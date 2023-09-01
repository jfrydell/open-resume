"use client";
import {
  useAppDispatch,
  useAppSelector,
  useSaveStateToLocalStorageOnChange,
  useSetInitialStore,
} from "lib/redux/hooks";

export const ResumeList = () => {
  useSetInitialStore();
  useSaveStateToLocalStorageOnChange();

  const dispatch = useAppDispatch();

  let resume_count = useAppSelector((state) => state.resumes.length);
  let current_resume = useAppSelector((state) => state.current);

  const selectResume = (i: Number) => {
    return () => dispatch({ type: "resumeList/selectResume", payload: i })
  };
  const appendResume = () => {
    dispatch({ type: "resumeList/addResume" });
  };
  const deleteResume = () => {
    dispatch({ type: "resumeList/deleteResume" });
  };

  return (
    <div>
      <section className="flex flex-row item-center justify-center p-3">
        <h1 className="font-bold">Resumes:</h1>
        {Array(resume_count).fill(0).map((_, i) => {
          if (i == current_resume) {
            return <span key={i} className="ml-2">
              <button className="text-sky-600 underline font-bold">{i}</button>
              <button className="ml-1 text-sm text-red-600" onClick={deleteResume}>(-)</button>
            </span>;
          }
          return <button key={i} className="ml-2 text-sky-400 font-bold" onClick={selectResume(i)}>{i}</button>;
        })}
        <button className="ml-2 text-sky-400 font-bold" onClick={appendResume}>+</button>
      </section>
    </div>
  );
};
