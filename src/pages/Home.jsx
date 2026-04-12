import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';

const TECH_STATS = [
  { label: 'DevOps Engineers Needed by 2026', value: '500K+', color: 'var(--accent-green)' },
  { label: 'Cloud Market Growth (CAGR)', value: '18.3%', color: 'var(--accent-cyan)' },
  { label: 'AI/ML Jobs Added (2024)', value: '1.2M', color: '#a78bfa' },
  { label: 'Python Developer Avg. Salary', value: '₹18 LPA', color: 'var(--accent-orange)' },
];

const TECH_TRENDS = [
  {
    icon: '🤖',
    title: 'AI is Reshaping Every Stack',
    body: 'From AI-assisted code review in GitHub Copilot to LLM-powered observability in SRE, AI is not replacing engineers — it\'s multiplying their output 10x. Understanding how to work alongside AI tools is now a core skill.',
    tag: 'Artificial Intelligence'
  },
  {
    icon: '☁️',
    title: 'Cloud is the New Default',
    body: 'Over 94% of enterprises use cloud services. AWS, Azure, and GCP are growing at 30%+ YoY. Every team — backend, frontend, data — now needs cloud literacy. Serverless, microservices, and IaC are the baseline.',
    tag: 'Cloud Computing'
  },
  {
    icon: '⚙️',
    title: 'DevOps Becomes Platform Engineering',
    body: 'The DevOps movement has matured into Platform Engineering — building internal developer platforms (IDPs) that let teams ship faster. Kubernetes, Terraform, and GitOps are the building blocks every MNC engineer touches.',
    tag: 'DevOps & SRE'
  },
  {
    icon: '🔐',
    title: 'Security Shifts Left',
    body: 'DevSecOps integrates security at every stage of the pipeline. Container scanning, SAST/DAST, and supply chain security are now default interview topics — not advanced specialisations.',
    tag: 'Security'
  },
  {
    icon: '⚡',
    title: 'Real-Time Everything',
    body: 'Kafka, WebSockets, and event-driven architectures are in every high-growth product. The ability to design and reason about streaming systems is a massive differentiator in senior roles.',
    tag: 'Architecture'
  },
  {
    icon: '📱',
    title: 'React Dominates Frontend',
    body: 'React has over 40% market share in frontend frameworks. With Next.js extending it for full-stack, and React Native for mobile, learning React is arguably the highest-ROI frontend investment for a B.Tech student.',
    tag: 'Frontend'
  },
];

const Typewriter = ({ texts }) => {
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [width, setWidth] = useState('auto');
  const spanRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const current = texts[textIdx];
      if (!deleting && charIdx < current.length) {
        setCharIdx(c => c + 1);
      } else if (deleting && charIdx > 0) {
        setCharIdx(c => c - 1);
      } else if (!deleting && charIdx === current.length) {
        setTimeout(() => setDeleting(true), 1800);
      } else if (deleting && charIdx === 0) {
        setDeleting(false);
        setTextIdx(i => (i + 1) % texts.length);
      }
    }, deleting ? 50 : 80);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts]);

  // Measure the width of the longest text without DOM manipulation
  useEffect(() => {
    if (measureRef.current) {
      // Get the longest text
      const longestText = texts.reduce((a, b) => a.length > b.length ? a : b);
      measureRef.current.innerHTML = longestText;
      
      const measuredWidth = measureRef.current.getBoundingClientRect().width;
      if (measuredWidth > 0) {
        setWidth(measuredWidth);
      }
    }
  }, [texts]);

  return (
    <>
      {/* Hidden measurement element */}
      <span 
        ref={measureRef}
        style={{ 
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          color: 'var(--accent-green)',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          fontFamily: 'inherit',
          letterSpacing: 'inherit',
          whiteSpace: 'nowrap'
        }} 
      />
      
      {/* Actual typewriter display */}
      <span 
        ref={spanRef}
        style={{ 
          color: 'var(--accent-green)',
          display: 'inline-block',
          width: width === 'auto' ? 'auto' : `${width}px`,
          position: 'relative',
          verticalAlign: 'baseline',
          whiteSpace: 'nowrap'
        }}>
        {texts[textIdx].substring(0, charIdx)}
        <span style={{ animation: 'blink 1s step-end infinite', opacity: 0.8 }}>|</span>
      </span>
    </>
  );
};

const Home = () => {
  const { courses } = useCourses();

  return (
    <div className="page-wrapper">
      {/* HERO */}
      <section style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: 'clamp(40px, 10vw, 60px) 0' }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)',
          backgroundSize: 'clamp(40px, 10vw, 60px) clamp(40px, 10vw, 60px)',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          display: 'none' // Hide on mobile to prevent performance issues
        }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '100%', maxWidth: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '5%', width: '90%', maxWidth: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 'clamp(280px, 100%, 800px)' }}>
            <div className="section-tag fade-in-up">Industry educators</div>
            <h1 style={{ fontSize: 'clamp(2rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 'clamp(20px, 5vw, 28px)' }}>
              Learn tech<br />the way<br />
              <Typewriter texts={['MNCs build it.', 'industry uses it.', 'pros ship it.', 'companies hire for.']} />
            </h1>
            <p style={{ fontSize: 'clamp(14px, 3vw, 18px)', color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.7, marginBottom: 'clamp(28px, 6vw, 40px)' }}>
              <strong>Mantrixa</strong> blends 'Mantra'—core knowledge from the Vedas—with a modern tech identity, representing the transformation of fundamental ideas into scalable, intelligent systems. Taught by <strong style={{ color: 'var(--text-primary)' }}>Bhuvan & Tarun</strong>, working engineers at top MNCs.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'clamp(12px, 3vw, 16px)', flexWrap: 'wrap', marginBottom: 'clamp(32px, 8vw, 48px)' }}>
              <Link to="/learning-hub" className="btn btn-primary" style={{ fontSize: 'clamp(14px, 2vw, 16px)', padding: 'clamp(12px, 3vw, 14px) clamp(20px, 4vw, 28px)' }}>
                Explore Courses →
              </Link>
              <Link to="/about" className="btn btn-secondary" style={{ fontSize: 'clamp(14px, 2vw, 16px)', padding: 'clamp(12px, 3vw, 14px) clamp(20px, 4vw, 28px)' }}>
                Meet the Instructors
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'clamp(20px, 5vw, 32px)', flexWrap: 'wrap' }}>
              {[{ n: '600+', l: 'Students Enrolled' }, { n: '4', l: 'Industry Courses' }, { n: '4.9★', l: 'Average Rating' }, { n: '100%', l: 'By Working Engineers' }].map(({ n, l }) => (
                <div key={l}>
                  <div style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-green)' }}>{n}</div>
                  <div style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: 'var(--text-muted)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS TICKER */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: 'clamp(20px, 5vw, 32px) 0', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'clamp(16px, 4vw, 40px)', animation: 'none', padding: 'clamp(16px, 4vw, 24px)' }}>
          {TECH_STATS.map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)', textAlign: 'center' }}>
              <span style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 800, fontFamily: 'var(--font-display)', color }}>{value}</span>
              <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: 'var(--text-secondary)', maxWidth: 100 }}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* WHO WE ARE */}
      <section style={{ padding: 'clamp(60px, 15vw, 100px) 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(32px, 8vw, 60px)', alignItems: 'center' }}>
            <div>
              <div className="section-tag">Who we are</div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.8rem)', marginBottom: 'clamp(16px, 4vw, 24px)', letterSpacing: '-0.02em' }}>
                Engineers who code<br />by day, teach by night
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 'clamp(12px, 3vw, 20px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>
                We are Bhuvan and Tarun — two software engineers working at MNCs with packages that speak for themselves. We have lived through the gap between what colleges teach and what companies actually need.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 'clamp(20px, 5vw, 32px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>
                Mantrixa is our mission to bridge that gap. Every lesson comes from real production systems, actual incidents, and patterns we have seen in world-class engineering teams.
              </p>
              <Link to="/about" className="btn btn-outline">Our Story →</Link>
            </div>
            <div style={{ display: 'grid', gap: 'clamp(12px, 3vw, 16px)' }}>
              {[
                { icon: '🏢', title: 'Real MNC Experience', body: 'Both founders are currently working at top-tier MNCs. Our curriculum reflects what teams are building today, not two years ago.' },
                { icon: '🎯', title: 'Interview-First Approach', body: 'Every module is designed with the hiring bar in mind. You learn to articulate, explain, and demonstrate — not just understand.' },
                { icon: '🔄', title: 'Always Updated', body: 'Course content is continuously updated to reflect the latest in the industry. No stale tutorials from 2019.' },
              ].map(({ icon, title, body }) => (
                <div key={title} className="card" style={{ display: 'flex', gap: 'clamp(12px, 3vw, 16px)', padding: 'clamp(16px, 4vw, 20px)' }}>
                  <span style={{ fontSize: 'clamp(24px, 6vw, 28px)', flexShrink: 0 }}>{icon}</span>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 'clamp(4px, 2vw, 6px)', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>{title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.6 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section style={{ padding: 'clamp(40px, 10vw, 60px) 0 clamp(60px, 15vw, 100px)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(12px, 3vw, 16px)', alignItems: 'flex-end', marginBottom: 'clamp(32px, 8vw, 48px)' }}>
            <div>
              <div className="section-tag">Our courses</div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', letterSpacing: '-0.02em' }}>Courses built for the industry</h2>
            </div>
            <Link to="/learning-hub" className="btn btn-secondary" style={{ justifySelf: 'start' }}>View All →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(16px, 4vw, 24px)' }}>
            {courses.filter(c => c.isActive).slice(0, 4).map(course => (
              <div key={course.id} className="card" style={{ background: 'var(--bg-card)', cursor: 'pointer', position: 'relative', overflow: 'hidden', padding: 'clamp(16px, 4vw, 20px)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${course.color}, transparent)` }} />
                <div style={{ fontSize: 'clamp(28px, 6vw, 36px)', marginBottom: 'clamp(12px, 3vw, 16px)' }}>{course.icon}</div>
                <span className="badge" style={{ marginBottom: 'clamp(8px, 2vw, 12px)', background: `${course.color}15`, color: course.color, border: `1px solid ${course.color}30`, fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{course.category}</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(15px, 3vw, 18px)', marginBottom: 'clamp(6px, 2vw, 8px)', lineHeight: 1.3 }}>{course.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.6, marginBottom: 'clamp(16px, 4vw, 20px)', flexGrow: 1 }}>{course.subtitle}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 800, fontFamily: 'var(--font-display)', color: course.color }}>₹{course.price.toLocaleString()}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'line-through', marginLeft: '8px' }}>₹{course.originalPrice.toLocaleString()}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{course.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH TRENDS */}
      <section style={{ padding: 'clamp(60px, 15vw, 100px) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 10vw, 60px)' }}>
            <div className="section-tag" style={{ justifyContent: 'center' }}>Industry Intelligence</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.6rem)', letterSpacing: '-0.02em', marginBottom: 'clamp(12px, 3vw, 16px)' }}>Why now is the best time to learn this</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7, fontSize: 'clamp(14px, 2vw, 16px)' }}>The tech landscape is shifting fast. Here's what's happening in the industry right now and why it matters for your career.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(16px, 4vw, 24px)' }}>
            {TECH_TRENDS.map(({ icon, title, body, tag }) => (
              <div key={title} className="card" style={{ position: 'relative', padding: 'clamp(16px, 4vw, 20px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'clamp(12px, 3vw, 16px)' }}>
                  <span style={{ fontSize: 'clamp(24px, 6vw, 32px)' }}>{icon}</span>
                  <span className="badge badge-green" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>{tag}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 2.5vw, 17px)', marginBottom: 'clamp(8px, 2vw, 12px)', lineHeight: 1.3 }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(13px, 2vw, 14px)', lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(60px, 15vw, 80px) 0 clamp(60px, 15vw, 100px)', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-active)',
            borderRadius: 24, padding: 'clamp(32px, 8vw, 60px) clamp(24px, 6vw, 40px)', textAlign: 'center',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, var(--accent-green), transparent)' }} />
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.6rem)', letterSpacing: '-0.02em', marginBottom: 'clamp(12px, 3vw, 16px)' }}>Start your journey with Mantrixa today</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto clamp(24px, 6vw, 36px)', lineHeight: 1.7, fontSize: 'clamp(14px, 2vw, 16px)' }}>
              Join 600+ students transforming foundational knowledge into real-world engineering skills — guided by engineers who live and breathe it every day.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(12px, 3vw, 16px)', justifyContent: 'center' }}>
              <Link to="/auth?mode=register" className="btn btn-primary" style={{ fontSize: 'clamp(14px, 2vw, 16px)', padding: 'clamp(12px, 3vw, 14px) clamp(20px, 4vw, 32px)' }}>Get Started — Free Registration</Link>
              <Link to="/learning-hub" className="btn btn-secondary" style={{ fontSize: 'clamp(14px, 2vw, 16px)', padding: 'clamp(12px, 3vw, 14px) clamp(20px, 4vw, 32px)' }}>Browse Courses</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
