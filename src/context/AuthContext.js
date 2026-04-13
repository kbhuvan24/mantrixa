import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ADMIN_CREDENTIALS, COADMIN_CREDENTIALS, EMAILJS_CONFIG } from '../data/initialData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

// ── EmailJS helper (graceful no-op if not configured) ──────────────────────
const sendRegistrationEmail = async ({ name, email }) => {
  const { serviceId, templateId, publicKey } = EMAILJS_CONFIG;
  if (!serviceId || !templateId || !publicKey) {
    console.info('[Mantrixa] EmailJS not configured — skipping registration email.');
    return;
  }
  try {
    // Dynamically load EmailJS so it doesn't break the app if CDN is unavailable
    if (!window.emailjs) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
      window.emailjs.init(publicKey);
    }
    await window.emailjs.send(serviceId, templateId, {
      to_name: name,
      to_email: email,
      from_name: 'Mantrixa Team',
      reply_to: 'hello@mantrixa.dev',
      message: `Welcome to Mantrixa, ${name}! Your account has been successfully created. Explore our courses at mantrixa.dev and start your industry-grade learning journey today.`,
      subject: 'Welcome to Mantrixa — Account Created Successfully 🚀',
    });
    console.info('[Mantrixa] Registration email sent to', email);
  } catch (err) {
    console.warn('[Mantrixa] Could not send registration email:', err);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('sf_user');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    setLoading(false);
  }, []);

  const getUsers = useCallback(() => {
    try { return JSON.parse(localStorage.getItem('sf_users') || '[]'); } catch { return []; }
  }, []);

  const saveUsers = useCallback((users) => {
    localStorage.setItem('sf_users', JSON.stringify(users));
  }, []);

  const register = async (name, email, password) => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Block admin / co-admin emails
    if (
      trimmedEmail === ADMIN_CREDENTIALS.email.toLowerCase() ||
      trimmedEmail === COADMIN_CREDENTIALS.email.toLowerCase()
    ) {
      return { error: 'This email address is reserved.' };
    }

    const users = getUsers();

    // Unique email check
    if (users.find(u => u.email.toLowerCase() === trimmedEmail)) {
      return { error: 'An account with this email already exists. Please log in.' };
    }

    // Unique username (case-insensitive)
    if (users.find(u => u.name.trim().toLowerCase() === trimmedName.toLowerCase())) {
      return { error: 'This name is already taken. Please choose a different display name.' };
    }

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: trimmedName,
      email: trimmedEmail,
      password,
      role: 'student',
      enrolledCourses: [],
      paidCourses: [],       // tracks paid (verified) enrollments
      pendingPayments: [],   // { courseId, amount, upiRef, createdAt }
      examResults: [],
      createdAt: new Date().toISOString()
    };

    saveUsers([...users, newUser]);

    const { password: _, ...safeUser } = newUser;
    localStorage.setItem('sf_user', JSON.stringify(safeUser));
    setUser(safeUser);

    // Send welcome email (non-blocking)
    sendRegistrationEmail({ name: trimmedName, email: trimmedEmail });

    return { success: true };
  };

  const login = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Admin check
    if (
      trimmedEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const adminUser = {
        id: 'admin',
        name: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        role: 'admin'
      };
      localStorage.setItem('sf_user', JSON.stringify(adminUser));
      setUser(adminUser);
      return { success: true };
    }

    // Co-admin check
    if (
      trimmedEmail === COADMIN_CREDENTIALS.email.toLowerCase() &&
      password === COADMIN_CREDENTIALS.password
    ) {
      const coadminUser = {
        id: 'coadmin',
        name: COADMIN_CREDENTIALS.name,
        email: COADMIN_CREDENTIALS.email,
        role: 'coadmin'
      };
      localStorage.setItem('sf_user', JSON.stringify(coadminUser));
      setUser(coadminUser);
      return { success: true };
    }

    const users = getUsers();
    const found = users.find(
      u => u.email.toLowerCase() === trimmedEmail && u.password === password
    );
    if (!found) return { error: 'Invalid email or password.' };

    const { password: _, ...safeUser } = found;
    localStorage.setItem('sf_user', JSON.stringify(safeUser));
    setUser(safeUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('sf_user');
    setUser(null);
  };

  // ── Course enrollment (called AFTER payment confirmation) ──────────────
  const enrollCourse = (courseId) => {
    if (!user || isPrivileged) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;

    if (!users[idx].enrolledCourses.includes(courseId)) {
      users[idx].enrolledCourses.push(courseId);
    }
    if (!users[idx].paidCourses) users[idx].paidCourses = [];
    if (!users[idx].paidCourses.includes(courseId)) {
      users[idx].paidCourses.push(courseId);
    }

    saveUsers(users);
    const updatedUser = {
      ...user,
      enrolledCourses: users[idx].enrolledCourses,
      paidCourses: users[idx].paidCourses,
    };
    localStorage.setItem('sf_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // ── Record a pending payment (before admin verification) ───────────────
  const recordPendingPayment = (courseId, amount, upiRef) => {
    if (!user || isPrivileged) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;

    if (!users[idx].pendingPayments) users[idx].pendingPayments = [];
    // Avoid duplicates
    const alreadyPending = users[idx].pendingPayments.some(p => p.courseId === courseId && p.status === 'pending');
    if (alreadyPending) return;

    users[idx].pendingPayments.push({
      courseId,
      amount,
      upiRef: upiRef || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    saveUsers(users);
    const updatedUser = { ...user, pendingPayments: users[idx].pendingPayments };
    localStorage.setItem('sf_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // ── Admin: approve a payment and enroll the student ───────────────────
  const approvePayment = (studentId, courseId) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === studentId);
    if (idx === -1) return false;

    if (!users[idx].enrolledCourses) users[idx].enrolledCourses = [];
    if (!users[idx].paidCourses) users[idx].paidCourses = [];

    if (!users[idx].enrolledCourses.includes(courseId)) {
      users[idx].enrolledCourses.push(courseId);
    }
    if (!users[idx].paidCourses.includes(courseId)) {
      users[idx].paidCourses.push(courseId);
    }
    if (users[idx].pendingPayments) {
      users[idx].pendingPayments = users[idx].pendingPayments.map(p =>
        p.courseId === courseId ? { ...p, status: 'approved', approvedAt: new Date().toISOString() } : p
      );
    }
    saveUsers(users);
    return true;
  };

  // ── Admin: reject a payment ────────────────────────────────────────────
  const rejectPayment = (studentId, courseId) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === studentId);
    if (idx === -1) return false;
    if (users[idx].pendingPayments) {
      users[idx].pendingPayments = users[idx].pendingPayments.map(p =>
        p.courseId === courseId && p.status === 'pending'
          ? { ...p, status: 'rejected', rejectedAt: new Date().toISOString() }
          : p
      );
    }
    saveUsers(users);
    return true;
  };

  const saveExamResult = (result) => {
    if (!user) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    users[idx].examResults = [...(users[idx].examResults || []), result];
    saveUsers(users);
    const updatedUser = { ...user, examResults: users[idx].examResults };
    localStorage.setItem('sf_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshUser = () => {
    if (!user || isPrivileged) return;
    const users = getUsers();
    const found = users.find(u => u.id === user.id);
    if (found) {
      const { password: _, ...safeUser } = found;
      localStorage.setItem('sf_user', JSON.stringify(safeUser));
      setUser(safeUser);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isCoadmin = user?.role === 'coadmin';
  const isPrivileged = isAdmin || isCoadmin; // admin OR co-admin
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin,
      isCoadmin,
      isPrivileged,
      isStudent,
      register,
      login,
      logout,
      enrollCourse,
      recordPendingPayment,
      approvePayment,
      rejectPayment,
      saveExamResult,
      refreshUser,
      getUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
