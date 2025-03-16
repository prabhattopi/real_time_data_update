import { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  // components/LoginForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
    return setError('Invalid email format');
  }
  
  if (password.length < 6) {
    return setError('Password must be at least 6 characters');
  }

  try {
    const endpoint = isRegistering ? 'register' : 'login';
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/${endpoint}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Authentication failed');

    localStorage.setItem('token', data.token);
    setUser(data.user);
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Existing user? Login' : 'New user? Register'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;