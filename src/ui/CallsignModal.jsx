import React, { useState } from 'react';
import { Shield, Rocket, UserCheck } from 'lucide-react';
import { setCommanderName } from '../game/leaderboard';

export function CallsignModal({ onConfirm }) {
  const [inputName, setInputName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a Commander Callsign / Name to proceed.');
      return;
    }
    setCommanderName(trimmed);
    onConfirm(trimmed);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 10, 25, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '460px',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)',
          padding: '32px',
          color: '#f8fafc',
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#38bdf8',
          }}
        >
          <Shield size={32} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#f8fafc' }}>
          ISRO Flight Pilot Registration
        </h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', lineHeight: '1.5' }}>
          Welcome Commander! Enter your Callsign to initialize telemetry logs & rank on the Lunar Leaderboard.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#38bdf8',
                marginBottom: '8px',
              }}
            >
              Commander Name / Callsign
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Cmdr. Vikram-01"
              maxLength={24}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                color: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
            />
            {errorMsg && (
              <span style={{ display: 'block', fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>
                {errorMsg}
              </span>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#0f172a',
              backgroundColor: '#38bdf8',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            <Rocket size={18} /> Register & Start Mission
          </button>
        </form>
      </div>
    </div>
  );
}
