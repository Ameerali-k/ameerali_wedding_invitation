'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('attendees');
  const [totalCount, setTotalCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch total count where status = attending
      const { data: attendeesData, error: countError } = await supabase
        .from('rsvp')
        .select('count')
        .eq('status', 'attending');
      
      if (attendeesData) {
        const sum = attendeesData.reduce((acc, row) => acc + (row.count || 0), 0);
        setTotalCount(sum);
      }

      // Fetch messages where status = not_attending
      const { data: msgsData, error: msgsError } = await supabase
        .from('rsvp')
        .select('message')
        .eq('status', 'not_attending');
      
      if (msgsData) {
        setMessages(msgsData.filter(m => m.message));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '3rem 5%', fontFamily: 'var(--font-sans)', color: '#333' }}>
      
      {/* Title */}
      <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: '2.5rem', fontWeight: 800, color: '#4a4a4a', letterSpacing: '0.02em', marginBottom: '3rem' }}>
        DASHBOARD
      </h1>

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
              Total member
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
