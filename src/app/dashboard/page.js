'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('attendees');
  const [totalCount, setTotalCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    // Fetch total count where status = attending
    const { data: attendeesData } = await supabase
      .from('rsvp')
      .select('count')
      .eq('status', 'attending');
    
    if (attendeesData) {
      const sum = attendeesData.reduce((acc, row) => acc + (row.count || 0), 0);
      setTotalCount(sum);
    }

    // Fetch messages where status = not_attending
    const { data: msgsData } = await supabase
      .from('rsvp')
      .select('message')
      .eq('status', 'not_attending');
    
    if (msgsData) {
      setMessages(msgsData.filter(m => m.message));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearCategory = async (status) => {
    const label = status === 'attending' ? 'ATTENDEES' : 'MESSAGES';
    if (window.confirm(`Are you sure you want to clear all ${label}? This cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('rsvp')
          .delete()
          .eq('status', status);
        
        if (error) {
          console.error("Supabase Clear Error:", error);
          alert(`Could not clear ${label}. This is usually due to RLS policies.`);
          return;
        }

        alert(`${label} cleared successfully!`);
        fetchData();
      } catch (e) {
        console.error(e);
        alert('An unexpected error occurred: ' + e.message);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#ffffff', padding: '3rem 5%', fontFamily: 'var(--font-sans)', color: '#333' }}>
      
      {/* Title + Clear Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '2.5rem', fontWeight: 800, color: '#4a4a4a', letterSpacing: '0.02em', margin: 0 }}>
          DASHBOARD
        </h1>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          {activeTab === 'attendees' ? (
            <button 
              onClick={() => handleClearCategory('attending')}
              style={{
                background: '#fff',
                border: '1.5px solid #ff4d4d',
                color: '#ff4d4d',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#ff4d4d'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#ff4d4d'; }}
            >
              CLEAR ATTENDEES
            </button>
          ) : (
            <button 
              onClick={() => handleClearCategory('not_attending')}
              style={{
                background: '#fff',
                border: '1.5px solid #ff4d4d',
                color: '#ff4d4d',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontFamily: 'var(--font-sans)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#ff4d4d'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#ff4d4d'; }}
            >
              CLEAR MESSAGES
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('attendees')}
          style={{
            background: activeTab === 'attendees' ? '#eaf4eb' : 'transparent',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: activeTab === 'attendees' ? '#6c8a71' : '#666',
            cursor: 'pointer',
            transition: 'background 0.3s ease'
          }}
        >
          TOTAL ATTENDEES
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          style={{
            background: activeTab === 'messages' ? '#eaf4eb' : 'transparent',
            border: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: activeTab === 'messages' ? '#6c8a71' : '#666',
            cursor: 'pointer',
            transition: 'background 0.3s ease'
          }}
        >
          MESSAGE
        </button>
      </div>

      {/* Content Box */}
      <div style={{
        background: '#fafaf8',
        border: '1px solid #e1e0d4',
        borderRadius: '12px',
        width: '100%',
        padding: '5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '350px',
        boxSizing: 'border-box'
      }}>
        {loading ? (
          <div style={{ color: '#888' }}>Loading data via Supabase...</div>
        ) : activeTab === 'attendees' ? (
          <>
            <div style={{ fontFamily: 'var(--font-delius), "Delius Swash Caps", cursive', fontSize: '2rem', color: '#111', marginBottom: '1rem' }}>
              Total members
            </div>
            <div style={{ fontFamily: 'var(--font-cigra), serif', fontSize: '6rem', color: '#111', lineHeight: '1' }}>
              {totalCount}
            </div>
          </>
        ) : (
          <div style={{ width: '100%', maxWidth: '600px', textAlign: 'left', maxHeight: '400px', overflowY: 'auto' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', fontFamily: 'var(--font-sans)' }}>No sweet notes captured yet!</div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} style={{
                  background: '#fff',
                  border: '1px solid #eee',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontFamily: 'var(--font-delius), cursive',
                  fontSize: '1.1rem',
                  color: '#333'
                }}>
                  &ldquo; {msg.message} &rdquo;
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}
