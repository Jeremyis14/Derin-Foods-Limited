import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// In-memory user storage
const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user'
  }
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check for existing session on load
  useEffect(() => {
    console.log('AuthProvider - Checking for existing session...');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log('AuthProvider - Found stored user:', JSON.parse(storedUser));
      setUser(JSON.parse(storedUser));
    } else {
      console.log('AuthProvider - No stored user found');
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    console.log('AuthContext - Login attempt with:', { email });
    try {
      setError(null);
      setLoading(true);
      
      // Find user by email and password
      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );

      if (!foundUser) {
        console.log('AuthContext - Login failed: Invalid credentials');
        throw new Error('Invalid email or password');
      }

      // Try to authenticate against backend to get a real JWT
      let token = null;
      try {
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000/api';
        const res = await fetch(`${base}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) {
          const data = await res.json();
          token = data.token;
        }
      } catch (e) {
        console.warn('Backend login not available, falling back to dev token');
      }

      // Set user in state and localStorage
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        token: token || localStorage.getItem('token') || 'dev-token'
      };

      console.log('AuthContext - Login successful, setting user:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      // Ensure token is set for API requests
      localStorage.setItem('token', userData.token);
      
      // Set admin flag in sessionStorage if admin
      if (foundUser.role === 'admin') {
        console.log('AuthContext - Setting admin flag in sessionStorage');
        sessionStorage.setItem('admin:auth', '1');
      }

      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);

      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }
      const derivedName = name && name.trim() ? name.trim() : (email.split('@')[0] || 'User');

      // Try backend registration first
      let userData = null;
      try {
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'http://localhost:5000/api';
        const res = await fetch(`${base}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: derivedName, email, password, role: 'user' })
        });
        if (res.ok) {
          const data = await res.json();
          const token = data.token;
          userData = {
            id: data.user?._id || data.user?.id || Date.now(),
            name: data.user?.name || derivedName,
            email: data.user?.email || email,
            role: data.user?.role || 'user',
            token
          };
        }
      } catch (_) {
        // Ignore network errors and fallback to local
      }

      // Fallback to local mock if backend unavailable
      if (!userData) {
        const newUser = { id: Date.now(), name: derivedName, email, password, role: 'user' };
        users.push(newUser);
        userData = { id: newUser.id, name: derivedName, email, role: 'user', token: localStorage.getItem('token') || 'dev-token' };
      }

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.token) localStorage.setItem('token', userData.token);

      return { success: true, user: userData };
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    console.log('AuthContext - Logging out user');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('admin:auth');
    setUser(null);
    console.log('AuthContext - User logged out, navigating to home');
    navigate('/');
  };

  // Check if user is admin
  const isAdminFunc = () => {
    return user?.role === 'admin';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider 
      value={{
        // primary state
        user,
        currentUser: user,
        loading,
        error,
        // auth actions
        login,
        register,
        logout,
        // helpers
        isAuthenticated,
        isAdmin: isAdminFunc(),
        isAdminFunc
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
