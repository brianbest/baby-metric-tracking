import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          navigate('/');
        } else {
          navigate('/?error=' + encodeURIComponent('No session found'));
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: 'var(--text-secondary)',
      }}
    >
      Completing sign in...
    </div>
  );
}
