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

  let resumes = useAppSelector((state) => state.resumes);
  let current_resume_i = useAppSelector((state) => state.current);

  const selectResume = (i: Number) => {
    return () => dispatch({ type: "resumeList/selectResume", payload: i })
  };
  const appendResume = () => {
    dispatch({ type: "resumeList/addResume" });
  };
  const deleteResume = () => {
    if (confirm("Are you sure you want to delete this resume?")) {
      dispatch({ type: "resumeList/deleteResume" });
    }
  };

  return (
    <section className="bg-white p-2 space-y-2 h-[var(--resume-selection-height)]">
      <div className="flex flex-row items-center overflow-scroll text-sm">
        <h2 className="font-bold text-md">Resumes:</h2>
        {resumes.map((resume, i) => {
          if (i == current_resume_i) {
            return <button key={i} className="text-sky-600 underline font-bold ml-2 flex-shrink-0">{resume.title}</button>;
          }
          return <button key={i} className="ml-2 text-sky-400 font-bold flex-shrink-0" onClick={selectResume(i)}>{resume.title}</button>;
        })}
      </div>
      <div className="flex flex-row items-center text-sm gap-2">
        <h2 className="font-bold text-md">This Resume:</h2>
        <input className="border border-gray-300 rounded px-2 py-1" type="text" value={resumes[current_resume_i].title} onChange={(e) => dispatch({ type: "resumeList/rename", payload: e.target.value })} />
        <button className="bg-sky-400 text-white font-bold px-3 py-1 rounded" onClick={appendResume}>Clone</button>
        <button className="bg-sky-400 text-white font-bold px-3 py-1 rounded" onClick={deleteResume}>Delete</button>
      </div>
    </section>
  );
};
