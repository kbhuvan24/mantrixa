import React, { createContext, useContext, useState, useEffect } from 'react';
import { ADMIN_CREDENTIALS } from '../data/initialData';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
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

  const getUsers = () => {
    try { return JSON.parse(localStorage.getItem('sf_users') || '[]'); } catch { return []; }
  };

  const saveUsers = (users) => localStorage.setItem('sf_users', JSON.stringify(users));

  const register = (name, email, password) => {
    if (email === ADMIN_CREDENTIALS.email) return { error: 'Email already in use.' };
    const users = getUsers();
    if (users.find(u => u.email === email)) return { error: 'Email already registered.' };
    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      role: 'student',
      enrolledCourses: [],
      examResults: [],
      createdAt: new Date().toISOString()
    };
    saveUsers([...users, newUser]);
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem('sf_user', JSON.stringify(safeUser));
    setUser(safeUser);
    return { success: true };
  };

  const login = (email, password) => {
    // Admin check
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const adminUser = { id: 'admin', name: 'Admin', email, role: 'admin' };
      localStorage.setItem('sf_user', JSON.stringify(adminUser));
      setUser(adminUser);
      return { success: true };
    }
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
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

  const enrollCourse = (courseId) => {
    if (!user || user.role === 'admin') return;
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return;
    if (!users[idx].enrolledCourses.includes(courseId)) {
      users[idx].enrolledCourses.push(courseId);
      saveUsers(users);
      const updatedUser = { ...user, enrolledCourses: users[idx].enrolledCourses };
      localStorage.setItem('sf_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
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
    if (!user || user.role === 'admin') return;
    const users = getUsers();
    const found = users.find(u => u.id === user.id);
    if (found) {
      const { password: _, ...safeUser } = found;
      localStorage.setItem('sf_user', JSON.stringify(safeUser));
      setUser(safeUser);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isStudent, register, login, logout, enrollCourse, saveExamResult, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
