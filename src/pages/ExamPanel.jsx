import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { useToast } from '../components/Toast';

const ExamPanel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, saveExamResult } = useAuth();
  const { courses, getExamsByCourse } = useCourses();
  const { toast } = useToast();

  const preselectedCourseId = location.state?.courseId;
  const [phase, setPhase] = useState('select'); // select | intro | active | result
  const [selectedCourseId, setSelectedCourseId] = useState(preselectedCourseId || '');
  const [selectedExam, setSelectedExam] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const enrolledCourses = courses.filter(c => user?.enrolledCourses?.includes(c.id));

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleStartExam = () => {
    setAnswers({});
    setCurrentQ(0);
    setTimeLeft(selectedExam.duration * 60);
    setPhase('active');
  };

  const handleAnswer = (qIdx, optIdx) => {
    setAnswers(a => ({ ...a, [qIdx]: optIdx }));
  };

  const handleSubmit = useCallback((auto = false) => {
    if (!selectedExam) return;
    const questions = selectedExam.questions;
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= selectedExam.passingScore;
    const res = {
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      courseId: selectedExam.courseId,
      score,
      passed,
      passingScore: selectedExam.passingScore,
      correct,
      total: questions.length,
      takenAt: new Date().toISOString(),
      answers: { ...answers }
    };
    setResult(res);
    saveExamResult(res);
    setPhase('result');
    if (auto) toast('Time is up! Exam auto-submitted.', 'info');
  }, [selectedExam, answers, saveExamResult, toast]);

  // Timer - must be after handleSubmit definition
  useEffect(() => {
    if (phase !== 'active' || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); handleSubmit(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase, timeLeft, handleSubmit]);

  const examsForCourse = selectedCourseId ? getExamsByCourse(selectedCourseId) : [];

  // PHASE: SELECT
  if (phase === 'select') {
    return (
      <div className="page-wrapper">
        <section style={{ padding: 'clamp(40px, 10vw, 60px) 0 clamp(30px, 8vw, 40px)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-tag">Assessment Centre</div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.8rem)', letterSpacing: '-0.025em' }}>Exam Panel</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(14px, 2vw, 15px)' }}>Test your knowledge with timed MCQ assessments. Results are saved to your profile.</p>
          </div>
        </section>
        <div className="container" style={{ padding: 'clamp(32px, 7vw, 48px) clamp(16px, 4vw, 24px) clamp(60px, 15vw, 80px)' }}>
          <div style={{ maxWidth: 600 }}>
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">Select Course</label>
              <select className="input" value={selectedCourseId} onChange={e => { setSelectedCourseId(e.target.value); setSelectedExam(null); }}>
                <option value="">-- Choose an enrolled course --</option>
                {enrolledCourses.map(c => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
              </select>
            </div>
            {selectedCourseId && (
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(15px, 3vw, 18px)', marginBottom: 'clamp(12px, 3vw, 16px)' }}>Available Exams</h3>
                {examsForCourse.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: 'clamp(28px, 8vw, 40px)', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 'clamp(32px, 8vw, 40px)', marginBottom: 12 }}>🕐</div>
                    <p style={{ fontSize: 'clamp(13px, 2vw, 14px)' }}>No exams available for this course yet. Check back soon!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2.5vw, 14px)' }}>
                    {examsForCourse.map(exam => (
                      <div key={exam.id} className="card" style={{ cursor: 'pointer', border: selectedExam?.id === exam.id ? '1px solid var(--accent-green)' : '1px solid var(--border)', background: selectedExam?.id === exam.id ? 'rgba(0,255,136,0.04)' : 'var(--bg-card)', padding: 'clamp(14px, 3vw, 16px)' }} onClick={() => setSelectedExam(exam)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'clamp(8px, 2vw, 12px)' }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 2.5vw, 16px)', marginBottom: 'clamp(6px, 1.5vw, 6px)' }}>{exam.title}</h4>
                            <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: 'var(--text-secondary)' }}>⏱ {exam.duration} min</span>
                              <span style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: 'var(--text-secondary)' }}>📊 {exam.questions.length} questions</span>
                              <span style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: 'var(--text-secondary)' }}>🎯 Pass: {exam.passingScore}%</span>
                            </div>
                          </div>
                          {selectedExam?.id === exam.id && <span className="badge badge-green" style={{ fontSize: 'clamp(11px, 2vw, 12px)' }}>✓ Selected</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedExam && (
              <button className="btn btn-primary" onClick={() => setPhase('intro')} style={{ marginTop: 'clamp(20px, 5vw, 28px)', width: '100%', justifyContent: 'center', padding: 'clamp(12px, 3vw, 16px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>
                Start Exam: {selectedExam.title} →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PHASE: INTRO
  if (phase === 'intro') {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 24px)' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          <div className="card" style={{ textAlign: 'center', border: '1px solid var(--border-active)' }}>
            <div style={{ fontSize: 'clamp(40px, 10vw, 60px)', marginBottom: 'clamp(12px, 3vw, 16px)' }}>📝</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 4vw, 24px)', marginBottom: 8 }}>{selectedExam.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'clamp(20px, 5vw, 28px)', fontSize: 'clamp(13px, 2vw, 14px)' }}>Read the instructions carefully before starting.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'clamp(8px, 2vw, 12px)', marginBottom: 'clamp(20px, 5vw, 28px)' }}>
              {[{ label: 'Duration', value: `${selectedExam.duration} min`, icon: '⏱' }, { label: 'Questions', value: selectedExam.questions.length, icon: '📋' }, { label: 'Pass Mark', value: `${selectedExam.passingScore}%`, icon: '🎯' }].map(({ label, value, icon }) => (
                <div key={label} style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 'clamp(12px, 3vw, 16px) clamp(8px, 2vw, 8px)' }}>
                  <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', marginBottom: 'clamp(4px, 1.5vw, 6px)' }}>{icon}</div>
                  <div style={{ fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}>{value}</div>
                  <div style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,212,0,0.06)', border: '1px solid rgba(255,212,0,0.2)', borderRadius: 10, padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3vw, 20px)', marginBottom: 'clamp(16px, 4vw, 24px)', textAlign: 'left' }}>
              <p style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#ffd900', lineHeight: 1.6 }}>⚠️ The exam timer starts immediately. Once started, you cannot pause. The exam auto-submits when time runs out.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'clamp(8px, 2vw, 12px)' }}>
              <button className="btn btn-secondary" onClick={() => setPhase('select')} style={{ justifyContent: 'center', padding: 'clamp(11px, 2.5vw, 14px)' }}>← Back</button>
              <button className="btn btn-primary" onClick={handleStartExam} style={{ justifyContent: 'center', padding: 'clamp(11px, 2.5vw, 14px)' }}>Start Exam Now 🚀</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: ACTIVE
  if (phase === 'active' && selectedExam) {
    const q = selectedExam.questions[currentQ];
    const total = selectedExam.questions.length;
    const progress = (Object.keys(answers).length / total) * 100;
    const timeColor = timeLeft < 60 ? '#ff3b3b' : timeLeft < 120 ? 'var(--accent-orange)' : 'var(--accent-green)';

    return (
      <div className="page-wrapper">
        {/* Exam Header */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 80, display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{selectedExam.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Question {currentQ + 1} of {total}</div>
            </div>
            <div style={{ flex: 1, maxWidth: 300 }}>
              <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-green)', borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{Object.keys(answers).length}/{total} answered</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: timeColor, background: `${timeColor}10`, padding: '8px 16px', borderRadius: 10, border: `1px solid ${timeColor}30` }}>
              ⏱ {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 120, paddingBottom: 80, minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ maxWidth: 700 }}>
            <div className="card" style={{ border: '1px solid var(--border-active)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-green)', marginBottom: 16 }}>Q{currentQ + 1} / {total}</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 2.5vw, 1.3rem)', marginBottom: 28, lineHeight: 1.4 }}>{q.question}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {q.options.map((opt, i) => {
                  const selected = answers[currentQ] === i;
                  return (
                    <button key={i} onClick={() => handleAnswer(currentQ, i)} style={{ padding: '16px 20px', borderRadius: 12, border: selected ? '2px solid var(--accent-green)' : '1px solid var(--border)', background: selected ? 'rgba(0,255,136,0.08)' : 'var(--bg-elevated)', color: selected ? 'var(--accent-green)' : 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', fontSize: 15, fontFamily: 'var(--font-body)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ width: 26, height: 26, borderRadius: '50%', border: selected ? '2px solid var(--accent-green)' : '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, background: selected ? 'var(--accent-green)' : 'transparent', color: selected ? '#0a0a0f' : 'var(--text-muted)' }}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0} style={{ padding: '10px 18px' }}>← Prev</button>
                  <button className="btn btn-secondary" onClick={() => setCurrentQ(q => Math.min(total - 1, q + 1))} disabled={currentQ === total - 1} style={{ padding: '10px 18px' }}>Next →</button>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedExam.questions.map((_, i) => (
                    <button key={i} onClick={() => setCurrentQ(i)} style={{ width: 32, height: 32, borderRadius: 6, border: currentQ === i ? '2px solid var(--accent-green)' : answers[i] !== undefined ? '1px solid rgba(0,255,136,0.4)' : '1px solid var(--border)', background: currentQ === i ? 'rgba(0,255,136,0.15)' : answers[i] !== undefined ? 'rgba(0,255,136,0.06)' : 'var(--bg-elevated)', color: currentQ === i ? 'var(--accent-green)' : 'var(--text-secondary)', fontSize: 12, cursor: 'pointer' }}>{i + 1}</button>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={() => handleSubmit(false)} style={{ padding: '12px 24px' }}>
                  Submit Exam ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PHASE: RESULT
  if (phase === 'result' && result) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: 580, width: '100%' }}>
          <div className="card" style={{ textAlign: 'center', border: `1px solid ${result.passed ? 'rgba(0,255,136,0.3)' : 'rgba(255,107,53,0.3)'}` }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{result.passed ? '🏆' : '📚'}</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8, color: result.passed ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
              {result.passed ? 'Exam Passed!' : 'Keep Practising'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>{result.examTitle}</p>
            <div style={{ fontSize: 72, fontWeight: 900, fontFamily: 'var(--font-display)', color: result.passed ? 'var(--accent-green)' : 'var(--accent-orange)', lineHeight: 1, marginBottom: 8 }}>{result.score}%</div>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 14, marginBottom: 28 }}>{result.correct}/{result.total} correct · Pass mark: {result.passingScore}%</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              <div style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-green)' }}>{result.correct}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Correct</div>
              </div>
              <div style={{ background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.15)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-orange)' }}>{result.total - result.correct}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Incorrect</div>
              </div>
            </div>

            {showReview && (
              <div style={{ textAlign: 'left', marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16 }}>Answer Review</h3>
                {selectedExam?.questions.map((q, i) => {
                  const isCorrect = result.answers[i] === q.correct;
                  return (
                    <div key={i} style={{ marginBottom: 14, padding: '14px 16px', background: isCorrect ? 'rgba(0,255,136,0.05)' : 'rgba(255,59,59,0.05)', border: `1px solid ${isCorrect ? 'rgba(0,255,136,0.2)' : 'rgba(255,59,59,0.2)'}`, borderRadius: 10 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{i + 1}. {q.question}</p>
                      <p style={{ fontSize: 13, color: 'var(--accent-green)' }}>✓ {q.options[q.correct]}</p>
                      {!isCorrect && result.answers[i] !== undefined && <p style={{ fontSize: 13, color: '#ff3b3b' }}>✗ Your answer: {q.options[result.answers[i]]}</p>}
                      {result.answers[i] === undefined && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>— Not answered</p>}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setShowReview(r => !r)} style={{ flex: 1, justifyContent: 'center' }}>
                {showReview ? 'Hide' : 'Review'} Answers
              </button>
              <button className="btn btn-secondary" onClick={() => { setPhase('select'); setResult(null); setSelectedExam(null); }} style={{ flex: 1, justifyContent: 'center' }}>
                Try Another
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ flex: 1, justifyContent: 'center' }}>
                Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ExamPanel;
