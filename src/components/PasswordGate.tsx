import React, { useState, useEffect } from 'react';
import { isPasswordSet, checkPassword, setPassword } from '../utils/auth';

interface PasswordGateProps {
  onAuthenticated: () => void;
}

const PasswordGate: React.FC<PasswordGateProps> = ({ onAuthenticated }) => {
  const [password, setPasswordInput] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isPasswordSet()) {
      setIsSettingPassword(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (checkPassword(password)) {
      onAuthenticated();
    } else {
      setError('Yanlış şifre!');
    }
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    if (newPassword.length < 4) {
      setError('Şifre en az 4 karakter olmalı!');
      return;
    }

    setPassword(newPassword);
    setIsSettingPassword(false);
    setPasswordInput('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (isSettingPassword) {
    return (
      <div className="password-container">
        <div className="password-box">
          <h2>AppleOGZ Hesap</h2>
          <p>İlk kullanım için şifre belirleyin:</p>
          <form onSubmit={handleSetPassword}>
            <input
              type="password"
              placeholder="Yeni şifre"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Şifreyi tekrar girin"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && <div className="error">{error}</div>}
            <button type="submit">Şifre Belirle</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="password-container">
      <div className="password-box">
        <h2>AppleOGZ Hesap</h2>
        <p>Devam etmek için şifrenizi girin:</p>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPasswordInput(e.target.value)}
            required
          />
          {error && <div className="error">{error}</div>}
          <button type="submit">Giriş Yap</button>
        </form>
      </div>
    </div>
  );
};

export default PasswordGate;
