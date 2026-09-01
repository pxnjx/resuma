import { useCallback, useEffect, useState } from 'react';
import { normalizeResume } from '../data/schema.js';
import { sampleResume } from '../data/sampleResume.js';

export const LIB_KEY = 'lanjut_resume_library_v1';
const LEGACY_KEY = 'lanjut_resume_state';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function makeResume(data, title, id = uid(), now = Date.now()) {
  return { id, title, createdAt: now, updatedAt: now, data: normalizeResume(data) };
}

function loadLibrary() {
  let resumes = null;
  try {
    const raw = localStorage.getItem(LIB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.resumes)) {
        resumes = parsed.resumes
          .filter((r) => r && typeof r === 'object' && r.id && r.data)
          .map((r) => ({
            id: String(r.id),
            title: String(r.title || 'Untitled Resume'),
            createdAt: Number(r.createdAt) || Date.now(),
            updatedAt: Number(r.updatedAt) || Date.now(),
            data: normalizeResume(r.data),
          }));
      }
    }
  } catch (err) {
    resumes = null;
  }

  if (!resumes) {
    // One-time migration from the legacy single-resume key.
    try {
      const old = localStorage.getItem(LEGACY_KEY);
      if (old) {
        const legacy = normalizeResume(JSON.parse(old));
        resumes = [makeResume(legacy, legacy.name || 'My Resume')];
      }
    } catch (err) {
      resumes = null;
    }
  }

  if (!resumes || resumes.length === 0) {
    resumes = [makeResume(sampleResume, 'Sample Resume')];
  }

  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch (err) {
    // ignore
  }

  return { resumes };
}

// Library of resumes in localStorage. Each resume keeps its own data,
// title, and timestamps; the builder edits one resume at a time and
// the dashboard lists them all ("My Resume").
export function useResumeLibrary() {
  const [library, setLibrary] = useState(loadLibrary);

  useEffect(() => {
    try {
      localStorage.setItem(LIB_KEY, JSON.stringify(library));
    } catch (err) {
      // Storage unavailable/full — keep the app running.
    }
  }, [library]);

  const createResume = useCallback((init = {}, title = '') => {
    const id = uid();
    const now = Date.now();
    setLibrary((lib) => ({
      resumes: [
        makeResume(init, title || init.name || 'Untitled Resume', id, now),
        ...lib.resumes,
      ],
    }));
    return id;
  }, []);

  const updateResumeData = useCallback((id, data) => {
    setLibrary((lib) => ({
      resumes: lib.resumes.map((r) =>
        r.id === id ? { ...r, data, updatedAt: Date.now() } : r
      ),
    }));
  }, []);

  const renameResume = useCallback((id, title) => {
    setLibrary((lib) => ({
      resumes: lib.resumes.map((r) =>
        r.id === id
          ? { ...r, title: title || 'Untitled Resume', updatedAt: Date.now() }
          : r
      ),
    }));
  }, []);

  const deleteResume = useCallback((id) => {
    setLibrary((lib) => ({ resumes: lib.resumes.filter((r) => r.id !== id) }));
  }, []);

  const duplicateResume = useCallback((id) => {
    const newId = uid();
    setLibrary((lib) => {
      const src = lib.resumes.find((r) => r.id === id);
      if (!src) return lib;
      return {
        resumes: [makeResume(src.data, src.title + ' (copy)', newId, Date.now()), ...lib.resumes],
      };
    });
    return newId;
  }, []);

  const resetLibrary = useCallback(() => {
    setLibrary({ resumes: [makeResume(sampleResume, 'Sample Resume')] });
  }, []);

  return {
    resumes: library.resumes,
    actions: {
      createResume,
      updateResumeData,
      renameResume,
      deleteResume,
      duplicateResume,
      resetLibrary,
    },
  };
}
