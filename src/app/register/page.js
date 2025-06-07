'use client';
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [message, setMessage] = useState('');

  const [generatedOtp, setGeneratedOtp] = useState(null);

  // Function to generate 6-digit OTP
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleFormSubmit = async () => {
    if (!email || !username || !password) {
      setMessage('❌ Please fill in all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[username]) {
      setMessage('❌ Username already exists!');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('❌ Please enter a valid email address');
      return;
    }

    setMessage('Sending OTP...');
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
        setMessage('✅ OTP sent to your email');
        setStep('otp');
      } else {
        setMessage('❌ Failed to send OTP');
      }
    } catch (error) {
      setMessage('❌ Error sending OTP');
    }
  };

  const handleOtpVerify = async () => {
  if (otp === generatedOtp) {
    try {
      const res = await fetch('/api/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      console.log('RES:', res); // 👈 Add this line

      // If not OK, try reading plain text
      if (!res.ok) {
        const text = await res.text(); // this prevents JSON error
        //console.error('Non-JSON error response:', text);
        setMessage('❌ API Error: ' + res.status);
        return;
      }

      const data = await res.json();
      setMessage('✅ Registration successful!');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      console.error('Error registering user:', error);
      setMessage('❌ Server error');
    }
  } else {
    setMessage('❌ Invalid OTP');
  }
};


  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center' }}>
          {step === 'form' ? 'Register' : 'Enter OTP'}
        </h2>

        {step === 'form' ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
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
            <button onClick={handleFormSubmit} style={buttonStyle}>
              Submit
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={inputStyle}
            />
            <button onClick={handleOtpVerify} style={buttonStyle}>
              Verify & Register
            </button>
          </>
        )}

        <p style={{ marginTop: '10px', textAlign: 'center', color: '#333' }}>{message}</p>
      </div>
    </div>
  );
}

// Styles (keep same as before)
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
