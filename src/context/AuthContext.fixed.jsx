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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      // Find user by email and password
      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Set user in state and localStorage
      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set admin flag in sessionStorage if admin
      if (foundUser.role === 'admin') {
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

  // Register function (simplified for demo)
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      // Check if user already exists
      const userExists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (userExists) {
        throw new Error('User already exists');
      }

      // Create new user
      const newUser = {
        id: String(users.length + 1),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'user' // Default role
      };

      users.push(newUser);
      
      // Log in the new user
      return login(userData.email, userData.password);
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
    localStorage.removeItem('user');
    sessionStorage.removeItem('admin:auth');
    setUser(null);
    navigate('/');
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAdmin,
        isAuthenticated
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
