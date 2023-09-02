import { deepClone } from "lib/deep-clone";
import { useAppDispatch, useAppSelector } from "lib/redux/hooks";
import { initialOneState } from "lib/redux/store";
import { OneState } from "lib/redux/types";
import { useState } from "react";

export const ResumeRewriter = ({text, set_text, set_open}) => {
  const dispatch = useAppDispatch();
  let [prompt, set_prompt] = useState("Rewrite the resume to appeal to");
  let [resulting_text, set_resulting_text] = useState("");
  let new_resume = textToResume(resulting_text);
  const saveAndClose = () => {
    if (typeof new_resume != 'string') {
      dispatch({ type: "resumeList/addResume", payload: new_resume });
      set_open(false);
    }
  };
  return (
    <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg p-4">
        <h1 className="text-2xl font-bold">AI Rewrite</h1>
        <p className="text-sm">The input prompt to the AI is shown below, including your existing resume, as well as instructions for the rewrite.</p>
        <textarea className="border border-gray-300 rounded w-full h-96 p-2 mt-2" value={text} onChange={(e) => set_text(e.target.value)}></textarea>
        <input className="border border-gray-300 rounded px-2 py-1 mt-2 w-full" type="text" value={prompt} onChange={(e) => set_prompt(e.target.value)} />
        <p className="text-sm mt-2">The output from the AI is shown below. You can edit it as you see fit, or paste in your own AI's output</p>
        <textarea className="border border-gray-300 rounded w-full h-96 p-2 mt-2" value={resulting_text} onChange={(e) => set_resulting_text(e.target.value)}></textarea>
        <div className="flex flex-row items-center justify-end mt-2">
          <button className="bg-sky-400 text-white font-bold px-3 py-1 rounded ml-2" onClick={()=>set_open(false)}>Cancel</button>
          <span className="flex-grow"></span>
          {typeof new_resume == 'string' && <p hidden={typeof new_resume != 'string'} className="text-sm text-red-500 mr-2">Error: {new_resume}</p>}
          <button className="bg-sky-400 text-white font-bold px-3 py-1 rounded disabled:bg-gray-400" disabled={typeof new_resume == 'string'} onClick={saveAndClose}>Save Rewrite</button>
        </div>
      </div>
    </div>
  );
}

export function resumeToText(resume: OneState): string {
  // Helper for `descriptions` array to text (starts and ends with newlines)
  const descriptionsToText = (descriptions: string[]): string =>
    descriptions.reduce((acc, cur) => `${acc}- ${cur}\n`, "\n");
  // Convert to text
  let result = `PERSONAL SUMMARY: ${resume.resume.profile.summary}\n`;
  for (const heading of resume.settings.formsOrder) {
    if (!resume.settings.formToShow[heading]) {
      continue;
    }
    switch (heading) {
      case "workExperiences":
        result += `\n# WORK EXPERIENCE`;
        for (const experience of resume.resume.workExperiences) {
          result += `\nCOMPANY: ${experience.company}\nPOSITION: ${experience.jobTitle}\nDATE: ${experience.date}\nDESCRIPTIONS: ${descriptionsToText(experience.descriptions)}`;
        }
        break;
      case "educations":
        result += `\n# EDUCATION`;
        for (const education of resume.resume.educations) {
          result += `\nSCHOOL: ${education.school}\nDEGREE: ${education.degree}\nDATE: ${education.date}\nGPA: ${education.gpa}\nDESCRIPTIONS: ${descriptionsToText(education.descriptions)}`;
        }
        break;
      case "projects":
        result += `\n# PROJECTS`;
        for (const project of resume.resume.projects) {
          result += `\nPROJECT: ${project.project}\nDATE: ${project.date}\nDESCRIPTIONS: ${descriptionsToText(project.descriptions)}`;
        }
        break;
      case "skills":
        result += `\n# SKILLS\nFEATURED (WITH RATING):${descriptionsToText(resume.resume.skills.featuredSkills.map((skill) => `${skill.skill} (${skill.rating})`))}MORE SKILLS:\n${descriptionsToText(resume.resume.skills.descriptions)}`;
        break;
      case "custom":
        result += `\n# CUSTOM (${resume.settings.formToHeading['custom']}):${descriptionsToText(resume.resume.custom.descriptions)}`;
        break;
    }
  }
  return result;
}

export function textToResume(text: string): OneState | string {
  // Parse out sections
  const personalSummary = text.match(/PERSONAL SUMMARY: (.*)/)?.[1];
  const workExperienceSection = text.match(/# WORK EXPERIENCE([\s\S]*?)(?=# EDUCATION|# PROJECTS|# SKILLS|# CUSTOM|$)/)?.[1];
  const educationSection = text.match(/# EDUCATION([\s\S]*?)(?=# WORK EXPERIENCE|# PROJECTS|# SKILLS|# CUSTOM|$)/)?.[1];
  const projectSection = text.match(/# PROJECTS([\s\S]*?)(?=# WORK EXPERIENCE|# EDUCATION|# SKILLS|# CUSTOM|$)/)?.[1];
  const skillsSection = text.match(/# SKILLS([\s\S]*?)(?=# WORK EXPERIENCE|# EDUCATION|# PROJECTS|# CUSTOM|$)/)?.[1];
  const customSection = text.match(/# CUSTOM([\s\S]*?)(?=# WORK EXPERIENCE|# EDUCATION|# PROJECTS|# SKILLS|$)/)?.[1];

  // Construct initial resume (empty)
  let base_resume = useAppSelector((state) => state.resumes[state.current]);
  let resume: OneState = {
    title: "AI Rewrite",
    resume: {
      profile: {
        ...base_resume.resume.profile,
        summary: "",
      },
      workExperiences: [],
      educations: [],
      projects: [],
      skills: {
        featuredSkills: [],
        descriptions: [],
      },
      custom: {
        descriptions: [],
      },
    },
    settings: {
      ...base_resume.settings,
    }
  };
  // Personal summary
  if (personalSummary) {
    resume.resume.profile.summary = personalSummary;
  } else {
    return "Error: missing PERSONAL SUMMARY";
  }
  // Work experience
  if (workExperienceSection) {
    const workExperiences = workExperienceSection.match(/COMPANY: ([\s\S]*?)(?=\nCOMPANY:|$)/g);
    if (workExperiences) {
      for (const workExperience of workExperiences) {
        const company = workExperience.match(/COMPANY: (.*)/)?.[1];
        const jobTitle = workExperience.match(/POSITION: (.*)/)?.[1];
        const date = workExperience.match(/DATE: (.*)/)?.[1];
        const descriptions = workExperience.match(/DESCRIPTIONS:([\s\S]*)$/)?.[1].split("\n- ").slice(1);
        if (company != null && jobTitle != null && date != null && descriptions != null) {
          resume.resume.workExperiences.push({
            company,
            jobTitle,
            date,
            descriptions,
          });
        } else {
          console.log(company, jobTitle, date, descriptions);
          return "Error: missing POSITION, DATE, or DESCRIPTIONS from WORK EXPERIENCE " + company;
        }
      }
    } else {
      return "Error: invalid WORK EXPERIENCE";
    }
  } else {
    return "Error: missing WORK EXPERIENCE";
  }
  // Education
  if (educationSection) {
    const educations = educationSection.match(/SCHOOL: ([\s\S]*?)(?=\nSCHOOL:|$)/g);
    if (educations) {
      for (const education of educations) {
        const school = education.match(/SCHOOL: (.*)/)?.[1];
        const degree = education.match(/DEGREE: (.*)/)?.[1];
        const date = education.match(/DATE: (.*)/)?.[1];
        const gpa = education.match(/GPA: (.*)/)?.[1];
        const descriptions = education.match(/DESCRIPTIONS:([\s\S]*)$/)?.[1].split("\n- ").slice(1);
        if (school != null && degree != null && date != null && gpa != null && descriptions != null) {
          resume.resume.educations.push({
            school,
            degree,
            date,
            gpa,
            descriptions,
          });
        } else {
          return "Error: missing DEGREE, DATE, GPA, or DESCRIPTIONS from EDUCATION " + school;
        }
      }
    } else {
      return "Error: invalid EDUCATION";
    }
  } else {
    return "Error: missing EDUCATION";
  }
  // Projects
  if (projectSection) {
    const projects = projectSection.match(/PROJECT: ([\s\S]*?)(?=\nPROJECT:|$)/g);
    if (projects) {
      for (const project of projects) {
        const project_name = project.match(/PROJECT: (.*)/)?.[1];
        const date = project.match(/DATE: (.*)/)?.[1];
        const descriptions = project.match(/DESCRIPTIONS:([\s\S]*)$/)?.[1].split("\n- ").slice(1);
        if (project_name != null && date != null && descriptions != null) {
          resume.resume.projects.push({
            project: project_name,
            date,
            descriptions,
          });
        } else {
          return "Error: missing DATE or DESCRIPTIONS from PROJECT " + project_name;
        }
      }
    } else {
      return "Error: invalid PROJECTS";
    }
  } else {
    return "Error: missing PROJECTS";
  }
  // Skills
  if (skillsSection) {
    const featuredSkills = skillsSection.match(/FEATURED \(WITH RATING\):([\s\S]*)\nMORE SKILLS:/)?.[1].split("\n- ").slice(1);
    const descriptions = skillsSection.match(/MORE SKILLS:([\s\S]*)$/)?.[1].split("\n- ").slice(1);
    if (featuredSkills != null && descriptions != null) {
      for (const featuredSkill of featuredSkills) {
        let skill = featuredSkill.match(/(.*) \((.*)\)/);
        if (skill == null) {
          return "Error: invalid FEATURED SKILL " + featuredSkill;
        }
        const skill_name = skill[1];
        const rating = parseInt(skill[2]);
        resume.resume.skills.featuredSkills.push({
          skill: skill_name,
          rating,
        });
      }
      resume.resume.skills.descriptions = descriptions;
    } else {
      return "Error: missing FEATURED SKILLS or MORE SKILLS";
    }
  } else {
    return "Error: missing SKILLS";
  }
  // Custom
  if (customSection) {
    const name = customSection.match(/^\s*\((.*)\)/)?.[1];
    const descriptions = customSection.match(/([\s\S]*)$/)?.[1].split("\n- ").slice(1);
    if (name != null && descriptions != null) {
      resume.resume.custom.descriptions = descriptions;
      resume.settings.formToHeading['custom'] = name;
    } else {
      return "Error: missing DESCRIPTIONS from CUSTOM";
    }
  }

  console.log(resume);
  return resume;
}