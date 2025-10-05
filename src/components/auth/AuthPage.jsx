import React from 'react';
import AuthForm from './AuthForm';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <AuthForm />
    </div>
  );
}

// In your App.jsx routes section
<Routes>
  {/* ... other routes ... */}
  
  {/* Auth Route */}
  <Route path="/login" element={<AuthPage />} />
  <Route path="/signup" element={<AuthPage />} />

  {/* ... rest of your routes ... */}
</Routes>