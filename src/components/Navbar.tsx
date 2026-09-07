import React from 'react';
import { Activity, Cpu, Sparkles, Sliders, GitBranch } from 'lucide-react';

interface NavbarProps {
  activeTab: 'findings' | 'prognosis' | 'metadata' | 'training';
  setActiveTab: (tab: 'findings' | 'prognosis' | 'metadata' | 'training') => void;
  isAnalyzing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isAnalyzing }) => {
  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <div className="brand-badge">
          <div className="brand-icon-wrapper">
            <Activity className="brand-icon" size={22} />
            <div className="brand-pulse" />
          </div>
          <div>
            <div className="brand-title">
              <span>LuminaRad</span> <span className="brand-highlight">PACS</span>
            </div>
            <div className="brand-subtitle">Clinical DICOM Diagnostic & 5-Yr Prognosis Workstation</div>
          </div>
        </div>

        <div className="system-telemetry">
          <div className="telemetry-pill">
            <span className="telemetry-dot online" />
            <span className="telemetry-label">PACS Core:</span>
            <span className="telemetry-value">ONLINE (104)</span>
          </div>
          <div className="telemetry-pill">
            <Cpu size={13} className="telemetry-icon" />
            <span className="telemetry-label">DL Vision:</span>
            <span className="telemetry-value">DenseNet-121 / ViT</span>
          </div>
          {isAnalyzing && (
            <div className="telemetry-pill analyzing">
              <span className="telemetry-dot blink-dot" style={{ backgroundColor: '#f43f5e' }} />
              <span className="telemetry-value" style={{ color: '#f43f5e', fontWeight: 600 }}>
                SCANNING VOXELS...
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {/* Navigation Quick Switches */}
        <div className="nav-mode-selector">
          <button
            className={`nav-mode-btn ${activeTab !== 'training' ? 'active' : ''}`}
            onClick={() => setActiveTab('findings')}
          >
            <Sliders size={14} />
            <span>Radiology Workstation</span>
          </button>
          <button
            className={`nav-mode-btn training-highlight ${activeTab === 'training' ? 'active' : ''}`}
            onClick={() => setActiveTab('training')}
          >
            <Sparkles size={14} />
            <span>AI Training Studio</span>
            <span className="kbd-badge">Kaggle</span>
          </button>
        </div>

        {/* GitHub link directly to user repo */}
        <a
          href="https://github.com/chakkashanmukh2006-create/luminarad-pacs"
          target="_blank"
          rel="noopener noreferrer"
          className="github-repo-link"
          title="View Source on GitHub"
        >
          <GitBranch size={16} />
          <span>luminarad-pacs</span>
        </a>
      </div>

      <style>{`
        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: rgba(9, 14, 28, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .brand-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon-wrapper {
          position: relative;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2));
          border: 1px solid rgba(6, 182, 212, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cyan-primary);
        }

        .brand-pulse {
          position: absolute;
          inset: -3px;
          border-radius: calc(var(--radius-md) + 3px);
          border: 1px solid var(--cyan-primary);
          opacity: 0.3;
          animation: pulseGlow 3s infinite ease-in-out;
        }

        .brand-title {
          font-size: 1.22rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .brand-highlight {
          color: var(--cyan-bright);
          text-shadow: 0 0 12px rgba(6, 182, 212, 0.5);
        }

        .brand-subtitle {
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-weight: 400;
          letter-spacing: 0.2px;
        }

        .system-telemetry {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .telemetry-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.75rem;
          font-family: var(--font-mono);
        }

        .telemetry-pill.analyzing {
          background: rgba(244, 63, 94, 0.1);
          border-color: rgba(244, 63, 94, 0.4);
        }

        .telemetry-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .telemetry-dot.online {
          background-color: var(--emerald-success);
          box-shadow: 0 0 8px var(--emerald-success);
        }

        .telemetry-label {
          color: var(--text-muted);
        }

        .telemetry-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .telemetry-icon {
          color: var(--purple-ai);
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .nav-mode-selector {
          display: flex;
          background: rgba(14, 23, 42, 0.7);
          padding: 3px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          gap: 4px;
        }

        .nav-mode-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-mode-btn:hover {
          color: #ffffff;
        }

        .nav-mode-btn.active {
          background: rgba(6, 182, 212, 0.15);
          color: var(--cyan-bright);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .nav-mode-btn.training-highlight.active {
          background: rgba(168, 85, 247, 0.18);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.4);
        }

        .kbd-badge {
          background: rgba(168, 85, 247, 0.25);
          color: #e9d5ff;
          font-size: 0.65rem;
          padding: 1px 5px;
          border-radius: 4px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .github-repo-link {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 12px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          color: var(--text-primary);
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .github-repo-link:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        @media (max-width: 960px) {
          .system-telemetry {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
