'use client';

import { useState } from 'react';
import Dashboard from '../dashboard/page';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 


export default function Login() {
  // Login stat
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  // Forgot Password states
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [forgotMessage, setForgotMessage] = useState('');

  // Generate OTP
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Handle login submit (your existing login logic here)
  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include', // ✅ Allow cookie to be saved
    });

    const data = await res.json();

    if (!res.ok) {
      setLoginMessage('❌ Invalid username or password');
      return;
    }

    setLoginMessage('✅ Login successful!');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  } catch (error) {
    console.error('Login error:', error);
    setLoginMessage('❌ Server error');
  }
};


  // Send OTP for forgot password
  const sendOtp = async () => {
    if (!email) {
      setForgotMessage('❌ Please enter your email');
      return;
    } 

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setForgotMessage('❌ Please enter a valid email');
      return;
    }

    // Check if email registered
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userExists = Object.values(users).some(user => user.email === email);
    if (!userExists) {
      setForgotMessage('❌ Email not registered');
      return;
    }

    const otpToSend = generateOtp();
    setGeneratedOtp(otpToSend);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpToSend }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotMessage('✅ OTP sent! Check your email.');
        setOtpSent(true);
      } else {
        setForgotMessage('❌ Failed to send OTP');
      }
    } catch {
      setForgotMessage('❌ Error sending OTP');
    }
  };

  // Reset password after OTP verification
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const handleResetPassword = () => {
    if (otpInput !== generatedOtp) {
      setForgotMessage('❌ Invalid OTP');
      return;
    }
    if (!newPassword) {
      setForgotMessage('❌ Please enter a new password');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const usernameFound = Object.keys(users).find(
      key => users[key].email === email
    );

    if (!usernameFound) {
      setForgotMessage('❌ User not found');
      return;
    }

    users[usernameFound].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    setForgotMessage('✅ Password reset successful! You can now login.');
    // Reset forgot password form
    setOtpSent(false);
    setShowForgot(false);
    setEmail('');
    setOtpInput('');
    setNewPassword('');
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {!showForgot ? (
          <>
            <h2>Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <button type= "button" onClick={handleLogin} style={buttonStyle}>
              Login
            </button>
            <p style={{ color: 'red', marginTop: '10px' }}>{loginMessage}</p>

            <p style={{ marginTop: '15px' }}>
              Forgot Password?{' '}
              <button
                onClick={() => {
                  setShowForgot(true);
                  setLoginMessage('');
                }}
                style={{ color: '#0070f3', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Click here
              </button>
            </p>
          </>
        ) : (
          <>
            <h2>Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              disabled={otpSent}
            />
            <button onClick={sendOtp} style={buttonStyle} disabled={otpSent}>
              Send OTP
            </button>
            {otpSent && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                />
                <button onClick={handleResetPassword} style={buttonStyle}>
                  Reset Password
                </button>
              </>
            )}
            <p style={{ color: 'green', marginTop: '10px' }}>{forgotMessage}</p>

            <p style={{ marginTop: '15px' }}>
              Remembered your password?{' '}
              <button
                onClick={() => {
                  setShowForgot(false);
                  setForgotMessage('');
                }}
                style={{ color: '#0070f3', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Back to Login
              </button>
            </p>
          </>
        )}
        <p style={{ marginTop: '10px' }}>
  Don't have an account?{' '}
  <Link
    href="/register"
    style={{ color: '#0070f3', textDecoration: 'underline', cursor: 'pointer' }}
  >
    Register here
  </Link>
</p>

      </div>
    </div>
  );
}

// Styles (reuse or customize)
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f0f2f5',
};

const cardStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  width: '320px',
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginTop: '10px',
  marginBottom: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginTop: '10px',
}; 