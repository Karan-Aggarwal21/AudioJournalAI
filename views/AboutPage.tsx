"use client";

/**
 * AboutPage — Static content about MindMirror: mission, philosophy, and contact.
 */

export default function AboutPage() {
  return (
    <div className="page-about-nebula">
      <div className="glass-board-nebula">
        <div className="entries-header-nebula" style={{ borderBottom: '1px solid rgba(255, 200, 100, 0.2)', marginBottom: '16px' }}>
          <div className="entries-header-text">
            <h2 className="solidified-light-title">About Us</h2>
            <p className="glowing-numbers-text">Our Mission &amp; Philosophy</p>
          </div>
          <div className="sprout-hologram">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22v-9" />
                <path d="M12 13C8 13 5 10 5 6c0 0 4 0 7 7Z" />
                <path d="M12 13c4 0 7-3 7-7 0 0-4 0-7 7Z" />
              </svg>
          </div>
        </div>

        <div className="about-shard-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="about-section-nebula">
            <p className="shard-text">
              MINDMIRROR is designed a a mirror for your mind, helping you capture daily thoughts and track your emotional journey. We believe in the power of conscious reflection.
            </p>
          </div>

          <div className="about-section-nebula">
            <h3 className="shard-heading">
              <span className="hologram-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
              </span>
              Our Mission
            </h3>
            <p className="shard-text">
              To provide a secure, private, and intuitive platform for deep self-reflection, empowering users to discover their unique thought patterns and personal growth.
            </p>
          </div>

          <div className="about-section-nebula">
            <h3 className="shard-heading">
              <span className="hologram-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2v20" />
                  <path d="M2 12h20" />
                  <path d="m4.93 4.93 14.14 14.14" />
                  <path d="m19.07 4.93-14.14 14.14" />
                </svg>
              </span>
              Our Philosophy
            </h3>
            <p className="shard-text">
              Combining the archival feel of physical journaling with the insightful potential of compassionate AI analysis, to synthesize your words into actionable life patterns, always with user privacy at its core.
            </p>
          </div>

          <div className="about-footer-nebula" style={{ borderTop: '1px solid rgba(255, 200, 100, 0.15)', paddingTop: '24px' }}>
            <p className="shard-text text-center">
              <strong className="glowing-strong">Questions or Feedback?</strong> Email us at: <br/><strong className="glowing-accent">mindmirror@gmail.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
