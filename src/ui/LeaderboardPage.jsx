import React, { useState } from 'react';
import { Trophy, Home, Rocket, Radio, Award, User, RefreshCw, Star } from 'lucide-react';
import { navigate, ROUTES } from '../game/router';
import {
  loadLeaderboardData,
  getCommanderName,
  setCommanderName,
  resetLeaderboardData,
} from '../game/leaderboard';

export function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('mission-1');
  const [leaderboardData, setLeaderboardData] = useState(loadLeaderboardData());
  const [commander, setCommander] = useState(getCommanderName());
  const [isEditingCallsign, setIsEditingCallsign] = useState(false);
  const [tempCallsign, setTempCallsign] = useState(commander);

  const handleHome = () => {
    navigate(ROUTES.HOME);
  };

  const handleSaveCallsign = (e) => {
    e.preventDefault();
    const trimmed = tempCallsign.trim();
    if (trimmed) {
      setCommanderName(trimmed);
      setCommander(trimmed);
      setIsEditingCallsign(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset local leaderboard scores to default ISRO benchmarks?')) {
      const reset = resetLeaderboardData();
      setLeaderboardData(reset);
    }
  };

  const entries = leaderboardData[activeTab] || [];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#070c18',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(14, 165, 233, 0.15) 0%, transparent 75%)',
        color: '#f8fafc',
        fontFamily: "'Inter', system-ui, sans-serif",
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* Header Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          sticky: 'top',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy size={28} color="#eab308" />
          <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, letterSpacing: '0.5px' }}>
            ISRO Lunar Mission Hall of Fame
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {commander && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '20px',
                fontSize: '13px',
              }}
            >
              <User size={14} color="#38bdf8" />
              <span>{commander}</span>
              <button
                onClick={() => setIsEditingCallsign(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '11px',
                  textDecoration: 'underline',
                  paddingLeft: '4px',
                }}
              >
                Edit
              </button>
            </div>
          )}

          <button
            onClick={handleHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: '#38bdf8',
              color: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
              transition: 'transform 0.1s',
            }}
          >
            <Home size={18} /> Home
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1000px', margin: '32px auto', padding: '0 20px' }}>
        {/* Mission Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('mission-1')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: '700',
              borderRadius: '12px',
              border: activeTab === 'mission-1' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: activeTab === 'mission-1' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'mission-1' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Rocket size={20} /> Mission 1: Vikram Soft Touchdown
          </button>

          <button
            onClick={() => setActiveTab('mission-2')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px',
              fontSize: '15px',
              fontWeight: '700',
              borderRadius: '12px',
              border: activeTab === 'mission-2' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: activeTab === 'mission-2' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.6)',
              color: activeTab === 'mission-2' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Radio size={20} /> Mission 2: Pragyan Rover Science
          </button>
        </div>

        {/* Table Card */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
              {activeTab === 'mission-1'
                ? '🚀 Mission 1 Leaderboard Rankings'
                : '🚜 Mission 2 Leaderboard Rankings'}
            </h2>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              Top Scores (Ranked by Total Score)
            </span>
          </div>

          {entries.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              No scores recorded yet for this mission.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr style={{ color: '#38bdf8', borderBottom: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <th style={{ padding: '12px 16px' }}>Rank</th>
                    <th style={{ padding: '12px 16px' }}>Commander Callsign</th>
                    <th style={{ padding: '12px 16px' }}>Score</th>
                    <th style={{ padding: '12px 16px' }}>Rating</th>
                    {activeTab === 'mission-1' ? (
                      <>
                        <th style={{ padding: '12px 16px' }}>V-Speed</th>
                        <th style={{ padding: '12px 16px' }}>Fuel Left</th>
                      </>
                    ) : (
                      <>
                        <th style={{ padding: '12px 16px' }}>Battery</th>
                        <th style={{ padding: '12px 16px' }}>Science</th>
                      </>
                    )}
                    <th style={{ padding: '12px 16px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((item, index) => {
                    const isTop3 = index < 3;
                    const rankBadge =
                      index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;

                    return (
                      <tr
                        key={item.id || index}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          backgroundColor:
                            item.commander === commander
                              ? 'rgba(56, 189, 248, 0.1)'
                              : 'transparent',
                        }}
                      >
                        <td
                          style={{
                            padding: '14px 16px',
                            fontWeight: '700',
                            fontSize: isTop3 ? '18px' : '14px',
                          }}
                        >
                          {rankBadge}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                          {item.commander}{' '}
                          {item.isBenchmark && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                                color: '#eab308',
                                marginLeft: '6px',
                              }}
                            >
                              ISRO Official
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            fontWeight: '700',
                            color: '#38bdf8',
                            fontSize: '16px',
                          }}
                        >
                          {item.score} pts
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {Array.from({ length: item.stars || 0 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill="#eab308"
                              color="#eab308"
                              style={{ display: 'inline-block', marginRight: '2px' }}
                            />
                          ))}
                        </td>
                        {activeTab === 'mission-1' ? (
                          <>
                            <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                              {item.touchdownSpeed}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                              {item.fuelRemaining}
                            </td>
                          </>
                        ) : (
                          <>
                            <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                              {item.batteryRemaining}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>
                              {item.sciencePayloads}
                            </td>
                          </>
                        )}
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                          {item.date}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
          }}
        >
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '8px 14px',
              color: '#94a3b8',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Restore Default Benchmarks
          </button>

          <button
            onClick={handleHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: '#38bdf8',
              color: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Return to Home Page
          </button>
        </div>
      </main>

      {/* Edit Callsign Modal */}
      {isEditingCallsign && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <form
            onSubmit={handleSaveCallsign}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '12px',
              padding: '24px',
              width: '320px',
            }}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#f8fafc' }}>
              Change Callsign
            </h3>
            <input
              type="text"
              value={tempCallsign}
              onChange={(e) => setTempCallsign(e.target.value)}
              placeholder="Commander Callsign"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                color: '#ffffff',
                marginBottom: '16px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsEditingCallsign(false)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'transparent',
                  border: '1px solid #475569',
                  color: '#94a3b8',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
