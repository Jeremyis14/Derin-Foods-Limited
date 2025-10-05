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
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check for existing session on load
  useEffect(() => {
    console.log('AuthContext - Checking for existing session...');
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken && storedToken !== 'dev-token') {
      try {
        const userData = JSON.parse(storedUser);
        console.log('AuthContext - Found stored user:', userData);

        // Verify token with backend
        const verifyToken = async () => {
          try {
            const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'https://derin-foods-limited.onrender.com/api';
            const res = await fetch(`${base}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json'
              }
            });

            if (res.ok) {
              const data = await res.json();
              if (data.success && data.user) {
                console.log('AuthContext - Token verified successfully');
                setUser({ ...userData, token: storedToken });
              } else {
                throw new Error('Token verification failed');
              }
            } else {
              throw new Error('Token verification failed');
            }
          } catch (error) {
            console.warn('AuthContext - Token verification error:', error.message);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            sessionStorage.removeItem('admin:auth');
            setUser(null);
          }
        };

        verifyToken();
      } catch (error) {
        console.error('AuthContext - Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('admin:auth');
        setUser(null);
      }
    } else {
      console.log('AuthContext - No valid stored session found');
      if (storedToken === 'dev-token') {
        console.log('AuthContext - Removing invalid dev-token');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('admin:auth');
      }
      setUser(null);
    }

    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      // Find user by email and password (local mock data)
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
      let backendUser = null;

      try {
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'https://derin-foods-limited.onrender.com/api';
        console.log('AuthContext - Attempting backend login to:', `${base}/auth/login`);

        const res = await fetch(`${base}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (res.ok) {
          const data = await res.json();
          token = data.token;
          backendUser = data.user;
          console.log('AuthContext - Backend login successful');
        } else {
          console.warn('AuthContext - Backend login failed:', res.status, res.statusText);
          throw new Error('Backend authentication failed');
        }
      } catch (e) {
        console.warn('AuthContext - Backend login not available, cannot authenticate:', e.message);
        throw new Error('Authentication service unavailable. Please try again later.');
      }

      // If we reach here, backend login was successful
      const userData = {
        id: backendUser?.id || foundUser.id,
        name: backendUser?.name || foundUser.name,
        email: backendUser?.email || foundUser.email,
        role: backendUser?.role || foundUser.role,
        token: token
      };

      console.log('AuthContext - Login successful, setting user:', userData);
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);

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
        const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || 'https://derin-foods-limited.onrender.com/api';
        console.log('AuthContext - Attempting backend registration to:', `${base}/auth/register`);

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
          console.log('AuthContext - Backend registration successful');
        } else {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Registration failed');
        }
      } catch (e) {
        console.warn('AuthContext - Backend registration not available:', e.message);
        throw new Error('Registration service unavailable. Please try again later.');
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
