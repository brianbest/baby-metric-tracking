import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/useAuthStore';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'check-email'>('email');

  const { signInWithEmail, signInWithOAuth, loading, error, clearError } = useAuthStore();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    await signInWithEmail(email);
    if (!useAuthStore.getState().error) {
      setStep('check-email');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    await signInWithOAuth(provider);
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={handleClose} aria-label={t('common.close')}>
          ×
        </button>

        <div className="auth-modal-content">
          <h2 className="auth-modal-title">
            {step === 'email' ? t('auth.signIn') : t('auth.checkEmail')}
          </h2>

          {step === 'email' && (
            <>
              <p className="auth-modal-description">{t('auth.signInDescription')}</p>

              <form onSubmit={handleEmailSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    {t('auth.emailAddress')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="form-input"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <div className="error-message" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-full-width"
                  disabled={loading || !email.trim()}
                >
                  {loading ? t('auth.sendingLink') : t('auth.sendMagicLink')}
                </button>
              </form>

              <div className="auth-divider">
                <span>{t('auth.orContinueWith')}</span>
              </div>

              <div className="oauth-buttons">
                <button
                  onClick={() => handleOAuthLogin('google')}
                  className="btn btn-oauth btn-google"
                  disabled={loading}
                >
                  <span className="oauth-icon">G</span>
                  {t('auth.continueWithGoogle')}
                </button>

                <button
                  onClick={() => handleOAuthLogin('apple')}
                  className="btn btn-oauth btn-apple"
                  disabled={loading}
                >
                  <span className="oauth-icon"></span>
                  {t('auth.continueWithApple')}
                </button>
              </div>
            </>
          )}

          {step === 'check-email' && (
            <div className="check-email-content">
              <div className="check-email-icon">📧</div>
              <p>{t('auth.checkEmailMessage', { email })}</p>
              <p className="check-email-note">{t('auth.checkEmailNote')}</p>
              <button onClick={() => setStep('email')} className="btn btn-secondary">
                {t('auth.tryDifferentEmail')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
