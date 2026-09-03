import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeResume } from '../data/schema.js';
import { sampleResume } from '../data/sampleResume.js';

const BLANK = {
  experience: () => ({ title: '', company: '', start: '', end: '', desc: '' }),
  education: () => ({ degree: '', school: '', start: '', end: '', desc: '' }),
  projects: () => ({ name: '', link: '', desc: '' }),
  certifications: () => ({ name: '', issuer: '', year: '' }),
  languages: () => ({ name: '', level: '' }),
};

// Local editing state for ONE resume. Exposes the exact same action API
// the editor tabs / preview already expect, and pushes every change to
// the library via onChange(id, data) — immediate save, like the prototype.
export function useResumeEditor(resume, onChange) {
  const [data, setData] = useState(() => normalizeResume(resume?.data));
  const dataRef = useRef(data);
  const idRef = useRef(resume?.id || null);
  const dirtyRef = useRef(false);
  const onChangeRef = useRef(onChange);
  dataRef.current = data;
  onChangeRef.current = onChange;

  // Switching to a different resume reloads the local state.
  useEffect(() => {
    if (resume && resume.id !== idRef.current) {
      idRef.current = resume.id;
      const next = normalizeResume(resume.data);
      dataRef.current = next;
      dirtyRef.current = false;
      setData(next);
    }
  }, [resume]);

  // Flush unsaved edits when the editor unmounts (e.g. route change).
  useEffect(
    () => () => {
      if (dirtyRef.current && onChangeRef.current) {
        onChangeRef.current(idRef.current, dataRef.current);
      }
    },
    []
  );

  const commit = useCallback((updater) => {
    const next = normalizeResume(
      typeof updater === 'function' ? updater(dataRef.current) : updater
    );
    dataRef.current = next;
    dirtyRef.current = true;
    setData(next);
    if (onChangeRef.current) onChangeRef.current(idRef.current, next);
  }, []);

  const updateField = useCallback(
    (key, value) => commit((s) => ({ ...s, [key]: value })),
    [commit]
  );
  const addToList = useCallback(
    (key) => commit((s) => ({ ...s, [key]: [...s[key], BLANK[key]()] })),
    [commit]
  );
  const updateInList = useCallback(
    (key, index, field, value) =>
      commit((s) => ({
        ...s,
        [key]: s[key].map((e, i) => (i === index ? { ...e, [field]: value } : e)),
      })),
    [commit]
  );
  const removeFromList = useCallback(
    (key, index) =>
      commit((s) => ({ ...s, [key]: s[key].filter((_, i) => i !== index) })),
    [commit]
  );
  const moveInList = useCallback(
    (key, from, to) =>
      commit((s) => {
        const list = [...s[key]];
        if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
          return s;
        }
        const [item] = list.splice(from, 1);
        list.splice(to, 0, item);
        return { ...s, [key]: list };
      }),
    [commit]
  );

  const setTemplate = useCallback(
    (template) => commit((s) => ({ ...s, template })),
    [commit]
  );
  const setAccent = useCallback(
    (accent) => commit((s) => ({ ...s, accent: accent || '' })),
    [commit]
  );
  const setFont = useCallback((font) => commit((s) => ({ ...s, font })), [commit]);
  const clearAll = useCallback(() => commit(normalizeResume({})), [commit]);
  const loadSample = useCallback(() => commit(normalizeResume(sampleResume)), [commit]);
  const importState = useCallback((raw) => commit(normalizeResume(raw)), [commit]);

  return {
    data,
    actions: {
      updateField,
      addExperience: () => addToList('experience'),
      updateExperience: (i, f, v) => updateInList('experience', i, f, v),
      removeExperience: (i) => removeFromList('experience', i),
      moveExperience: (f, t) => moveInList('experience', f, t),
      addEducation: () => addToList('education'),
      updateEducation: (i, f, v) => updateInList('education', i, f, v),
      removeEducation: (i) => removeFromList('education', i),
      moveEducation: (f, t) => moveInList('education', f, t),
      addProject: () => addToList('projects'),
      updateProject: (i, f, v) => updateInList('projects', i, f, v),
      removeProject: (i) => removeFromList('projects', i),
      moveProject: (f, t) => moveInList('projects', f, t),
      addCertification: () => addToList('certifications'),
      updateCertification: (i, f, v) => updateInList('certifications', i, f, v),
      removeCertification: (i) => removeFromList('certifications', i),
      moveCertification: (f, t) => moveInList('certifications', f, t),
      addLanguage: () => addToList('languages'),
      updateLanguage: (i, f, v) => updateInList('languages', i, f, v),
      removeLanguage: (i) => removeFromList('languages', i),
      moveLanguage: (f, t) => moveInList('languages', f, t),
      setTemplate,
      setAccent,
      setFont,
      clearAll,
      loadSample,
      importState,
    },
  };
}
