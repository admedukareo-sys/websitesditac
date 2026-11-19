import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, getCurrentUser, setCurrentUser, getUsers, saveUsers, updateRegistration, Registration } from '@/lib/storage';
import { api, setAuthToken } from '@/lib/api';

interface GoogleJwtPayload {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  register: (name: string, email: string, pass: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = getCurrentUser();
    setUserState(savedUser);
    setLoading(false);
  }, []);

  const loginWithGoogle = async (credential: string): Promise<User> => {
    let email = '';
    let name = '';
    let googleId = '';

    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credential);
      email = (decoded.email || '').trim().toLowerCase();
      name = decoded.name || email.split('@')[0];
      googleId = decoded.sub || '';
    } catch (e) {
      throw new Error('Gagal memverifikasi akun Google.');
    }

    if (!email) {
      throw new Error('Email Google tidak valid.');
    }

    // 1. Coba login/sinkronkan ke remote MySQL DB
    try {
      const res: any = await api.googleAuth(name, email, googleId);
      const remoteUser = res && (res.data || res.user || (res.id ? res : null));
      if (remoteUser && remoteUser.id) {
        const sessionUser: User = {
          id: remoteUser.id,
          name: remoteUser.name || name,
          email: remoteUser.email || email,
          role: remoteUser.role || 'STUDENT'
        };

        // Sinkronkan ke local storage users
        const users = getUsers();
        const existingLocalIdx = users.findIndex(u => u.email.toLowerCase() === email);
        if (existingLocalIdx >= 0) {
          users[existingLocalIdx] = { ...users[existingLocalIdx], ...sessionUser };
        } else {
          users.push(sessionUser);
          updateRegistration(sessionUser.id, { status: 'DRAFT', paymentStatus: 'UNPAID' });
        }
        saveUsers(users);

        setUserState(sessionUser);
        setCurrentUser(sessionUser);
        return sessionUser;
      }
    } catch (err) {
      console.warn('Remote Google Auth error, fallback to local storage:', err);
    }

    // 2. Fallback penyimpanan lokal jika offline
    const users = getUsers();
    let found = users.find((u) => u.email.toLowerCase() === email);

    // Fallback jika admin login dengan akun email admin
    if (!found && (email === 'admin@sdit.sch.id' || email === 'admin')) {
      found = users.find((u) => u.role === 'ADMIN');
    }

    if (!found) {
      const newUser: User = {
        id: Date.now(),
        name,
        email,
        role: 'STUDENT',
      };
      users.push(newUser);
      saveUsers(users);
      updateRegistration(newUser.id, { status: 'DRAFT', paymentStatus: 'UNPAID' });
      found = newUser;
    }

    const sessionUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role
    };

    setUserState(sessionUser);
    setCurrentUser(sessionUser);
    return sessionUser;
  };

  const login = async (email: string, pass: string): Promise<User> => {
    // 1. Try remote MySQL API login
    const remoteUser = await api.login(email, pass);
    if (remoteUser && remoteUser.id) {
      const sessionUser: User = { id: remoteUser.id, name: remoteUser.name, email: remoteUser.email, role: remoteUser.role };
      setUserState(sessionUser);
      setCurrentUser(sessionUser);
      return sessionUser;
    }

    // 2. Local fallback login
    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    let found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    
    // Fallback for admin credentials if email alias used
    if (!found && (cleanEmail === 'admin@sdit.sch.id' || cleanEmail === 'admin')) {
      found = users.find((u) => u.role === 'ADMIN') || {
        id: 1,
        name: 'Administrator SPMB',
        email: 'admin@sdit.sch.id',
        role: 'ADMIN',
        password: 'admin',
      };
    }

    if (!found && (cleanEmail === 'panitia@sdit.sch.id' || cleanEmail === 'panitia')) {
      found = users.find((u) => u.role === 'PANITIA_SPMB') || {
        id: 4,
        name: 'Panitia SPMB SD IT',
        email: 'panitia@sdit.sch.id',
        role: 'PANITIA_SPMB',
        password: 'panitia123',
      };
    }
    
    if (!found) {
      throw new Error('Email tidak terdaftar');
    }
    if (found.password && found.password !== pass) {
      throw new Error('Password salah');
    }

    const sessionUser: User = { id: found.id, name: found.name, email: found.email, role: found.role };
    setUserState(sessionUser);
    setCurrentUser(sessionUser);
    return sessionUser;
  };

  const register = async (name: string, email: string, pass: string): Promise<User> => {
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email sudah terdaftar');
    }

    const newUser: User = {
      id: Date.now(),
      name,
      email,
      password: pass,
      role: 'STUDENT',
    };

    // Save to remote MySQL DB
    const savedRemote = await api.saveUser(newUser);
    if (savedRemote && savedRemote.id) {
      newUser.id = savedRemote.id;
    }

    users.push(newUser);
    saveUsers(users);

    // Initial registration draft
    updateRegistration(newUser.id, { status: 'DRAFT', paymentStatus: 'UNPAID' });

    const sessionUser: User = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    setUserState(sessionUser);
    setCurrentUser(sessionUser);
    return sessionUser;
  };

  const logout = () => {
    setUserState(null);
    setCurrentUser(null);
    setAuthToken(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
