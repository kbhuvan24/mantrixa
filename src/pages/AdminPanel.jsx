import React, { useState, useEffect } from 'react';
import { useCourses } from '../context/CourseContext';
import { useToast } from '../components/Toast';

const EMPTY_COURSE = {
  title: '', subtitle: '', description: '', icon: '📚', color: '#00ff88',
  level: 'Beginner', duration: '8 Weeks', price: 2999, originalPrice: 5999,
  category: 'DevOps', tags: [], outcomes: [], curriculum: [], isActive: true
};

const EMPTY_EXAM = {
  courseId: '', title: '', duration: 30, passingScore: 70, questions: []
};

const EMPTY_QUESTION = { question: '', options: ['', '', '', ''], correct: 0 };

const AdminPanel = () => {
  const { courses, exams, addCourse, updateCourse, deleteCourse, updateCurriculumNote, addExam, updateExam, deleteExam, getReviews } = useCourses();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [examForm, setExamForm] = useState(EMPTY_EXAM);
  const [showExamForm, setShowExamForm] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => { setReviews(getReviews()); }, [activeTab, getReviews]);

  const getAllStudents = () => {
    try { return JSON.parse(localStorage.getItem('sf_users') || '[]'); } catch { return []; }
  };

  const students = getAllStudents();
  const totalEnrolled = students.reduce((a, s) => a + (s.enrolledCourses?.length || 0), 0);
  const totalExamsTaken = students.reduce((a, s) => a + (s.examResults?.length || 0), 0);

  // Course Handlers
  const openAddCourse = () => { setCourseForm({ ...EMPTY_COURSE, curriculum: Array.from({ length: 8 }, (_, i) => ({ week: i + 1, topic: '', notes: '' })) }); setEditingCourse(null); setShowCourseForm(true); };
  const openEditCourse = (course) => { setCourseForm({ ...course, tags: course.tags || [] }); setEditingCourse(course.id); setShowCourseForm(true); };

  const handleSaveCourse = () => {
    if (!courseForm.title.trim()) { toast('Course title is required', 'error'); return; }
    if (editingCourse) { updateCourse(editingCourse, courseForm); toast('Course updated!', 'success'); }
    else { addCourse(courseForm); toast('Course added!', 'success'); }
    setShowCourseForm(false);
  };

  const handleDeleteCourse = (id, title) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) { deleteCourse(id); toast('Course deleted', 'info'); }
  };

  // Exam Handlers
  const openAddExam = () => { setExamForm({ ...EMPTY_EXAM, questions: [] }); setEditingExam(null); setShowExamForm(true); };
  const openEditExam = (exam) => { setExamForm({ ...exam }); setEditingExam(exam.id); setShowExamForm(true); };

  const handleSaveExam = () => {
    if (!examForm.courseId) { toast('Select a course', 'error'); return; }
    if (!examForm.title.trim()) { toast('Exam title is required', 'error'); return; }
    if (examForm.questions.length === 0) { toast('Add at least one question', 'error'); return; }
    if (editingExam) { updateExam(editingExam, examForm); toast('Exam updated!', 'success'); }
    else { addExam(examForm); toast('Exam created!', 'success'); }
    setShowExamForm(false);
  };

  const addQuestion = () => setExamForm(f => ({ ...f, questions: [...f.questions, { ...EMPTY_QUESTION, options: ['', '', '', ''], id: `q${Date.now()}` }] }));
  const removeQuestion = (i) => setExamForm(f => ({ ...f, questions: f.questions.filter((_, qi) => qi !== i) }));
  const updateQuestion = (i, field, val) => setExamForm(f => { const qs = [...f.questions]; qs[i] = { ...qs[i], [field]: val }; return { ...f, questions: qs }; });
  const updateOption = (qi, oi, val) => setExamForm(f => { const qs = [...f.questions]; const opts = [...qs[qi].options]; opts[oi] = val; qs[qi] = { ...qs[qi], options: opts }; return { ...f, questions: qs }; });

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'courses', label: '📚 Courses' },
    { id: 'exams', label: '📝 Exams' },
    { id: 'notes', label: '📒 Notes Editor' },
    { id: 'students', label: '👥 Students' },
    { id: 'reviews', label: '⭐ Reviews' },
  ];

  return (
    <div className="page-wrapper">
      {/* Course Form Modal */}
      {showCourseForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, overflowY: 'auto', padding: 'clamp(12px, 4vw, 24px)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 'clamp(24px, 6vw, 40px)', maxWidth: 700, margin: 'clamp(24px, 6vw, 40px) auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(20px, 5vw, 28px)', gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 4vw, 22px)' }}>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <button onClick={() => setShowCourseForm(false)} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-secondary)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 'clamp(14px, 2vw, 16px)' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'clamp(12px, 3vw, 16px)' }}>
              {[['title', 'Course Title'], ['subtitle', 'Subtitle'], ['category', 'Category'], ['icon', 'Icon (emoji)'], ['duration', 'Duration'], ['level', 'Level']].map(([key, label]) => (
                <div key={key} className="input-group">
                  <label className="input-label" style={{ fontSize: 'clamp(12px, 2vw, 13px)' }}>{label}</label>
                  <input className="input" value={courseForm[key] || ''} onChange={e => setCourseForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              {[['price', 'Price (₹)'], ['originalPrice', 'Original Price (₹)']].map(([key, label]) => (
                <div key={key} className="input-group">
                  <label className="input-label" style={{ fontSize: 'clamp(12px, 2vw, 13px)' }}>{label}</label>
                  <input className="input" type="number" value={courseForm[key] || ''} onChange={e => setCourseForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} />
                </div>
              ))}
              <div className="input-group">
                <label className="input-label" style={{ fontSize: 'clamp(12px, 2vw, 13px)' }}>Accent Color</label>
                <input className="input" value={courseForm.color} onChange={e => setCourseForm(f => ({ ...f, color: e.target.value }))} />
              </div>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label className="input-label" style={{ marginBottom: 0, fontSize: 'clamp(12px, 2vw, 13px)' }}>Active</label>
                <input type="checkbox" checked={courseForm.isActive} onChange={e => setCourseForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: 20, height: 20, cursor: 'pointer' }} />
              </div>
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label className="input-label">Description</label>
              <textarea className="input" value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label className="input-label">Tags (comma separated)</label>
              <input className="input" value={(courseForm.tags || []).join(', ')} onChange={e => setCourseForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} placeholder="Docker, Kubernetes, CI/CD" />
            </div>
            <div className="input-group" style={{ marginTop: 16 }}>
              <label className="input-label">Learning Outcomes (one per line)</label>
              <textarea className="input" value={(courseForm.outcomes || []).join('\n')} onChange={e => setCourseForm(f => ({ ...f, outcomes: e.target.value.split('\n').filter(Boolean) }))} rows={4} style={{ resize: 'vertical' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, margin: '24px 0 12px' }}>Curriculum (Weeks)</h3>
            {(courseForm.curriculum || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-green)', minWidth: 50 }}>Wk {item.week}</span>
                <input className="input" placeholder="Topic name" value={item.topic} onChange={e => { const c = [...courseForm.curriculum]; c[i] = { ...c[i], topic: e.target.value }; setCourseForm(f => ({ ...f, curriculum: c })); }} style={{ flex: 1 }} />
              </div>
            ))}
            <button onClick={() => setCourseForm(f => ({ ...f, curriculum: [...(f.curriculum || []), { week: (f.curriculum?.length || 0) + 1, topic: '', notes: '' }] }))} className="btn btn-secondary" style={{ marginTop: 8, fontSize: 13 }}>+ Add Week</button>
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button className="btn btn-secondary" onClick={() => setShowCourseForm(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveCourse} style={{ flex: 2, justifyContent: 'center' }}>Save Course</button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Form Modal */}
      {showExamForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, overflowY: 'auto', padding: 24, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 40, maxWidth: 700, margin: '40px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{editingExam ? 'Edit Exam' : 'Create Exam'}</h2>
              <button onClick={() => setShowExamForm(false)} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-secondary)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Course</label>
                <select className="input" value={examForm.courseId} onChange={e => setExamForm(f => ({ ...f, courseId: e.target.value }))}>
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
                </select>
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Exam Title</label>
                <input className="input" value={examForm.title} onChange={e => setExamForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Week 1-5 Assessment" />
              </div>
              <div className="input-group">
                <label className="input-label">Duration (minutes)</label>
                <input className="input" type="number" value={examForm.duration} onChange={e => setExamForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Passing Score (%)</label>
                <input className="input" type="number" value={examForm.passingScore} onChange={e => setExamForm(f => ({ ...f, passingScore: parseInt(e.target.value) || 70 }))} />
              </div>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, margin: '12px 0 16px' }}>Questions ({examForm.questions.length})</h3>
            {examForm.questions.map((q, qi) => (
              <div key={qi} style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 20, marginBottom: 14, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-green)' }}>Q{qi + 1}</span>
                  <button onClick={() => removeQuestion(qi)} className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}>Remove</button>
                </div>
                <input className="input" placeholder="Question text" value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} style={{ marginBottom: 10 }} />
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input type="radio" checked={q.correct === oi} onChange={() => updateQuestion(qi, 'correct', oi)} style={{ flexShrink: 0 }} />
                    <input className="input" placeholder={`Option ${['A','B','C','D'][oi]}`} value={opt} onChange={e => updateOption(qi, oi, e.target.value)} style={{ flex: 1 }} />
                  </div>
                ))}
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Select the radio button next to the correct answer</p>
              </div>
            ))}
            <button onClick={addQuestion} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}>+ Add Question</button>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setShowExamForm(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveExam} style={{ flex: 2, justifyContent: 'center' }}>Save Exam</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <section style={{ padding: '40px 0', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ padding: '6px 12px', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 8, fontSize: 12, color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>ADMIN</div>
            <div className="section-tag" style={{ marginBottom: 0 }}>Control Panel</div>
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', letterSpacing: '-0.025em' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Manage courses, exams, notes, and monitor student activity.</p>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '0 24px', position: 'sticky', top: 80, zIndex: 20, backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 2, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '16px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', color: activeTab === tab.id ? 'var(--accent-orange)' : 'var(--text-secondary)', borderBottom: activeTab === tab.id ? '2px solid var(--accent-orange)' : '2px solid transparent', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px' }}>
        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 40 }}>
              {[
                { label: 'Total Students', value: students.length, color: 'var(--accent-green)', icon: '👥' },
                { label: 'Active Courses', value: courses.filter(c => c.isActive).length, color: 'var(--accent-cyan)', icon: '📚' },
                { label: 'Enrollments', value: totalEnrolled, color: '#a78bfa', icon: '🎓' },
                { label: 'Exams Taken', value: totalExamsTaken, color: 'var(--accent-orange)', icon: '📝' },
                { label: 'Total Reviews', value: reviews.length, color: 'var(--accent-green)', icon: '⭐' },
                { label: 'Exams Created', value: exams.length, color: 'var(--accent-cyan)', icon: '📋' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)', color }}>{value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>Course Enrollment Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {courses.map(c => {
                const count = students.filter(s => s.enrolledCourses?.includes(c.id)).length;
                const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
                      <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: c.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: c.color, minWidth: 60, textAlign: 'right' }}>{count} enrolled</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Manage Courses</h2>
              <button className="btn btn-primary" onClick={openAddCourse}>+ Add Course</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {courses.map(c => (
                <div key={c.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ fontSize: 32 }}>{c.icon}</span>
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{c.title}</h4>
                        <span className={`badge ${c.isActive ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 10 }}>{c.isActive ? 'Active' : 'Hidden'}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.subtitle} · ₹{c.price.toLocaleString()} · {c.duration}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => openEditCourse(c)} style={{ padding: '8px 16px', fontSize: 13 }}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDeleteCourse(c.id, c.title)} style={{ padding: '8px 14px', fontSize: 13 }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Manage Exams</h2>
              <button className="btn btn-primary" onClick={openAddExam}>+ Create Exam</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {exams.map(exam => {
                const course = courses.find(c => c.id === exam.courseId);
                return (
                  <div key={exam.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 4 }}>{exam.title}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{course?.icon} {course?.title} · {exam.questions.length} Qs · {exam.duration}min · Pass: {exam.passingScore}%</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => openEditExam(exam)} style={{ padding: '8px 16px', fontSize: 13 }}>Edit</button>
                      <button className="btn btn-danger" onClick={() => { if (window.confirm('Delete this exam?')) { deleteExam(exam.id); toast('Exam deleted', 'info'); } }} style={{ padding: '8px 14px', fontSize: 13 }}>Delete</button>
                    </div>
                  </div>
                );
              })}
              {exams.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No exams yet. Create one above.</div>}
            </div>
          </div>
        )}

        {/* Notes Editor */}
        {activeTab === 'notes' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Curriculum Notes Editor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>Add or update notes for each week. Students will see these in their dashboard.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {courses.map(course => (
                <div key={course.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 28 }}>{course.icon}</span>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17 }}>{course.title}</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{course.curriculum.filter(c => c.notes).length}/{course.curriculum.length} weeks have notes</p>
                      </div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>{expandedCourse === course.id ? '▲' : '▼'}</span>
                  </div>
                  {expandedCourse === course.id && (
                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {course.curriculum.map((item, i) => (
                        <div key={i} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', background: 'rgba(0,255,136,0.08)', padding: '3px 10px', borderRadius: 6 }}>Week {item.week}</span>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{item.topic}</span>
                          </div>
                          <textarea
                            className="input" placeholder="Add notes for this week... (Markdown supported)" value={item.notes || ''} rows={3} style={{ resize: 'vertical', fontSize: 13 }}
                            onChange={e => updateCurriculumNote(course.id, i, e.target.value)}
                          />
                        </div>
                      ))}
                      <div style={{ fontSize: 12, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>✓ Notes auto-save as you type</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 24 }}>Students ({students.length})</h2>
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No students registered yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {students.map(s => (
                  <div key={s.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0a0a0f', fontSize: 16 }}>{s.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-green)' }}>{s.enrolledCourses?.length || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Courses</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-cyan)' }}>{s.examResults?.length || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Exams</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#a78bfa' }}>{s.examResults?.filter(r => r.passed).length || 0}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Passed</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Joined: {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 24 }}>Student Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No reviews yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviews.map(r => (
                  <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontWeight: 600 }}>{r.studentName}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.studentEmail}</span>
                        <span className="badge badge-cyan" style={{ fontSize: 11 }}>For: {r.instructorName}</span>
                        <span style={{ fontSize: 14 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{r.text}</p>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                    <button className="btn btn-danger" style={{ padding: '7px 14px', fontSize: 12, flexShrink: 0 }} onClick={() => {
                      const updated = reviews.filter(rv => rv.id !== r.id);
                      localStorage.setItem('sf_reviews', JSON.stringify(updated));
                      setReviews(updated);
                      toast('Review removed', 'info');
                    }}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
