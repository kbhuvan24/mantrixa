import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';

const NotesViewer = ({ course, onClose }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }} onClick={onClose}>
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 40, maxWidth: 700, width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 4 }}>{course.icon} {course.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Course Notes & Curriculum</p>
        </div>
        <button onClick={onClose} style={{ background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-secondary)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 15 }}>✕</button>
      </div>
      {course.curriculum.map((item, i) => (
        <div key={i} style={{ marginBottom: 16, background: 'var(--bg-elevated)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ padding: '12px 20px', borderBottom: item.notes ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', background: 'rgba(0,255,136,0.08)', padding: '3px 10px', borderRadius: 6 }}>Week {item.week}</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{item.topic}</span>
          </div>
          {item.notes ? (
            <div style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{item.notes}</div>
          ) : (
            <div style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>Notes coming soon — check back after the live session.</div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { courses, getExamsByCourse } = useCourses();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [viewingNotes, setViewingNotes] = useState(null);

  const enrolledCourses = courses.filter(c => user?.enrolledCourses?.includes(c.id));
  const examResults = user?.examResults || [];

  const TABS = [
    { id: 'courses', label: '📚 My Courses', count: enrolledCourses.length },
    { id: 'exams', label: '📝 Exam Results', count: examResults.length },
  ];

  return (
    <div className="page-wrapper">
      {viewingNotes && <NotesViewer course={viewingNotes} onClose={() => setViewingNotes(null)} />}

      {/* Header */}
      <section style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: 'clamp(28px, 7vw, 40px) 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 4vw, 20px)', alignItems: 'center', marginBottom: 'clamp(24px, 6vw, 32px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 4vw, 20px)' }}>
              <div style={{ width: 'clamp(48px, 10vw, 60px)', height: 'clamp(48px, 10vw, 60px)', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 900, color: '#0a0a0f', fontFamily: 'var(--font-display)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="section-tag" style={{ marginBottom: 4 }}>Student Dashboard</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 4vw, 2rem)', letterSpacing: '-0.02em' }}>Hey, {user?.name?.split(' ')[0]}! 👋</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(12px, 2vw, 14px)' }}>{user?.email}</p>
              </div>
            </div>
            <Link to="/learning-hub" className="btn btn-primary" style={{ justifySelf: 'start', fontSize: 'clamp(13px, 2vw, 15px)', padding: 'clamp(10px, 2vw, 12px) clamp(16px, 3vw, 22px)' }}>+ Enroll in a Course</Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'clamp(12px, 3vw, 16px)' }}>
            {[
              { label: 'Enrolled Courses', value: enrolledCourses.length, color: 'var(--accent-green)' },
              { label: 'Exams Taken', value: examResults.length, color: 'var(--accent-cyan)' },
              { label: 'Exams Passed', value: examResults.filter(r => r.passed).length, color: '#a78bfa' },
              { label: 'Learning Hours', value: `${enrolledCourses.reduce((a, c) => a + parseInt(c.duration), 0)}+`, color: 'var(--accent-orange)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 'clamp(12px, 3vw, 16px) clamp(14px, 3vw, 20px)' }}>
                <div style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{value}</div>
                <div style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '0 24px', position: 'sticky', top: 80, zIndex: 10, backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '16px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: activeTab === tab.id ? 'var(--accent-green)' : 'var(--text-secondary)', borderBottom: activeTab === tab.id ? '2px solid var(--accent-green)' : '2px solid transparent', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
              {tab.label}
              <span style={{ padding: '1px 7px', borderRadius: 999, fontSize: 11, background: activeTab === tab.id ? 'rgba(0,255,136,0.12)' : 'var(--bg-elevated)', color: activeTab === tab.id ? 'var(--accent-green)' : 'var(--text-muted)' }}>{tab.count}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="container" style={{ padding: 'clamp(28px, 7vw, 40px) 0 clamp(60px, 15vw, 80px)' }}>
        {/* My Courses Tab */}
        {activeTab === 'courses' && (
          <div>
            {enrolledCourses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>📚</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>No courses yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Enroll in a course to start your journey</p>
                <Link to="/learning-hub" className="btn btn-primary">Browse Courses →</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 24 }}>
                {enrolledCourses.map(course => {
                  const courseExams = getExamsByCourse(course.id);
                  const takenExams = examResults.filter(r => r.courseId === course.id);
                  const notesCount = course.curriculum.filter(c => c.notes).length;
                  return (
                    <div key={course.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: course.color }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 40, flexShrink: 0 }}>{course.icon}</span>
                          <div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                              <span className="badge" style={{ background: `${course.color}15`, color: course.color, border: `1px solid ${course.color}30`, fontSize: 11 }}>{course.category}</span>
                              <span className="badge badge-green" style={{ fontSize: 11 }}>✓ Enrolled</span>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{course.duration}</span>
                            </div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 6, lineHeight: 1.25 }}>{course.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{course.subtitle}</p>
                            <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📝 <span style={{ color: notesCount > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{notesCount} weeks</span> have notes</span>
                              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📋 {courseExams.length} exam{courseExams.length !== 1 ? 's' : ''} available</span>
                              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>✅ {takenExams.length} taken</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', minWidth: 160 }}>
                          <button className="btn btn-secondary" onClick={() => setViewingNotes(course)} style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}>
                            📖 View Notes
                          </button>
                          {courseExams.length > 0 && (
                            <button className="btn btn-outline" onClick={() => navigate('/exam-panel', { state: { courseId: course.id } })} style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}>
                              📝 Take Exam
                            </button>
                          )}
                          <button className="btn" onClick={() => navigate('/interview-panel', { state: { courseId: course.id } })} style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)', width: '100%', justifyContent: 'center', fontSize: 14 }}>
                            🎤 Interview Prep
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Exam Results Tab */}
        {activeTab === 'exams' && (
          <div>
            {examResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>📝</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 12 }}>No exams taken yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Head to your enrolled courses and take an exam</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 16 }}>
                {[...examResults].reverse().map((result, i) => {
                  const course = courses.find(c => c.id === result.courseId);
                  return (
                    <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16 }}>{course?.icon}</span>
                          <span className={`badge ${result.passed ? 'badge-green' : 'badge-orange'}`}>{result.passed ? '✓ Passed' : '✕ Failed'}</span>
                          <span className="badge badge-cyan" style={{ fontSize: 11 }}>{result.examTitle}</span>
                        </div>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 4 }}>{course?.title || result.courseId}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{new Date(result.takenAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)', color: result.passed ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{result.score}%</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pass mark: {result.passingScore}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
