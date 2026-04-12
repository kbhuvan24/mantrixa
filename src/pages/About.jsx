import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { useToast } from '../components/Toast';

const FOUNDERS = [
  {
    name: 'Bhuvan',
    role: 'Co-Founder & Instructor',
    company: 'Senior Software Engineer @ MNC',
    location: 'Hyderabad, India',
    bio: 'Bhuvan is a seasoned software engineer with deep expertise in cloud infrastructure, DevOps pipelines, and backend systems. Working at one of India\'s top MNCs, he leads platform reliability and has shipped systems serving millions of users. His passion is translating complex production learnings into understandable curriculum that actually prepares students for the real world.',
    skills: ['DevOps', 'Kubernetes', 'AWS', 'Python', 'System Design', 'CI/CD', 'SRE'],
    color: 'var(--accent-green)',
    icon: '👨‍💻',
    stats: [{ label: 'Years at MNC', value: '5+' }, { label: 'Students Taught', value: '300+' }, { label: 'Rating', value: '4.9 ⭐' }]
  },
  {
    name: 'Tarun',
    role: 'Co-Founder & Instructor',
    company: 'Senior Software Engineer @ MNC',
    location: 'Hyderabad, India',
    bio: 'Tarun is a full-stack engineer and frontend architecture expert at a leading MNC. He has led React application development at scale, built component libraries used by hundreds of developers, and has a knack for explaining complex JavaScript concepts in a way that finally makes sense. He believes college students can reach professional-level skills much faster with the right guidance.',
    skills: ['React.js', 'Next.js', 'TypeScript', 'Node.js', 'Redux', 'Testing', 'Performance'],
    color: 'var(--accent-cyan)',
    icon: '👨‍🔬',
    stats: [{ label: 'Years at MNC', value: '4+' }, { label: 'Students Taught', value: '300+' }, { label: 'Rating', value: '4.8 ⭐' }]
  }
];

const StarRating = ({ value, onChange, readOnly = false }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(star => (
      <span key={star} onClick={() => !readOnly && onChange && onChange(star)} style={{ fontSize: readOnly ? 16 : 22, cursor: readOnly ? 'default' : 'pointer', color: star <= value ? '#ffd700' : 'var(--text-muted)', transition: 'transform 0.1s', display: 'inline-block' }}
        onMouseEnter={e => { if (!readOnly) e.target.style.transform = 'scale(1.2)'; }}
        onMouseLeave={e => { if (!readOnly) e.target.style.transform = 'scale(1)'; }}
      >★</span>
    ))}
  </div>
);

const About = () => {
  const { user } = useAuth();
  const { getReviews, addReview } = useCourses();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, text: '', instructorName: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setReviews(getReviews()); }, [getReviews]);

  const handleSubmitReview = async () => {
    if (!newReview.text.trim()) { toast('Please write a review', 'error'); return; }
    if (!newReview.instructorName) { toast('Please select an instructor', 'error'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    addReview({ ...newReview, studentName: user?.name || 'Anonymous', studentEmail: user?.email });
    setReviews(getReviews());
    setNewReview({ rating: 5, text: '', instructorName: '' });
    toast('Review submitted! Thank you 🙏', 'success');
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section style={{ padding: 'clamp(50px, 15vw, 80px) 0 clamp(40px, 10vw, 60px)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)', backgroundSize: 'clamp(40px, 10vw, 50px) clamp(40px, 10vw, 50px)', pointerEvents: 'none', display: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div className="section-tag" style={{ justifyContent: 'center' }}>The Team</div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 3.5rem)', letterSpacing: '-0.025em', marginBottom: 'clamp(12px, 4vw, 20px)' }}>
            Knowledge as a mantra.<br />Systems that scale.
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', fontSize: 'clamp(14px, 2.5vw, 17px)', lineHeight: 1.7 }}>
            Mantrixa blends 'Mantra'—core knowledge—with a modern tech identity, representing the transformation of fundamental ideas into scalable, intelligent systems. Two MNC engineers. One mission.
          </p>
        </div>
      </section>

      {/* Founders */}
      <section style={{ padding: 'clamp(50px, 15vw, 80px) 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(20px, 5vw, 32px)' }}>
            {FOUNDERS.map((f) => (
              <div key={f.name} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
                {/* Avatar */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 20, background: `linear-gradient(135deg, ${f.color}22, ${f.color}44)`, border: `2px solid ${f.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>{f.name}</h2>
                    <div style={{ fontSize: 14, fontWeight: 600, color: f.color, marginBottom: 4 }}>{f.role}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🏢 {f.company}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>📍 {f.location}</div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>{f.bio}</p>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                  {f.stats.map(({ label, value }) => (
                    <div key={label} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', color: f.color }}>{value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>Expertise</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {f.skills.map(skill => (
                      <span key={skill} style={{ padding: '4px 10px', background: `${f.color}10`, color: f.color, border: `1px solid ${f.color}25`, borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '60px 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>Our Mission</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', letterSpacing: '-0.02em', marginBottom: 20 }}>The gap between college and industry is real. Mantrixa is closing it.</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 16 }}>
              The name <strong style={{ color: 'var(--text-primary)' }}>Mantrixa</strong> is derived from 'Mantra'—a core principle and fundamental unit of knowledge from the Vedas—combined with a modern '-ixa' suffix that reflects systems and scalability. It represents transforming foundational knowledge into intelligent, scalable solutions, much like how today's AI and cloud technologies are reshaping the world. At its core, Mantrixa stands for structured thinking, continuous learning, and building systems that turn knowledge into real-world impact. Every day at our MNC jobs, we interview candidates. We see brilliant students who understand theory but have never touched Docker, don't know how CI/CD works, and have no idea what an SLO is. Mantrixa exists to give B.Tech and engineering students the exact skills that the industry expects and colleges don't teach.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="section-tag">Student Voices</div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', letterSpacing: '-0.02em' }}>What our students say</h2>
            </div>
            {reviews.length > 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 40, fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}>{avgRating}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Average from {reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
              </div>
            )}
          </div>

          {/* Submit Review */}
          {user && user.role !== 'admin' && (
            <div className="card" style={{ marginBottom: 40, border: '1px solid var(--border-active)', maxWidth: 600 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20 }}>Leave a Review</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Rating</label>
                  <StarRating value={newReview.rating} onChange={v => setNewReview(r => ({ ...r, rating: v }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Instructor</label>
                  <select className="input" value={newReview.instructorName} onChange={e => setNewReview(r => ({ ...r, instructorName: e.target.value }))}>
                    <option value="">Select an instructor</option>
                    <option value="Bhuvan">Bhuvan</option>
                    <option value="Tarun">Tarun</option>
                    <option value="Both">Both Instructors</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Your Review</label>
                  <textarea className="input" placeholder="Share your experience with Mantrixa..." value={newReview.text} onChange={e => setNewReview(r => ({ ...r, text: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
                </div>
                <button className="btn btn-primary" onClick={handleSubmitReview} disabled={submitting} style={{ alignSelf: 'flex-start', padding: '11px 24px' }}>
                  {submitting ? <><div className="spinner" /> Submitting...</> : 'Submit Review →'}
                </button>
              </div>
            </div>
          )}

          {!user && (
            <div className="card" style={{ marginBottom: 40, textAlign: 'center', padding: 32, maxWidth: 400 }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Log in to leave a review</p>
              <a href="/auth?mode=login" className="btn btn-secondary">Log in →</a>
            </div>
          )}

          {/* Reviews Grid */}
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {reviews.map((r) => (
                <div key={r.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0a0a0f', fontSize: 14 }}>
                        {r.studentName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.studentName}</div>
                        {r.instructorName && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Review for {r.instructorName}</div>}
                      </div>
                    </div>
                    <StarRating value={r.rating} readOnly />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{r.text}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, fontFamily: 'var(--font-mono)' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default About;
