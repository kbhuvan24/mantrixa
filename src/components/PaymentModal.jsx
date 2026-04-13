import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { PAYMENT_CONFIG } from '../data/initialData';

// Generate a UPI payment link (works on mobile UPI apps)
const buildUpiLink = (amount, courseName, txnRef) => {
  const params = new URLSearchParams({
    pa: PAYMENT_CONFIG.upiId,
    pn: PAYMENT_CONFIG.upiName,
    am: amount,
    cu: 'INR',
    tn: `Mantrixa: ${courseName}`.slice(0, 50),
    tr: txnRef,
  });
  return `upi://pay?${params.toString()}`;
};

// QR code via a free public API (no key needed)
const buildQrUrl = (upiLink) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;

const PaymentModal = ({ course, onClose, onSuccess }) => {
  const { recordPendingPayment, enrollCourse, user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState('info'); // info | pay | confirm | done
  const [upiRef, setUpiRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [txnRef] = useState(`MX${Date.now().toString().slice(-8)}`);

  const upiLink = buildUpiLink(course.price, course.title, txnRef);
  const qrUrl = buildQrUrl(upiLink);

  // Auto-enroll if already paid (admin override scenario)
  const alreadyPaid = user?.paidCourses?.includes(course.id);
  useEffect(() => {
    if (alreadyPaid) { onSuccess?.(); onClose?.(); }
  }, [alreadyPaid, onSuccess, onClose]);

  const handlePaymentDone = async () => {
    if (!upiRef.trim()) {
      toast('Please enter the UPI Transaction ID / Reference Number', 'error');
      return;
    }
    if (upiRef.trim().length < 6) {
      toast('Reference number seems too short. Please check and re-enter.', 'error');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    // Record pending payment — admin will verify and enroll
    recordPendingPayment(course.id, course.price, upiRef.trim());
    setStep('done');
    setLoading(false);
  };

  const steps = ['info', 'pay', 'confirm', 'done'];
  const stepIdx = steps.indexOf(step);

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.88)',
        zIndex: 3000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, backdropFilter: 'blur(12px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${course.color}44`,
          borderRadius: 24,
          padding: 'clamp(24px, 5vw, 40px)',
          maxWidth: 480, width: '100%',
          position: 'relative', overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Color bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${course.color}, transparent)` }} />

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {['Course Info', 'Payment', 'Confirm', 'Done'].map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i <= stepIdx ? course.color : 'var(--bg-elevated)',
                border: `1px solid ${i <= stepIdx ? course.color : 'var(--border)'}`,
                transition: 'all 0.3s'
              }} />
              {i < 3 && <div style={{ width: 20, height: 1, background: i < stepIdx ? course.color : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        {/* ── STEP: Info ── */}
        {step === 'info' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 40 }}>{course.icon}</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, margin: '12px 0 4px' }}>{course.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{course.subtitle}</p>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
              {[
                { label: 'Course Price', value: `₹${course.price.toLocaleString()}`, highlight: true },
                { label: 'Original Price', value: `₹${course.originalPrice.toLocaleString()}`, strike: true },
                { label: 'You Save', value: `₹${(course.originalPrice - course.price).toLocaleString()} (${Math.round((1 - course.price / course.originalPrice) * 100)}% off)`, green: true },
                { label: 'Duration', value: course.duration },
                { label: 'Level', value: course.level },
              ].map(({ label, value, highlight, strike, green }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{
                    fontSize: 14, fontWeight: highlight ? 800 : 600,
                    fontFamily: highlight ? 'var(--font-display)' : 'inherit',
                    color: highlight ? course.color : green ? 'var(--accent-green)' : 'var(--text-primary)',
                    textDecoration: strike ? 'line-through' : 'none',
                  }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setStep('pay')} style={{ flex: 2, justifyContent: 'center' }}>
                Proceed to Pay ₹{course.price.toLocaleString()} →
              </button>
            </div>
          </>
        )}

        {/* ── STEP: Pay ── */}
        {step === 'pay' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 4, textAlign: 'center' }}>
              Pay via UPI
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
              Scan the QR code or click the button to open your UPI app
            </p>

            {/* QR Code */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 12, marginBottom: 10 }}>
                <img src={qrUrl} alt="UPI QR Code" width={180} height={180} style={{ display: 'block' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                UPI ID: <span style={{ color: 'var(--accent-green)' }}>{PAYMENT_CONFIG.upiId}</span>
              </div>
            </div>

            {/* Amount pill */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{
                display: 'inline-block', padding: '8px 20px',
                background: `${course.color}15`, border: `1px solid ${course.color}40`,
                borderRadius: 999, fontFamily: 'var(--font-display)',
                fontSize: 20, fontWeight: 800, color: course.color
              }}>₹{course.price.toLocaleString()}</span>
            </div>

            {/* Ref ID */}
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 10, padding: '10px 16px',
              marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Transaction Ref</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-cyan)' }}>{txnRef}</span>
            </div>

            {/* Open UPI App button (mobile) */}
            <a href={upiLink} style={{ display: 'block', marginBottom: 12 }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                📱 Open UPI App
              </button>
            </a>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep('info')} style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
              <button className="btn btn-outline" onClick={() => setStep('confirm')} style={{ flex: 2, justifyContent: 'center' }}>
                I've Paid → Confirm
              </button>
            </div>
          </>
        )}

        {/* ── STEP: Confirm ── */}
        {step === 'confirm' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8, textAlign: 'center' }}>
              Confirm Your Payment
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
              Enter the UPI Transaction ID from your payment app. Your enrollment will be activated after admin verification (within a few hours).
            </p>

            <div className="input-group" style={{ marginBottom: 16 }}>
              <label className="input-label">UPI Transaction ID / Reference Number</label>
              <input
                className="input"
                placeholder="e.g. 412345678901"
                value={upiRef}
                onChange={e => setUpiRef(e.target.value)}
                autoFocus
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Find this in your UPI app under payment history
              </span>
            </div>

            <div style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--accent-cyan)', lineHeight: 1.6 }}>
              ℹ️ Our team will verify your payment and activate your course access within a few hours. You'll be notified once approved.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setStep('pay')} style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
              <button className="btn btn-primary" onClick={handlePaymentDone} disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                {loading ? <><div className="spinner" /> Submitting...</> : 'Submit for Verification →'}
              </button>
            </div>
          </>
        )}

        {/* ── STEP: Done ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8, color: 'var(--accent-green)' }}>
              Payment Submitted!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Your payment reference <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{upiRef}</strong> has been submitted for verification.
              <br /><br />
              Your course will be activated within a few hours after our team verifies the payment.
            </p>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 13 }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Course</div>
              <div style={{ fontWeight: 700 }}>{course.icon} {course.title}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: 8, marginBottom: 4 }}>Amount Paid</div>
              <div style={{ fontWeight: 700, color: course.color }}>₹{course.price.toLocaleString()}</div>
            </div>
            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
              Done →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
