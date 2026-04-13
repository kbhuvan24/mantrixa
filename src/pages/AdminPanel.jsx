import React, { useState, useEffect, useRef } from 'react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const EMPTY_COURSE = {
  title: '', subtitle: '', description: '', icon: '📚', color: '#00ff88',
  level: 'Beginner', duration: '8 Weeks', price: 2999, originalPrice: 5999,
  category: 'DevOps', tags: [], outcomes: [], curriculum: [], isActive: true
};
const EMPTY_EXAM = { courseId: '', title: '', duration: 30, passingScore: 70, questions: [] };
const EMPTY_QUESTION = { question: '', options: ['', '', '', ''], correct: 0 };

// ── Bulk Import: parse JSON or detect array of exams ──────────────────────
const parseExamJson = (raw) => {
  const parsed = JSON.parse(raw);
  // Accept either a single exam object or an array
  const items = Array.isArray(parsed) ? parsed : [parsed];
  return items.map((item, i) => {
    if (!item.courseId || !item.title || !Array.isArray(item.questions)) {
      throw new Error(`Item ${i + 1}: missing required fields (courseId, title, questions).`);
    }
    return {
      courseId: item.courseId,
      title: item.title,
      duration: Number(item.duration) || 30,
      passingScore: Number(item.passingScore) || 70,
      questions: item.questions.map((q, qi) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
          throw new Error(`Exam "${item.title}", Q${qi + 1}: invalid question format.`);
        }
        return {
          id: `q${qi + 1}`,
          question: q.question,
          options: q.options.slice(0, 4),
          correct: Number(q.correct) || 0,
        };
      }),
    };
  });
};

const TABS = [
  { id: 'overview', label: '📊 Overview' },
  { id: 'courses', label: '📚 Courses' },
  { id: 'exams', label: '📝 Exams' },
  { id: 'bulk', label: '📥 Bulk Import' },
  { id: 'notes', label: '📒 Notes' },
  { id: 'payments', label: '💳 Payments' },
  { id: 'students', label: '👥 Students' },
  { id: 'reviews', label: '⭐ Reviews' },
];

const AdminPanel = () => {
  const { courses, exams, addCourse, updateCourse, deleteCourse, updateCurriculumNote, addExam, updateExam, deleteExam, getReviews } = useCourses();
  const { user, isAdmin, getUsers, approvePayment, rejectPayment } = useAuth();
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
  const [students, setStudents] = useState([]);

  // Bulk import state
  const [bulkText, setBulkText] = useState('');
  const [bulkParsed, setBulkParsed] = useState(null);
  const [bulkError, setBulkError] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setReviews(getReviews());
    setStudents(getUsers());
  }, [activeTab, getReviews, getUsers]);

  const refreshStudents = () => setStudents(getUsers());

  // ── Stats ─────────────────────────────────────────────────────────────
  const totalEnrolled = students.reduce((a, s) => a + (s.enrolledCourses?.length || 0), 0);
  const totalExamsTaken = students.reduce((a, s) => a + (s.examResults?.length || 0), 0);
  const pendingPaymentsList = students.flatMap(s =>
    (s.pendingPayments || [])
      .filter(p => p.status === 'pending')
      .map(p => ({ ...p, studentId: s.id, studentName: s.name, studentEmail: s.email }))
  );

  // ── Course Handlers ───────────────────────────────────────────────────
  const openAddCourse = () => {
    setCourseForm({ ...EMPTY_COURSE, curriculum: Array.from({ length: 8 }, (_, i) => ({ week: i + 1, topic: '', notes: '' })) });
    setEditingCourse(null); setShowCourseForm(true);
  };
  const openEditCourse = (c) => { setCourseForm({ ...c, tags: c.tags || [] }); setEditingCourse(c.id); setShowCourseForm(true); };
  const handleSaveCourse = () => {
    if (!courseForm.title.trim()) { toast('Course title is required', 'error'); return; }
    if (editingCourse) { updateCourse(editingCourse, courseForm); toast('Course updated!', 'success'); }
    else { addCourse(courseForm); toast('Course added!', 'success'); }
    setShowCourseForm(false);
  };
  const handleDeleteCourse = (id, title) => {
    if (!isAdmin) { toast('Only Admin can delete courses', 'error'); return; }
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) { deleteCourse(id); toast('Course deleted', 'info'); }
  };

  // ── Exam Handlers ─────────────────────────────────────────────────────
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

  // ── Bulk Import Handlers ──────────────────────────────────────────────
  const handleBulkFileLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBulkText(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleBulkParse = () => {
    setBulkError('');
    setBulkParsed(null);
    if (!bulkText.trim()) { setBulkError('Please paste JSON or upload a file.'); return; }
    try {
      const parsed = parseExamJson(bulkText);
      // Validate course IDs exist
      parsed.forEach(exam => {
        if (!courses.find(c => c.id === exam.courseId)) {
          throw new Error(`Course ID "${exam.courseId}" not found. Check your course IDs in the Courses tab.`);
        }
      });
      setBulkParsed(parsed);
    } catch (err) {
      setBulkError(err.message);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkParsed?.length) return;
    setBulkImporting(true);
    await new Promise(r => setTimeout(r, 400));
    bulkParsed.forEach(exam => addExam(exam));
    toast(`✅ Imported ${bulkParsed.length} exam${bulkParsed.length > 1 ? 's' : ''} successfully!`, 'success');
    setBulkText(''); setBulkParsed(null); setBulkError('');
    setBulkImporting(false);
  };

  // ── Payment Handlers ──────────────────────────────────────────────────
  const handleApprovePayment = (studentId, courseId, studentName) => {
    const ok = approvePayment(studentId, courseId);
    if (ok) {
      toast(`✅ Payment approved — ${studentName} enrolled!`, 'success');
      refreshStudents();
    }
  };
  const handleRejectPayment = (studentId, courseId, studentName) => {
    if (!window.confirm(`Reject payment for ${studentName}?`)) return;
    const ok = rejectPayment(studentId, courseId);
    if (ok) { toast(`Payment rejected for ${studentName}`, 'info'); refreshStudents(); }
  };

  const BULK_EXAMPLE = JSON.stringify([
    {
      courseId: 'devops-fundamentals',
      title: 'Quick Docker Quiz',
      duration: 15,
      passingScore: 60,
      questions: [
        { question: 'What does Docker do?', options: ['Orchestrates VMs', 'Containerises apps', 'Manages DNS', 'Runs bare metal'], correct: 1 },
        { question: 'Which command runs a container?', options: ['docker build', 'docker run', 'docker pull', 'docker exec'], correct: 1 },
      ]
    }
  ], null, 2);

  // ── Role badge ────────────────────────────────────────────────────────
  const roleBadgeColor = user?.role === 'admin' ? 'var(--accent-orange)' : 'var(--accent-cyan)';
  const roleBadgeBg = user?.role === 'admin' ? 'rgba(255,107,53,0.15)' : 'rgba(0,212,255,0.12)';
  const roleBadgeBorder = user?.role === 'admin' ? 'rgba(255,107,53,0.3)' : 'rgba(0,212,255,0.3)';

  const visibleTabs = isAdmin
    ? TABS
    : TABS.filter(t => !['courses', 'bulk'].includes(t.id)); // co-admin: no add/delete courses, no bulk

  return (
    <div className="page-wrapper">
      {/* ── Course Form Modal ── */}
      {showCourseForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, overflowY: 'auto', padding: 'clamp(12px, 4vw, 24px)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 'clamp(24px, 6vw, 40px)', maxWidth: 700, margin: 'clamp(24px, 6vw, 40px) auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <button onClick={() => setShowCourseForm(false)} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-secondary)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              {[['title', 'Course Title'], ['subtitle', 'Subtitle'], ['category', 'Category'], ['icon', 'Icon (emoji)'], ['duration', 'Duration'], ['level', 'Level']].map(([key, label]) => (
                <div key={key} className="input-group">
                  <label className="input-label">{label}</label>
                  <input className="input" value={courseForm[key] || ''} onChange={e => setCourseForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              {[['price', 'Price (₹)'], ['originalPrice', 'Original Price (₹)']].map(([key, label]) => (
                <div key={key} className="input-group">
                  <label className="input-label">{label}</label>
                  <input className="input" type="number" value={courseForm[key] || ''} onChange={e => setCourseForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} />
                </div>
              ))}
              <div className="input-group">
                <label className="input-label">Accent Color</label>
                <input className="input" value={courseForm.color} onChange={e => setCourseForm(f => ({ ...f, color: e.target.value }))} />
              </div>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label className="input-label" style={{ marginBottom: 0 }}>Active</label>
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

      {/* ── Exam Form Modal ── */}
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

      {/* ── Header ── */}
      <section style={{ padding: '40px 0', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ padding: '6px 12px', background: roleBadgeBg, border: `1px solid ${roleBadgeBorder}`, borderRadius: 8, fontSize: 12, color: roleBadgeColor, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {user?.role?.toUpperCase()}
            </div>
            <div className="section-tag" style={{ marginBottom: 0 }}>Control Panel</div>
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', letterSpacing: '-0.025em' }}>
            {user?.role === 'coadmin' ? 'Co-Admin Dashboard' : 'Admin Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
            Logged in as <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> · {user?.email}
          </p>
        </div>
      </section>

      {/* ── Tabs ── */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '0 24px', position: 'sticky', top: 80, zIndex: 20, backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 2, overflowX: 'auto' }}>
          {visibleTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '16px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
              fontWeight: 600, whiteSpace: 'nowrap',
              color: activeTab === tab.id ? roleBadgeColor : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? `2px solid ${roleBadgeColor}` : '2px solid transparent',
              transition: 'all 0.2s'
            }}>
              {tab.label}
              {tab.id === 'payments' && pendingPaymentsList.length > 0 && (
                <span style={{ marginLeft: 6, background: '#ff3b3b', color: '#fff', borderRadius: 999, fontSize: 10, padding: '1px 6px', fontWeight: 800 }}>
                  {pendingPaymentsList.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px' }}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20, marginBottom: 40 }}>
              {[
                { label: 'Total Students', value: students.length, color: 'var(--accent-green)', icon: '👥' },
                { label: 'Active Courses', value: courses.filter(c => c.isActive).length, color: 'var(--accent-cyan)', icon: '📚' },
                { label: 'Enrollments', value: totalEnrolled, color: '#a78bfa', icon: '🎓' },
                { label: 'Exams Taken', value: totalExamsTaken, color: 'var(--accent-orange)', icon: '📝' },
                { label: 'Pending Payments', value: pendingPaymentsList.length, color: '#ff3b3b', icon: '💳' },
                { label: 'Total Reviews', value: reviews.length, color: 'var(--accent-green)', icon: '⭐' },
              ].map(({ label, value, color, icon }) => (
                <div key={label} className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)', color }}>{value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
            {pendingPaymentsList.length > 0 && (
              <div style={{ background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.2)', borderRadius: 14, padding: 20, marginBottom: 32 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#ff3b3b', marginBottom: 12 }}>
                  ⚠️ {pendingPaymentsList.length} payment{pendingPaymentsList.length > 1 ? 's' : ''} awaiting verification
                </h3>
                <button className="btn btn-danger" onClick={() => setActiveTab('payments')} style={{ fontSize: 13 }}>
                  Review Payments →
                </button>
              </div>
            )}
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 16 }}>Enrollment Breakdown</h3>
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

        {/* ── COURSES (Admin only) ── */}
        {activeTab === 'courses' && isAdmin && (
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
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.subtitle} · ₹{c.price?.toLocaleString()} · {c.duration}</p>
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

        {/* ── EXAMS ── */}
        {activeTab === 'exams' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Manage Exams</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setActiveTab('bulk')} style={{ fontSize: 13 }}>📥 Bulk Import</button>
                <button className="btn btn-primary" onClick={openAddExam}>+ Create Exam</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {exams.map(exam => {
                const course = courses.find(c => c.id === exam.courseId);
                return (
                  <div key={exam.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 4 }}>{exam.title}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{course?.icon} {course?.title} · {exam.questions?.length} Qs · {exam.duration}min · Pass: {exam.passingScore}%</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => openEditExam(exam)} style={{ padding: '8px 16px', fontSize: 13 }}>Edit</button>
                      {isAdmin && (
                        <button className="btn btn-danger" onClick={() => { if (window.confirm('Delete this exam?')) { deleteExam(exam.id); toast('Exam deleted', 'info'); } }} style={{ padding: '8px 14px', fontSize: 13 }}>Delete</button>
                      )}
                    </div>
                  </div>
                );
              })}
              {exams.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No exams yet.</div>}
            </div>
          </div>
        )}

        {/* ── BULK IMPORT (Admin only) ── */}
        {activeTab === 'bulk' && isAdmin && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div className="section-tag">Bulk Exam Import</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Import Multiple Exams at Once</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                Paste JSON directly or upload a <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>.json</code> file.
                You can import a single exam object or an array of exam objects.
              </p>
            </div>

            {/* JSON Schema Reference */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 14, padding: 20, marginBottom: 28, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>JSON Schema (Example)</h3>
                <button className="btn btn-secondary" onClick={() => setBulkText(BULK_EXAMPLE)} style={{ fontSize: 12, padding: '6px 14px' }}>
                  Load Example
                </button>
              </div>
              <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-cyan)', overflowX: 'auto', margin: 0, lineHeight: 1.7 }}>
                {BULK_EXAMPLE}
              </pre>
            </div>

            {/* Course IDs reference */}
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>Available Course IDs</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {courses.map(c => (
                  <span key={c.id} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '4px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, color: c.color }}>
                    {c.id}
                  </span>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ fontSize: 13 }}>
                📁 Upload JSON File
              </button>
              <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleBulkFileLoad} style={{ display: 'none' }} />
              {bulkText && (
                <button className="btn btn-danger" onClick={() => { setBulkText(''); setBulkParsed(null); setBulkError(''); }} style={{ fontSize: 13, padding: '8px 14px' }}>
                  Clear
                </button>
              )}
            </div>

            {/* Textarea */}
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">JSON Content</label>
              <textarea
                className="input"
                placeholder={'Paste your exam JSON here...\n\nSingle exam: { "courseId": "...", "title": "...", ... }\nMultiple exams: [ { ... }, { ... } ]'}
                value={bulkText}
                onChange={e => { setBulkText(e.target.value); setBulkParsed(null); setBulkError(''); }}
                rows={12}
                style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 13 }}
              />
            </div>

            <button className="btn btn-outline" onClick={handleBulkParse} disabled={!bulkText.trim()} style={{ marginBottom: 16 }}>
              🔍 Validate & Preview
            </button>

            {/* Error */}
            {bulkError && (
              <div style={{ background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.25)', borderRadius: 10, padding: '14px 18px', marginBottom: 16, fontSize: 13, color: '#ff3b3b', fontFamily: 'var(--font-mono)' }}>
                ✕ {bulkError}
              </div>
            )}

            {/* Preview */}
            {bulkParsed && (
              <div style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--accent-green)', marginBottom: 16 }}>
                  ✓ {bulkParsed.length} exam{bulkParsed.length > 1 ? 's' : ''} validated successfully
                </h3>
                {bulkParsed.map((exam, i) => {
                  const course = courses.find(c => c.id === exam.courseId);
                  return (
                    <div key={i} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 16px', marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{exam.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {course?.icon} {course?.title} · {exam.questions.length} questions · {exam.duration}min · Pass: {exam.passingScore}%
                      </div>
                    </div>
                  );
                })}
                <button className="btn btn-primary" onClick={handleBulkImport} disabled={bulkImporting} style={{ marginTop: 8 }}>
                  {bulkImporting ? <><div className="spinner" /> Importing...</> : `✅ Import ${bulkParsed.length} Exam${bulkParsed.length > 1 ? 's' : ''} →`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── NOTES ── */}
        {activeTab === 'notes' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Curriculum Notes Editor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>Add or update notes per week. Students see these in their dashboard.</p>
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
                          <textarea className="input" placeholder="Add notes... (Markdown supported)" value={item.notes || ''} rows={3} style={{ resize: 'vertical', fontSize: 13 }} onChange={e => updateCurriculumNote(course.id, i, e.target.value)} />
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

        {/* ── PAYMENTS ── */}
        {activeTab === 'payments' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>Payment Management</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
              Review UPI payment submissions and approve or reject course enrollments.
            </p>

            {/* Pending */}
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 14, color: pendingPaymentsList.length ? '#ff9944' : 'var(--text-secondary)' }}>
              ⏳ Pending Verification ({pendingPaymentsList.length})
            </h3>
            {pendingPaymentsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', marginBottom: 40 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <p>No pending payments — all clear!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
                {pendingPaymentsList.map((p, i) => {
                  const course = courses.find(c => c.id === p.courseId);
                  return (
                    <div key={i} className="card" style={{ border: '1px solid rgba(255,153,68,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700 }}>{p.studentName}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.studentEmail}</span>
                          <span className="badge badge-orange" style={{ fontSize: 11 }}>Pending</span>
                        </div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                          {course?.icon} <strong>{course?.title}</strong> · ₹{p.amount?.toLocaleString()}
                        </div>
                        {p.upiRef && (
                          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: 4 }}>
                            UPI Ref: {p.upiRef}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                          Submitted: {new Date(p.createdAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={() => handleApprovePayment(p.studentId, p.courseId, p.studentName)} style={{ padding: '9px 18px', fontSize: 13 }}>
                          ✓ Approve
                        </button>
                        <button className="btn btn-danger" onClick={() => handleRejectPayment(p.studentId, p.courseId, p.studentName)} style={{ padding: '9px 14px', fontSize: 13 }}>
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* All payment history */}
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 14 }}>Payment History</h3>
            {(() => {
              const allPayments = students.flatMap(s =>
                (s.pendingPayments || []).map(p => ({ ...p, studentId: s.id, studentName: s.name, studentEmail: s.email }))
              ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              if (allPayments.length === 0) {
                return <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No payments yet.</div>;
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {allPayments.map((p, i) => {
                    const course = courses.find(c => c.id === p.courseId);
                    const statusColor = p.status === 'approved' ? 'var(--accent-green)' : p.status === 'rejected' ? '#ff3b3b' : 'var(--accent-orange)';
                    return (
                      <div key={i} style={{ padding: '14px 18px', background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{p.studentName}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 8 }}>{course?.icon} {course?.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-cyan)' }}>{p.upiRef || '—'}</span>
                          <span style={{ fontWeight: 700, color: statusColor, fontSize: 13 }}>
                            {p.status === 'approved' ? '✓ Approved' : p.status === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {new Date(p.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── STUDENTS ── */}
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
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0a0a0f', fontSize: 16 }}>
                        {s.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {[
                        { val: s.enrolledCourses?.length || 0, label: 'Courses', color: 'var(--accent-green)' },
                        { val: s.examResults?.length || 0, label: 'Exams', color: 'var(--accent-cyan)' },
                        { val: s.examResults?.filter(r => r.passed).length || 0, label: 'Passed', color: '#a78bfa' },
                        { val: (s.pendingPayments || []).filter(p => p.status === 'pending').length, label: 'Pending Pay', color: '#ff9944' },
                      ].map(({ val, label, color }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
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
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600 }}>{r.studentName}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{r.studentEmail}</span>
                        <span className="badge badge-cyan" style={{ fontSize: 11 }}>For: {r.instructorName}</span>
                        <span style={{ fontSize: 14 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{r.text}</p>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    {isAdmin && (
                      <button className="btn btn-danger" style={{ padding: '7px 14px', fontSize: 12, flexShrink: 0 }} onClick={() => {
                        const updated = reviews.filter(rv => rv.id !== r.id);
                        localStorage.setItem('sf_reviews', JSON.stringify(updated));
                        setReviews(updated);
                        toast('Review removed', 'info');
                      }}>Remove</button>
                    )}
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
