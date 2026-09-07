import React from 'react';
import {
  Activity,
  Cpu,
  Sparkles,
  GitBranch,
  Users,
  LayoutDashboard,
  Clock,
  FileText,
} from 'lucide-react';

export type AppSection = 'patients' | 'workstation' | 'prognosis' | 'training' | 'report';

interface NavbarProps {
  activeSection: AppSection;
  setActiveSection: (section: AppSection) => void;
  isAnalyzing: boolean;
  selectedPatientName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  setActiveSection,
  isAnalyzing,
  selectedPatientName,
}) => {
  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <div className="brand-badge" onClick={() => setActiveSection('patients')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper">
            <Activity className="brand-icon" size={22} />
            <div className="brand-pulse" />
          </div>
          <div>
            <div className="brand-title">
              <span>LuminaRad</span> <span className="brand-highlight">PACS</span>
            </div>
            <div className="brand-subtitle">Clinical Diagnostic & 5-Yr Prognosis Suite</div>
          </div>
        </div>

        <div className="system-telemetry">
          <div className="telemetry-pill">
            <span className="telemetry-dot online" />
            <span className="telemetry-label">PACS Core:</span>
            <span className="telemetry-value">ONLINE</span>
          </div>
          <div className="telemetry-pill">
            <Cpu size={13} className="telemetry-icon" />
            <span className="telemetry-label">DL Vision:</span>
            <span className="telemetry-value">DenseNet-121</span>
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

      {/* Center Nav: Clear Navigable Sections */}
      <nav className="navbar-center">
        <div className="nav-sections-tabs">
          <button
            className={`nav-tab-btn ${activeSection === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveSection('patients')}
          >
            <Users size={14} />
            <span>Patient Cases</span>
          </button>

          <button
            className={`nav-tab-btn ${activeSection === 'workstation' ? 'active' : ''}`}
            onClick={() => setActiveSection('workstation')}
          >
            <LayoutDashboard size={14} />
            <span>Diagnostic Workstation</span>
          </button>

          <button
            className={`nav-tab-btn ${activeSection === 'prognosis' ? 'active' : ''}`}
            onClick={() => setActiveSection('prognosis')}
          >
            <Clock size={14} />
            <span>5-Yr Prognosis</span>
          </button>

          <button
            className={`nav-tab-btn training-highlight ${activeSection === 'training' ? 'active' : ''}`}
            onClick={() => setActiveSection('training')}
          >
            <Sparkles size={14} />
            <span>Kaggle AI Studio</span>
          </button>

          <button
            className={`nav-tab-btn ${activeSection === 'report' ? 'active' : ''}`}
            onClick={() => setActiveSection('report')}
          >
            <FileText size={14} />
            <span>Report & Tags</span>
          </button>
        </div>
      </nav>

      <div className="navbar-right">
        {/* Active Patient Indicator */}
        <div
          className="active-patient-chip font-mono"
          onClick={() => setActiveSection('workstation')}
          title="Current Loaded Patient"
        >
          <span className="chip-lead">PATIENT:</span>
          <span className="chip-name">{selectedPatientName}</span>
        </div>

        {/* GitHub link directly to user repo */}
        <a
          href="https://github.com/chakkashanmukh2006-create/luminarad-pacs"
          target="_blank"
          rel="noopener noreferrer"
          className="github-repo-link"
          title="View Source on GitHub"
        >
          <GitBranch size={15} />
          <span>luminarad-pacs</span>
        </a>
      </div>

      <style>{`
        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 24px;
          background: rgba(9, 14, 28, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 100;
          gap: 16px;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .brand-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon-wrapper {
          position: relative;
          width: 36px;
          height: 36px;
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
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .brand-highlight {
          color: var(--cyan-bright);
          text-shadow: 0 0 12px rgba(6, 182, 212, 0.5);
        }

        .brand-subtitle {
          font-size: 0.68rem;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .system-telemetry {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .telemetry-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.72rem;
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

        .navbar-center {
          display: flex;
          align-items: center;
        }

        .nav-sections-tabs {
          display: flex;
          background: rgba(14, 23, 42, 0.8);
          padding: 4px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          gap: 4px;
        }

        .nav-tab-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .nav-tab-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-tab-btn.active {
          background: rgba(6, 182, 212, 0.16);
          color: var(--cyan-bright);
          border: 1px solid rgba(6, 182, 212, 0.35);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
        }

        .nav-tab-btn.training-highlight.active {
          background: rgba(168, 85, 247, 0.2);
          color: #c084fc;
          border: 1px solid rgba(168, 85, 247, 0.45);
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .active-patient-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: var(--radius-md);
          font-size: 0.72rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .active-patient-chip:hover {
          background: rgba(6, 182, 212, 0.15);
          border-color: var(--cyan-bright);
        }

        .chip-lead {
          color: var(--text-muted);
        }

        .chip-name {
          color: var(--cyan-bright);
          font-weight: 700;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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
          font-size: 0.78rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .github-repo-link:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        @media (max-width: 1180px) {
          .system-telemetry {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
