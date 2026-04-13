import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import PaymentModal from '../components/PaymentModal';

const CourseDetailModal = ({ course, onClose, onBuy }) => {
  const { user } = useAuth();
  const enrolled = user?.enrolledCourses?.includes(course.id);
  const pending = user?.pendingPayments?.some(p => p.courseId === course.id && p.status === 'pending');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24, padding: 40, maxWidth: 680, width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-secondary)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 16 }}>✕</button>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${course.color}, transparent)`, borderRadius: '24px 24px 0 0' }} />
        <div style={{ fontSize: 48, marginBottom: 16 }}>{course.icon}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <span className="badge" style={{ background: `${course.color}15`, color: course.color, border: `1px solid ${course.color}30` }}>{course.category}</span>
          <span className="badge badge-cyan">{course.level}</span>
          <span className="badge badge-purple">{course.duration}</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, marginBottom: 8, lineHeight: 1.2 }}>{course.title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.7 }}>{course.description}</p>
        <div className="divider" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16 }}>What you'll learn</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {course.outcomes.map(o => (
            <div key={o} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 14, color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--accent-green)', fontWeight: 700, flexShrink: 0 }}>✓</span>{o}
            </div>
          ))}
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 16 }}>Curriculum</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {course.curriculum.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', minWidth: 50 }}>Week {item.week}</span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.topic}</span>
              {item.notes && <span style={{ fontSize: 11, color: 'var(--accent-cyan)', marginLeft: 'auto', flexShrink: 0 }}>📝 Notes</span>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)', color: course.color }}>₹{course.price.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 10 }}>₹{course.originalPrice.toLocaleString()}</span>
            <div style={{ fontSize: 13, color: 'var(--accent-green)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              {Math.round((1 - course.price / course.originalPrice) * 100)}% off · {course.enrolled} enrolled
            </div>
          </div>
          {enrolled ? (
            <Link to="/dashboard" className="btn btn-outline">Go to Dashboard →</Link>
          ) : pending ? (
            <div style={{ textAlign: 'right' }}>
              <div className="badge badge-orange" style={{ marginBottom: 6, display: 'inline-flex' }}>⏳ Payment Pending Verification</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Access activates after admin approval</div>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => onBuy(course)}>
              Buy Now — ₹{course.price.toLocaleString()} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const LearningHub = () => {
  const { courses } = useCourses();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [paymentCourse, setPaymentCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...new Set(courses.map(c => c.category))];
  const filtered = courses.filter(c => {
    if (!c.isActive) return false;
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !c.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    return true;
  });

  const handleBuy = (course) => {
    if (!user) {
      toast('Please log in to enroll', 'info');
      navigate('/auth?mode=login');
      return;
    }
    if (user.role === 'admin' || user.role === 'coadmin') {
      toast('Admin accounts cannot enroll in courses', 'error');
      return;
    }
    setSelectedCourse(null);
    setPaymentCourse(course);
  };

  const handlePaymentSuccess = () => {
    toast('Payment submitted! Access will be activated after verification.', 'success');
    setPaymentCourse(null);
  };

  return (
    <div className="page-wrapper">
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onBuy={handleBuy}
        />
      )}
      {paymentCourse && (
        <PaymentModal
          course={paymentCourse}
          onClose={() => setPaymentCourse(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Header */}
      <section style={{ padding: 'clamp(40px, 10vw, 60px) 0 clamp(30px, 8vw, 40px)', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-tag">Our Learning Hub</div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4.5vw, 3rem)', letterSpacing: '-0.025em', marginBottom: 'clamp(12px, 3vw, 16px)' }}>
            Industry-grade courses,<br />taught by people building it
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.7, marginBottom: 'clamp(20px, 5vw, 32px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>
            Each course is built from real MNC experience. You learn patterns, tools, and thinking that will actually get you hired.
          </p>
          <input
            className="input"
            placeholder="🔍 Search courses, topics, or technologies..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ maxWidth: 480 }}
          />
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: '24px 0', borderBottom: '1px solid var(--border)', position: 'sticky', top: 80, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginRight: 8 }}>Filter:</span>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
              padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: selectedCategory === cat ? 'var(--accent-green)' : 'var(--bg-elevated)',
              color: selectedCategory === cat ? '#0a0a0f' : 'var(--text-secondary)'
            }}>{cat}</button>
          ))}
        </div>
      </section>

      {/* Courses Grid */}
      <section style={{ padding: 'clamp(40px, 10vw, 48px) 0 clamp(60px, 15vw, 80px)' }}>
        <div className="container">
          <div style={{ marginBottom: 24, color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-mono)' }}>
            {filtered.length} course{filtered.length !== 1 ? 's' : ''} found
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'clamp(16px, 4vw, 24px)' }}>
            {filtered.map(course => {
              const enrolled = user?.enrolledCourses?.includes(course.id);
              const pending = user?.pendingPayments?.some(p => p.courseId === course.id && p.status === 'pending');
              return (
                <div key={course.id} className="card" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 'clamp(16px, 4vw, 20px)' }} onClick={() => setSelectedCourse(course)}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${course.color}, transparent)` }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'clamp(12px, 3vw, 20px)' }}>
                    <span style={{ fontSize: 'clamp(24px, 6vw, 40px)' }}>{course.icon}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <span className="badge" style={{ background: `${course.color}15`, color: course.color, border: `1px solid ${course.color}30`, fontSize: 'clamp(10px, 2vw, 11px)' }}>{course.category}</span>
                      {enrolled && <span className="badge badge-green" style={{ fontSize: 11 }}>✓ Enrolled</span>}
                      {pending && !enrolled && <span className="badge badge-orange" style={{ fontSize: 11 }}>⏳ Pending</span>}
                    </div>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(15px, 3vw, 18px)', marginBottom: 'clamp(6px, 1.5vw, 8px)', lineHeight: 1.25 }}>{course.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.6, marginBottom: 'clamp(12px, 3vw, 20px)', flex: 1 }}>{course.subtitle}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'clamp(12px, 3vw, 20px)' }}>
                    {(course.tags || []).slice(0, 3).map(tag => (
                      <span key={tag} style={{ padding: '3px 8px', background: 'var(--bg-elevated)', borderRadius: 4, fontSize: 'clamp(10px, 1.5vw, 11px)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'clamp(12px, 3vw, 16px)', borderTop: '1px solid var(--border)', gap: 8, flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 800, fontFamily: 'var(--font-display)', color: course.color }}>₹{course.price.toLocaleString()}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12, textDecoration: 'line-through', marginLeft: 6 }}>₹{course.originalPrice.toLocaleString()}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{course.rating}⭐ · {course.duration}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{course.enrolled} enrolled</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p>No courses found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LearningHub;
