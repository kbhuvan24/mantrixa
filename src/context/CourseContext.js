import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COURSES, INITIAL_EXAMS } from '../data/initialData';

const CourseContext = createContext(null);
export const useCourses = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('sf_courses');
    const savedExams = localStorage.getItem('sf_exams');
    if (saved) {
      try { setCourses(JSON.parse(saved)); } catch { setCourses(INITIAL_COURSES); }
    } else {
      setCourses(INITIAL_COURSES);
      localStorage.setItem('sf_courses', JSON.stringify(INITIAL_COURSES));
    }
    if (savedExams) {
      try { setExams(JSON.parse(savedExams)); } catch { setExams(INITIAL_EXAMS); }
    } else {
      setExams(INITIAL_EXAMS);
      localStorage.setItem('sf_exams', JSON.stringify(INITIAL_EXAMS));
    }
  }, []);

  const saveCourses = (updated) => {
    setCourses(updated);
    localStorage.setItem('sf_courses', JSON.stringify(updated));
  };

  const saveExams = (updated) => {
    setExams(updated);
    localStorage.setItem('sf_exams', JSON.stringify(updated));
  };

  const addCourse = (course) => {
    const newCourse = { ...course, id: `course_${Date.now()}`, enrolled: 0, rating: 5.0 };
    saveCourses([...courses, newCourse]);
  };

  const updateCourse = (id, updates) => {
    saveCourses(courses.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCourse = (id) => saveCourses(courses.filter(c => c.id !== id));

  const updateCurriculumNote = (courseId, weekIndex, note) => {
    saveCourses(courses.map(c => {
      if (c.id !== courseId) return c;
      const curriculum = [...c.curriculum];
      curriculum[weekIndex] = { ...curriculum[weekIndex], notes: note };
      return { ...c, curriculum };
    }));
  };

  const addExam = (exam) => {
    const newExam = { ...exam, id: `exam_${Date.now()}` };
    saveExams([...exams, newExam]);
  };

  const updateExam = (id, updates) => saveExams(exams.map(e => e.id === id ? { ...e, ...updates } : e));

  const deleteExam = (id) => saveExams(exams.filter(e => e.id !== id));

  const getCourseById = (id) => courses.find(c => c.id === id);
  const getExamsByCourse = (courseId) => exams.filter(e => e.courseId === courseId);

  const getReviews = () => {
    try { return JSON.parse(localStorage.getItem('sf_reviews') || '[]'); } catch { return []; }
  };

  const addReview = (review) => {
    const reviews = getReviews();
    const newReview = { ...review, id: `rev_${Date.now()}`, createdAt: new Date().toISOString() };
    localStorage.setItem('sf_reviews', JSON.stringify([newReview, ...reviews]));
  };

  return (
    <CourseContext.Provider value={{
      courses, exams,
      addCourse, updateCourse, deleteCourse, updateCurriculumNote,
      addExam, updateExam, deleteExam,
      getCourseById, getExamsByCourse,
      getReviews, addReview
    }}>
      {children}
    </CourseContext.Provider>
  );
};
