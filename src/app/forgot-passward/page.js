'use client';

import { useState } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');

  const [generatedOtp, setGeneratedOtp] = useState(null);

  // Generate OTP function
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOtp = async () => {
    if (!email) {
      setMessage('❌ Please enter your email');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('❌ Please enter a valid email address');
      return;
    }

    // Check if email exists in localStorage users
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userExists = Object.values(users).some((user) => user.email === email);
    if (!userExists) {
      setMessage('❌ Email not registered');
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
        setMessage('✅ OTP sent! Check your email.');
        setOtpSent(true);
      } else {
        setMessage('❌ Failed to send OTP');
      }
    } catch (err) {
      setMessage('❌ Error sending OTP');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
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

        <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>

        {otpSent && <ResetPassword email={email} generatedOtp={generatedOtp} />}
      </div>
    </div>
  );
}

// ResetPassword component to verify OTP and reset password
function ResetPassword({ email, generatedOtp }) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = () => {
    if (otp !== generatedOtp) {
      setMessage('❌ Invalid OTP');
      return;
    }
    if (!newPassword) {
      setMessage('❌ Please enter a new password');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    // Find username by email
    const username = Object.keys(users).find(
      (key) => users[key].email === email
    );

    if (!username) {
      setMessage('❌ User not found');
      return;
    }

    users[username].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));

    setMessage('✅ Password reset successful! You can now login.');
  };

  return (
    <>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={inputStyle}
      />
      <button onClick={handleReset} style={buttonStyle}>
        Reset Password
      </button>
      <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>
    </>
  );
}

// Styles (you can customize)
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
  width: '300px',
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
