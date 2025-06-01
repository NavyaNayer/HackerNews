import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [modal, setModal] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>(
    { open: false, message: '', type: 'success' }
  );
  const [users, setUsers] = useState<{ username: string; password: string }[]>(() => {
    // Load users from localStorage or default to demo user
    const saved = localStorage.getItem('users');
    if (saved) return JSON.parse(saved);
    return [{ username: 'user', password: 'password' }];
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup) {
      if (!form.username || !form.password || !form.confirmPassword) {
        setError('All fields are required.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      // Check if user already exists
      if (users.some((u) => u.username === form.username)) {
        setError('Username already exists.');
        return;
      }
      // Save new user
      const newUsers = [...users, { username: form.username, password: form.password }];
      setUsers(newUsers);
      localStorage.setItem('users', JSON.stringify(newUsers));
      setModal({ open: true, message: 'Signup successful! You can now log in.', type: 'success' });
      setIsSignup(false);
      setForm({ username: '', password: '', confirmPassword: '' });
    } else {
      if (!form.username || !form.password) {
        setError('Username and password are required.');
        return;
      }
      // Check credentials
      const found = users.find(
        (u) => u.username === form.username && u.password === form.password
      );
      if (found) {
        setModal({ open: true, message: 'Login successful!', type: 'success' });
        setTimeout(() => {
          setModal({ open: false, message: '', type: 'success' });
          navigate('/');
        }, 1200);
      } else {
        setModal({ open: true, message: 'Incorrect username or password.', type: 'error' });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh]"
    >
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30`}
          >
            <div
              className={`rounded-lg shadow-lg px-8 py-6 max-w-xs w-full text-center
              ${
                modal.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div
                className={`mb-2 text-2xl ${
                  modal.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {modal.type === 'success' ? '✔️' : '❌'}
              </div>
              <div
                className={`mb-2 font-semibold ${
                  modal.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {modal.message}
              </div>
              <button
                className={`mt-2 px-4 py-1 rounded bg-primary text-white hover:bg-primary-dark transition-colors`}
                onClick={() => setModal({ ...modal, open: false })}
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="card max-w-md w-full p-8">
        <h1 className="text-2xl font-bold font-mono mb-6 text-center">
          {isSignup ? 'Sign Up' : 'Login'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="input w-full"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input w-full"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
            />
          </div>
          {isSignup && (
            <div>
              <label className="block text-sm mb-1 font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input w-full"
                autoComplete="new-password"
                required
              />
            </div>
          )}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" className="btn btn-primary w-full">
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button
                className="text-primary hover:underline"
                onClick={() => {
                  setIsSignup(false);
                  setError('');
                }}
                type="button"
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                className="text-primary hover:underline"
                onClick={() => {
                  setIsSignup(true);
                  setError('');
                }}
                type="button"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-gray-500 hover:underline text-xs">
            Back to Home
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
