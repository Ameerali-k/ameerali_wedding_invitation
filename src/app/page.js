'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase';
/* ─── Countdown Logic ────────────────────────────────────────── */
function useCountdown(targetDateStr) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDateStr).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDateStr]);

  return timeLeft;
}

/* ─── Music Control ─────────────────────────────────────────── */
function MusicControl({ isMuted, onToggle }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="music-control-btn"
      title={isMuted ? "Unmute Music" : "Mute Music"}
    >
      {isMuted ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
      <style>{`
        .music-control-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 100;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(74, 124, 90, 0.2);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #4a7c5a;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 8px;
        }
        .music-control-btn:hover {
          background: #fff;
          transform: scale(1.1);
          color: #6b9970;
          box-shadow: 0 6px 16px rgba(0,0,0,0.12);
        }
        .music-control-btn svg {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </button>
  );
}

/* ─── Heart Divider ──────────────────────────────────────────── */
function HeartDivider() {
  return (
    <div className="heart-divider" style={{ display: 'flex', justifyContent: 'center' }}>
      <img src="/images/heart devider.svg" alt="divider" style={{ width: '100%', maxWidth: '304px' }} />
    </div>
  );
}

/* ─── Islamic Date Divider ───────────────────────────────────── */
function IslamicDivider() {
  const [hijriDate, setHijriDate] = useState('1 Dhul Hijjah 1447');

  useEffect(() => {
    const fetchHijri = async () => {
      try {
        const response = await fetch('https://api.aladhan.com/v1/gToH/18-05-2026');
        const result = await response.json();
        if (result && result.data && result.data.hijri) {
          const h = result.data.hijri;
          // Format: "1 Dhul Hijjah 1447"
          setHijriDate(`${h.day} ${h.month.en} ${h.year}`);
        }
      } catch (e) {
        console.error('Error fetching Hijri date:', e);
      }
    };
    fetchHijri();
  }, []);

  return (
    <div className="islamic-divider">
      <img src="/images/smallline.svg" className="idiv-line" alt="" />
      <span className="idiv-text">{hijriDate}</span>
      <img src="/images/smallline.svg" className="idiv-line" alt="" style={{ transform: 'scaleX(-1)' }} />
    </div>
  );
}

/* ─── Countdown Cell ─────────────────────────────────────────── */
function CountdownCell({ value, label }) {
  return (
    <div className="countdown-cell">
      <div className="countdown-box">{String(value).padStart(2, '0')}</div>
      <div className="countdown-unit">{label}</div>
    </div>
  );
}

/* ─── Audio Helpers ──────────────────────────────────────────── */
function playPopSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error('AudioContext error', e);
  }
}

/* ─── Success Screen ───────────────────────────────────────────── */
function SuccessScreen({ onBack, onSubmit }) {
  const [count, setCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Play audio from the global element
    const audioEl = document.getElementById('wedding-audio');
    if (audioEl) {
      audioEl.volume = 0.4;
      audioEl.play().catch(e => console.log('Audio autoplay blocked', e));
    }

    // Play confetti pop sound
    playPopSound();

    let heartShape = undefined;
    if (typeof confetti.shapeFromPath === 'function') {
      try {
        heartShape = confetti.shapeFromPath({ path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z' });
      } catch (e) {
        console.log("Could not load custom heart shape", e);
      }
    }

    // single quick burst of confetti
    confetti({
      particleCount: 80,
      angle: 90,
      spread: 70,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#4a7c5a', '#7db37d', '#f2f2ec', '#d1495b', '#e07a5f', '#f9c5d1'],
      shapes: heartShape ? ['circle', 'square', heartShape] : ['circle', 'square'],
      scalar: 1.2
    });

    // second smaller burst after delay (no sound, only hearts)
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 90,
        spread: 50,
        startVelocity: 30,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#d1495b', '#e07a5f', '#f9c5d1'],
        shapes: heartShape ? [heartShape] : ['circle'],
        scalar: 1.5
      });
    }, 1000);
  }, []);

  return (
    <motion.div
      className="card success-screen"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
        height: 'fit-content',
        minHeight: 'auto'
      }}
    >

      {/* Centering Container */}
      <div style={{ width: '100%', maxWidth: '459px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Header Row */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer',
              color: '#8b9a90', padding: '0', display: 'flex', alignItems: 'center'
            }}
          >
            &#10094;
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-cigra)', fontSize: '2.5rem', color: '#111' }}>
            Wonderful !
          </div>
          <div style={{ width: '1.2rem' }} />
        </div>

        {/* Counter box */}
        <div style={{
          background: '#f8f8f5',
          border: '1px solid #e1e0d4',
          borderRadius: '8px',
          width: '100%',
          height: '216px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          marginBottom: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
        }}>
          <div style={{ fontFamily: 'var(--font-delius)', fontSize: '1.2rem', color: '#111', marginBottom: '1.5rem' }}>
            How many family members will attend?
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginBottom: '1.2rem' }}>
            <button
              onClick={() => setCount(Math.max(1, count - 1))}
              style={{
                width: '3.5rem', height: '3.5rem', borderRadius: '50%', border: 'none',
                background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                fontSize: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#111'
              }}
            >
              -
            </button>

            <div style={{ fontFamily: 'var(--font-cigra)', fontSize: '4.5rem', color: '#111', minWidth: '4rem', textAlign: 'center', lineHeight: 1 }}>
              {count}
            </div>

            <button
              onClick={() => setCount(count + 1)}
              style={{
                width: '3.5rem', height: '3.5rem', borderRadius: '50%', border: 'none',
                background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                fontSize: '1.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#111'
              }}
            >
              +
            </button>
          </div>

          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', color: '#777', letterSpacing: '0.15em', fontWeight: 'bold' }}>
            INCLUDING YOURSELF
          </div>
        </div>

        {/* Submit Button */}
        <button
          className="submit-rsvp-btn"
          disabled={isSubmitting}
          onClick={() => {
            setIsSubmitting(true);
            setTimeout(() => {
              setIsSubmitting(false);
              if (onSubmit) onSubmit(count);
            }, 1500);
          }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isSubmitting ? (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              SUBMITTING...
            </>
          ) : (
            'SUBMIT RSVP'
          )}
        </button>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}

/* ─── Confirmed Screen ─────────────────────────────────────────── */
function ConfirmedScreen({ onEdit }) {
  const { days, hours, minutes, seconds } = useCountdown('2026-05-18T12:00:00');

  useEffect(() => {
    // Play audio from the global element
    const audioEl = document.getElementById('wedding-audio');
    if (audioEl) {
      audioEl.volume = 0.4;
      audioEl.play().catch(e => console.log('Audio autoplay blocked', e));
    }

    // Play confetti pop sound
    playPopSound();

    let heartShape = undefined;
    if (typeof confetti.shapeFromPath === 'function') {
      try {
        heartShape = confetti.shapeFromPath({ path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z' });
      } catch (e) {
        console.log("Could not load custom heart shape", e);
      }
    }

    // single quick burst of confetti
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 360,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#4a7c5a', '#7db37d', '#f2f2ec', '#d1495b', '#e07a5f', '#f9c5d1'],
      shapes: heartShape ? ['circle', 'square', heartShape] : ['circle', 'square'],
      scalar: 1.2
    });
  }, []);

  return (
    <motion.div
      className="card confirmed-screen"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1.2rem',
        boxSizing: 'border-box',
        overflowY: 'hidden'
      }}
    >
      {/* Icon Row */}
      <div style={{ flexShrink: 0, width: '60px', height: '60px', borderRadius: '50%', background: '#fafaf8', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.12), inset 0 1px 4px rgba(0,0,0,0.08)' }}>
        <img src="/images/blink.svg" alt="blink" style={{ width: '28px', height: '28px' }} />
      </div>

      <div style={{ fontFamily: 'var(--font-cigra)', fontSize: '2.2rem', color: '#111', marginTop: '0.8rem' }}>
        We Can't Wait!
      </div>

      {/* Quote Box */}
      <div style={{
        width: '100%', maxWidth: '459px',
        background: '#fafaf8',
        border: '1px solid #e1e0d4',
        borderRadius: '8px',
        padding: '0.8rem',
        marginTop: '0.8rem',
        position: 'relative',
        textAlign: 'center'
      }}>
        <div style={{ position: 'absolute', top: '5px', left: '15px', color: '#d1cdc4', fontSize: '2rem', fontFamily: 'serif', lineHeight: 1 }}>&ldquo;</div>
        <div style={{ fontFamily: 'var(--font-delius)', fontSize: '0.85rem', color: '#555', padding: '0 20px', lineHeight: 1.4, marginTop: '2px' }}>
          Your <span style={{ fontFamily: 'inherit', fontWeight: 'normal' }}>RSVP</span> has been received! We look forward to celebrating with you
        </div>
        <div style={{ position: 'absolute', bottom: '-15px', right: '15px', color: '#d1cdc4', fontSize: '2rem', fontFamily: 'serif', lineHeight: 1 }}>&rdquo;</div>
      </div>

      {/* Thin line */}
      <div style={{ width: '100%', maxWidth: '459px', height: '1px', background: '#d5d5cc', margin: '1rem 0' }} />

      {/* Date / Venue section */}
      <div style={{ width: '100%', maxWidth: '459px', display: 'flex', alignItems: 'center' }}>

        {/* Left Col - Date */}
        <div style={{ flex: '0 0 110px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1.5px solid #d5d5cc', paddingRight: '0.5rem' }}>
          <div style={{ fontFamily: 'var(--font-cigra)', fontSize: '2.8rem', color: '#111', lineHeight: 1 }}>18</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, color: '#9fa3a9', letterSpacing: '0.2em', marginTop: '4px' }}>MAY</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.45rem', fontWeight: 800, color: '#333', letterSpacing: '0.1em', marginTop: '0.8rem', textAlign: 'center' }}>RECEPTION TIME</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--green, #6c8a71)', marginTop: '2px' }}>12:00 PM</div>
        </div>

        {/* Right Col - Venue */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingLeft: '0.5rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '1rem', fontWeight: 800, color: 'var(--green, #6c8a71)', letterSpacing: '0.05em' }}>KAIPURAM AUDITORIUM</div>
          <div style={{ fontFamily: '"Outfit", var(--font-sans), sans-serif', fontSize: '0.68rem', fontWeight: 600, color: '#333', marginTop: '0.4rem' }}>
            Mayilady Road, Koppam - Valanchery Rd, Kaipuram
          </div>

          <a href="https://maps.app.goo.gl/krSYAMbqxmesL1vL7" target="_blank" rel="noopener noreferrer" style={{
            marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.6rem 1.2rem', borderRadius: '30px', border: '1px solid var(--green, #6c8a71)', textDecoration: 'none', background: '#eaf4eb'
          }}>
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 0C3.13 0 0 3.13 0 7C0 12.25 7 18 7 18C7 18 14 12.25 14 7C14 3.13 10.87 0 7 0ZM7 9.5C5.62 9.5 4.5 8.38 4.5 7C4.5 5.62 5.62 4.5 7 4.5C8.38 4.5 9.5 5.62 9.5 7C9.5 8.38 8.38 9.5 7 9.5Z" fill="#6c8a71" /></svg>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--green, #6c8a71)', letterSpacing: '0.1em' }}>VIEW ON GOOGLE MAPS</span>
          </a>
        </div>
      </div>

      {/* Phone Button */}
      <a href="tel:8089297628" style={{
        width: 'fit-content', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        padding: '0.6rem 1.8rem', borderRadius: '8px', background: '#e6faeb', textDecoration: 'none', border: '1px solid #bceabf'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" stroke="#10884d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 700, color: '#10884d', letterSpacing: '0.02em' }}>808 929 7628</span>
      </a>

      {/* Countdown Box */}
      <div style={{
        width: '100%', maxWidth: '459px',
        background: '#fafaf8',
        border: '1px solid #e1e0d4',
        borderRadius: '8px',
        padding: '0.8rem',
        marginTop: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', fontWeight: 700, color: '#555', letterSpacing: '0.15em', marginBottom: '0.8rem' }}>
          COUNTDOWN TO RECEPTION
        </div>
        <div className="countdown-grid">
          <CountdownCell value={days} label="DAYS" />
          <CountdownCell value={hours} label="HOURS" />
          <CountdownCell value={minutes} label="MINS" />
          <CountdownCell value={seconds} label="SECS" />
        </div>
      </div>

      {/* Edit Response */}
      <div style={{ marginTop: '1rem', width: '100%', maxWidth: '459px' }}>
        <button onClick={onEdit} className="edit-response-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          EDIT RESPONSE
        </button>
      </div>

    </motion.div>
  );
}

/* ─── Not Attending Screen ─────────────────────────────────────── */
function NotAttendingScreen({ onBack, onSubmit }) {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        padding: '2.5rem 1.5rem',
        boxSizing: 'border-box',
        height: 'fit-content',
        minHeight: 'auto',
        alignItems: 'center'
      }}
    >
      <div style={{ width: '100%', maxWidth: '459px', display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Header with Back Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', position: 'relative' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer',
              color: '#a3afaa', padding: '10px', display: 'flex', alignItems: 'center',
              position: 'absolute', left: '-10px', top: '-2px', zIndex: 10
            }}
          >
            <svg width="12" height="18" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 15L1.5 8L8.5 1" stroke="#a3afaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-cigra)', fontSize: '2.5rem', color: '#111' }}>
            We Understand
          </div>
        </div>

        <div style={{ marginTop: '2.5rem', width: '100%' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', fontWeight: 700, color: '#555', letterSpacing: '0.15em', marginBottom: '1.2rem', textAlign: 'left' }}>
            NOTES FOR THE COUPLE
          </div>
          <input
            type="text"
            className="not-attending-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              borderBottom: '1px solid #c9ccaf',
              background: 'transparent',
              fontFamily: 'var(--font-sans)',
              fontSize: '1.1rem',
              color: '#111',
              padding: '0.2rem 0',
              outline: 'none',
              textAlign: 'left'
            }}
          />
        </div>

        <div style={{ marginTop: '3.5rem' }}>
          <button
            className="submit-rsvp-btn"
            disabled={isSubmitting}
            onClick={() => {
              setIsSubmitting(true);
              setTimeout(() => {
                setIsSubmitting(false);
                if (onSubmit) onSubmit(note);
              }, 1500);
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isSubmitting ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                SUBMITTING...
              </>
            ) : (
              'SUBMIT RSVP'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Not Attending Confirmed Screen ─────────────────────────────────── */
function NotAttendingConfirmedScreen({ onBack, onEdit }) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        padding: '2.5rem 1.5rem',
        boxSizing: 'border-box',
        height: 'fit-content',
        minHeight: 'auto',
        alignItems: 'center'
      }}
    >
      <div style={{ width: '100%', maxWidth: '459px', display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center' }}>

        {/* Header with Back Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', position: 'relative' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer',
              color: '#a3afaa', padding: '10px', display: 'flex', alignItems: 'center',
              position: 'absolute', left: '-10px', top: '-2px', zIndex: 10
            }}
          >
            <svg width="12" height="18" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 15L1.5 8L8.5 1" stroke="#a3afaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>

        {/* Icon Row */}
        <div style={{ flexShrink: 0, marginTop: '0', width: '60px', height: '60px', borderRadius: '50%', background: '#fafaf8', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.12), inset 0 1px 4px rgba(0,0,0,0.08)' }}>
          <img src="/images/love1.svg" alt="love" style={{ width: '22px', height: '22px' }} />
        </div>

        <div style={{ fontFamily: 'var(--font-cigra)', fontSize: '2.5rem', color: '#111', marginTop: '1.5rem' }}>
          We'll Miss You
        </div>

        {/* Quote Box */}
        <div style={{
          width: '100%',
          background: '#fafaf8',
          border: '1px solid #e1e0d4',
          borderRadius: '8px',
          padding: '1.5rem 1rem',
          marginTop: '2rem',
          position: 'relative',
          textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: '10px', left: '15px', color: '#d1cdc4', fontSize: '2.5rem', fontFamily: 'serif', lineHeight: 1 }}>&ldquo;</div>
          <div style={{ fontFamily: 'var(--font-delius)', fontSize: '0.9rem', color: '#555', padding: '0 25px', lineHeight: 1.5, marginTop: '2px' }}>
            We're sorry you won't be able to make it. You'll be missed!
          </div>
          <div style={{ position: 'absolute', bottom: '-15px', right: '15px', color: '#d1cdc4', fontSize: '2.5rem', fontFamily: 'serif', lineHeight: 1 }}>&rdquo;</div>
        </div>

        {/* Edit Response */}
        <div style={{ marginTop: '2.5rem', width: '100%' }}>
          <button onClick={onEdit} className="edit-response-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            EDIT RESPONSE
          </button>
        </div>

      </div>
    </motion.div>
  );
}

/* ─── Loading Screen ───────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: '#f6f8f5', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 100
      }}
    >
      <div style={{ width: '160px', height: '160px', marginBottom: '0.5rem' }}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            className="animate-flower"
            d="M 100 160 C 80 140, 40 120, 50 100 C 60 80, 80 90, 100 110 C 120 90, 140 80, 150 100 C 160 120, 120 140, 100 160 C 80 110, 60 90, 75 70 C 85 85, 95 100, 100 110 C 85 80, 85 45, 100 35 C 115 45, 115 80, 100 110 C 105 100, 115 85, 125 70 C 140 90, 120 110, 100 160"
            stroke="#7b9c7b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, color: '#7b9c7b', letterSpacing: '0.05em', marginBottom: '1rem', fontSize: '1.1rem', textAlign: 'center' }}>
        Loading your invitation...
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <motion.div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#b4c9b9' }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} />
        <motion.div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8ba791' }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} />
        <motion.div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7b9c7b' }} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} />
      </div>
    </motion.div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function Page() {
  const [attending, setAttending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [notAttending, setNotAttending] = useState(false);
  const [notAttendingConfirmed, setNotAttendingConfirmed] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const { days, hours, minutes, seconds } = useCountdown('2026-05-18T12:00:00');

  const fade = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: "easeOut" }
    }
  };
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5
      }
    }
  };

  const audioTag = <audio id="wedding-audio" src="/wedding_nasheeed.mp3" loop muted={isMuted} />;

  if (confirmed) {
    return (
      <>
        {audioTag}
        {!initLoading && <MusicControl isMuted={isMuted} onToggle={() => setIsMuted(!isMuted)} />}
        <ConfirmedScreen onEdit={() => { setConfirmed(false); setAttending(false); }} />
      </>
    );
  }

  if (notAttendingConfirmed) {
    return (
      <NotAttendingConfirmedScreen
        onBack={() => setNotAttendingConfirmed(false)}
        onEdit={() => { setNotAttendingConfirmed(false); setNotAttending(false); }}
      />
    );
  }

  if (notAttending) {
    return (
      <>
        <NotAttendingScreen
          onBack={() => setNotAttending(false)}
          onSubmit={async (note) => {
            try {
              await supabase.from('rsvp').insert([{ status: 'not_attending', message: note }]);
            } catch (e) { console.error(e); }
            setNotAttendingConfirmed(true);
          }}
        />
      </>
    );
  }

  if (attending) {
    return (
      <>
        {audioTag}
        {!initLoading && <MusicControl isMuted={isMuted} onToggle={() => setIsMuted(!isMuted)} />}
        <SuccessScreen
          onBack={() => setAttending(false)}
          onSubmit={async (count) => {
            try {
              await supabase.from('rsvp').insert([{ status: 'attending', count }]);
            } catch (e) { console.error(e); }
            setConfirmed(true);
          }}
        />
      </>
    );
  }

  return (
    <>
      <img src="/images/flower.svg" alt="" className="bg-flower bg-flower-tl" />
      <img src="/images/flower.svg" alt="" className="bg-flower bg-flower-br" />

      <AnimatePresence>
        {initLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      {audioTag}
      {!initLoading && (
        <motion.div className="card" variants={container} initial="hidden" animate="show">
          {/* Internal Flowers for Card */}
          <img src="/images/flower.svg" alt="" className="card-flower card-flower-tl" />
          <img src="/images/flower.svg" alt="" className="card-flower card-flower-br" />

          {/* ── Section 1: Header + Names ── */}
          <motion.div variants={fade} className="section-names">
            <div className="together-text">Together with their families</div>
            <div style={{ lineHeight: 1.0, marginTop: '0.4rem' }}>
              <div className="name-groom shine-name">Ameerali</div>
              <div className="name-ampersand" style={{ fontFamily: 'var(--font-cigra)', fontStyle: 'normal' }}>&amp;</div>
              <div className="name-bride shine-name">Aslaha Thasni</div>
            </div>
          </motion.div>

          {/* ── Section 2: Heart Divider ── */}
          <motion.div variants={fade} style={{ width: '100%' }}>
            <HeartDivider />
          </motion.div>

          {/* ── Section 2.5: Honor Text ── */}
          <motion.div variants={fade} className="section-honor">
            <div className="honor-text">
              Request the honor of your presence
            </div>
          </motion.div>

          {/* ── Section 3: Date + Islamic Date ── */}
          <motion.div variants={fade} className="section-date">
            <div className="date-box">
              <div className="col">
                <div className="col-day-label">MONDAY</div>
                <div className="col-day-sub">2026, May</div>
              </div>
              <div className="col-divider" />
              <div className="col col-number">
                <div className="col-number-val">18</div>
              </div>
              <div className="col-divider" />
              <div className="col">
                <div className="col-day-sub" style={{ textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.05em' }}>RECEPTION AT</div>
                <div className="col-time" style={{ color: 'var(--green, #6c8a71)' }}>12:00 PM</div>
              </div>
            </div>
            <div style={{ marginTop: '0.45rem' }}>
              <IslamicDivider />
            </div>
          </motion.div>

          {/* ── Section 4: Venue ── */}
          <motion.div variants={fade} className="section-venue">
            <div className="venue-name">Kaipuram Auditorium</div>
            <div className="venue-address" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '0.4rem', fontFamily: '"Outfit", var(--font-sans), sans-serif', maxWidth: '90%', margin: '4px auto 0' }}>
              <img src="/images/location.svg" alt="location" className="loc-icon" style={{ height: '1.2em', width: '1.2em', marginTop: '0.1rem', flexShrink: 0 }} />
              <span style={{ fontSize: 'calc(1em + 0.5px)', fontWeight: 600, textAlign: 'left' }}>Mayilady Road, Koppam - Valanchery Rd, Kaipuram</span>
            </div>
          </motion.div>

          {/* ── Full divider ── */}
          <motion.div variants={fade} className="full-divider" />

          {/* ── Section 5: Countdown ── */}
          <motion.div variants={fade} className="section-countdown">
            <div className="countdown-label-row">Countdown to Reception</div>
            <div className="countdown-grid" style={{ marginTop: '0.5rem' }}>
              <CountdownCell value={days} label="Days" />
              <CountdownCell value={hours} label="Hours" />
              <CountdownCell value={minutes} label="Mins" />
              <CountdownCell value={seconds} label="Secs" />
            </div>
          </motion.div>

          {/* ── Full divider ── */}
          <motion.div variants={fade} className="full-divider" />

          {/* ── Section 6: RSVP ── */}
          <motion.div variants={fade} className="section-rsvp">
            <div className="rsvp-label">Will you attend</div>
            <div className="rsvp-row" style={{ marginTop: '0.5rem' }}>
              <button
                className="rsvp-btn rsvp-btn-yes"
                onClick={() => setAttending(true)}
              >
                <img src="/images/tick.png" className="rsvp-icon" alt="yes" />
                <span className="rsvp-text">Yes, Jnsha Alla! 😍</span>
              </button>
              <button
                className="rsvp-btn rsvp-btn-no"
                onClick={() => setNotAttending(true)}
              >
                <img src="/images/wrong.png" className="rsvp-icon" alt="no" />
                <span className="rsvp-text">Unfortunately, I can't make it</span>
              </button>
            </div>
          </motion.div>

        </motion.div>
      )}
    </>
  );
}
