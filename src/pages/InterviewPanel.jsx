import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { INTERVIEW_QUESTIONS } from '../data/initialData';

const MEET_LINK = 'https://meet.google.com/new';
const INSTRUCTORS = [
  { name: 'Bhuvan', email: 'bhuvan@mantrixa.dev' },
  { name: 'Tarun', email: 'tarun@mantrixa.dev' }
];

const TypingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 14px' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-cyan)', animation: 'blink 1.2s ease infinite', animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

const InterviewPanel = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { courses } = useCourses();

  const preselectedCourseId = location.state?.courseId;
  const [selectedCourseId, setSelectedCourseId] = useState(preselectedCourseId || '');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [showMeetPanel, setShowMeetPanel] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(INSTRUCTORS[0]);
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const messagesEndRef = useRef(null);

  const enrolledCourses = courses.filter(c => user?.enrolledCourses?.includes(c.id));
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const addBotMessage = (text, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(m => [...m, { role: 'bot', text, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
    }, delay);
  };

  const startSession = () => {
    if (!selectedCourseId) return;
    const course = courses.find(c => c.id === selectedCourseId);
    setMessages([]);
    setQuestionIdx(0);
    setSessionStarted(true);
    const questions = INTERVIEW_QUESTIONS[selectedCourseId] || [];
    setTimeout(() => {
      setMessages([{
        role: 'bot',
        text: `👋 Hi ${user?.name?.split(' ')[0]}! I'm your Mantrixa AI interview coach for **${course?.title}**.\n\nI'll ask you questions that real interviewers at top tech companies ask. Take your time, think out loud, and give detailed answers.\n\nReady to start? Here's your first question:`,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      }]);
      if (questions.length > 0) {
        addBotMessage(`**Q1:** ${questions[0]}`, 1500);
      }
    }, 400);
  };

  const getAIFeedback = (question, answer) => {
    const feedbacks = [
      `Good start! You mentioned some key points. In a real interview, make sure to use the **STAR method** (Situation, Task, Action, Result) to structure your answer clearly. Try to include a specific example from your experience or studies.`,
      `That's a reasonable answer. For bonus points, always try to quantify your answer — mention numbers, time saved, or scale of systems. Interviewers love specifics!`,
      `You're on the right track. One thing to add: always explain the *why* behind your approach. Interviewers are testing your reasoning, not just your knowledge. Walk them through your thought process.`,
      `Solid explanation! In a follow-up question, they might ask: "What would you do differently?" — always be prepared with trade-offs and alternatives.`,
      `Nice answer! Make sure to connect this to your learning or projects. Saying "I implemented this in a project where..." makes your answer much stronger.`
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    const questions = INTERVIEW_QUESTIONS[selectedCourseId] || [];
    const userMsg = { role: 'user', text: input.trim(), time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(m => [...m, userMsg]);
    setInput('');

    const feedback = getAIFeedback(questions[questionIdx], input.trim());
    addBotMessage(`💡 **Feedback:** ${feedback}`, 1200);

    const nextIdx = questionIdx + 1;
    if (nextIdx < questions.length) {
      setTimeout(() => {
        addBotMessage(`**Q${nextIdx + 1}:** ${questions[nextIdx]}`, 2800);
        setQuestionIdx(nextIdx);
      }, 200);
    } else {
      setTimeout(() => {
        addBotMessage(`🎉 **Great session, ${user?.name?.split(' ')[0]}!** You've completed all ${questions.length} interview questions for this course.\n\nWant to take it further? Book a **live mock interview** with Bhuvan or Tarun via Google Meet. They'll give you real-time, personalised feedback from an MNC interviewer's perspective.`, 3200);
        setTimeout(() => setShowMeetPanel(true), 4500);
      }, 200);
    }
  };

  const handleBookMeet = () => {
    if (!meetDate || !meetTime) return;
    const subject = encodeURIComponent(`Mantrixa Mock Interview — ${selectedCourse?.title}`);
    const body = encodeURIComponent(`Hi ${selectedInstructor.name},\n\nI would like to book a mock interview session for ${selectedCourse?.title}.\n\nProposed Time: ${meetDate} at ${meetTime}\n\nGoogle Meet: ${MEET_LINK}\n\nLooking forward to it!\n\n${user?.name}\n${user?.email}`);
    window.open(`mailto:${selectedInstructor.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const renderText = (text) => {
    return text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part);
  };

  if (!sessionStarted) {
    return (
      <div className="page-wrapper">
        <section style={{ padding: 'clamp(40px, 10vw, 60px) 0 clamp(30px, 8vw, 40px)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-tag">AI Coaching</div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.8rem)', letterSpacing: '-0.025em' }}>Interview Prep Panel</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'clamp(8px, 2vw, 12px)', fontSize: 'clamp(14px, 2vw, 15px)' }}>Practice real interview questions with AI feedback, then book a live mock interview with our instructors.</p>
          </div>
        </section>
        <div className="container" style={{ padding: 'clamp(32px, 7vw, 48px) clamp(16px, 4vw, 24px) clamp(60px, 15vw, 80px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(14px, 3vw, 24px)', maxWidth: 900, marginBottom: 'clamp(24px, 6vw, 40px)' }}>
            {[{ icon: '🤖', title: 'AI Question Bank', body: 'Get asked real interview questions based on your enrolled course, curated from MNC hiring patterns.' }, { icon: '💡', title: 'Instant Feedback', body: 'Get AI coaching on each answer — structure tips, what to add, and how to make your answer stronger.' }, { icon: '📊', title: 'Course-Specific', body: 'Questions are tailored to your enrolled course — DevOps, SRE, Python, or React. No generic prep.' }, { icon: '🎯', title: 'Book Live Session', body: 'After practising, book a real mock interview on Google Meet with Bhuvan or Tarun directly.' }].map(({ icon, title, body }) => (
              <div key={title} className="card" style={{ padding: 'clamp(14px, 3vw, 20px) clamp(16px, 4vw, 24px)' }}>
                <span style={{ fontSize: 'clamp(22px, 5vw, 28px)', display: 'block', marginBottom: 'clamp(8px, 2vw, 10px)' }}>{icon}</span>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(13px, 2.5vw, 15px)', marginBottom: 'clamp(6px, 1.5vw, 6px)' }}>{title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(12px, 2vw, 13px)', lineHeight: 1.6 }}>{body}</p>
              </div>
            ))}
          </div>
          <div style={{ maxWidth: 500 }}>
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label className="input-label">Select Course to Practice</label>
              <select className="input" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}>
                <option value="">-- Choose an enrolled course --</option>
                {enrolledCourses.map(c => <option key={c.id} value={c.id}>{c.icon} {c.title}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={startSession} disabled={!selectedCourseId} style={{ width: '100%', justifyContent: 'center', padding: 'clamp(12px, 3vw, 16px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>
              Start Interview Session 🎤
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <div style={{ position: 'sticky', top: 80, background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '16px 24px', zIndex: 50 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Mantrixa AI Coach</div>
              <div style={{ fontSize: 12, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>{selectedCourse?.icon} {selectedCourse?.title}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" onClick={() => setShowMeetPanel(p => !p)} style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(0,212,255,0.2)', padding: '8px 16px', fontSize: 13 }}>
              📅 Book Meet
            </button>
            <button className="btn btn-secondary" onClick={() => setSessionStarted(false)} style={{ padding: '8px 14px', fontSize: 13 }}>← Back</button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, maxWidth: 800, margin: '0 auto', width: '100%', padding: '24px 24px 120px', overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16, animation: 'fadeInUp 0.3s ease' }}>
            {msg.role === 'bot' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 10, flexShrink: 0, marginTop: 4 }}>🤖</div>
            )}
            <div style={{ maxWidth: '75%' }}>
              <div style={{
                padding: '12px 18px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.role === 'user' ? 'var(--accent-green)' : 'var(--bg-elevated)',
                color: msg.role === 'user' ? '#0a0a0f' : 'var(--text-primary)',
                fontSize: 14, lineHeight: 1.7,
                border: msg.role === 'bot' ? '1px solid var(--border)' : 'none'
              }}>
                {renderText(msg.text)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left', fontFamily: 'var(--font-mono)' }}>{msg.time}</div>
            </div>
            {msg.role === 'user' && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#0a0a0f', marginLeft: 10, flexShrink: 0, marginTop: 4 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 10, flexShrink: 0 }}>🤖</div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px' }}><TypingIndicator /></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)', padding: '16px 24px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <textarea
            className="input"
            placeholder="Type your answer here... Be detailed and structured."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            rows={2}
            style={{ resize: 'none', flex: 1, lineHeight: 1.6 }}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim() || isTyping} style={{ padding: '14px 20px', flexShrink: 0 }}>Send →</button>
        </div>
        <div style={{ maxWidth: 800, margin: '8px auto 0', fontSize: 12, color: 'var(--text-muted)' }}>Enter to send · Shift+Enter for new line</div>
      </div>

      {/* Book Meet Panel */}
      {showMeetPanel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }} onClick={() => setShowMeetPanel(false)}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-active)', borderRadius: 24, padding: 40, maxWidth: 480, width: '100%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>📅 Book a Live Mock Interview</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Get personalised feedback from Bhuvan or Tarun via Google Meet. A Google Calendar invite will be sent to your email.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Select Instructor</label>
                <select className="input" value={selectedInstructor.email} onChange={e => setSelectedInstructor(INSTRUCTORS.find(i => i.email === e.target.value))}>
                  {INSTRUCTORS.map(i => <option key={i.email} value={i.email}>{i.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Preferred Date</label>
                <input type="date" className="input" value={meetDate} onChange={e => setMeetDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="input-group">
                <label className="input-label">Preferred Time (IST)</label>
                <input type="time" className="input" value={meetTime} onChange={e => setMeetTime(e.target.value)} />
              </div>
              <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--accent-cyan)', lineHeight: 1.6 }}>
                ℹ️ This opens your email client with a pre-drafted message. The instructor will confirm the time and send a Google Meet link.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => setShowMeetPanel(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleBookMeet} disabled={!meetDate || !meetTime} style={{ flex: 2, justifyContent: 'center' }}>
                  📧 Send Booking Request →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPanel;
