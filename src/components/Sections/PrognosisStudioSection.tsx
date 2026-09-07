import React from 'react';
import type { ClinicalStudy } from '../../types';
import { PrognosisTab } from '../AnalysisTabs/PrognosisTab';
import { Activity, ArrowRight, User } from 'lucide-react';

interface PrognosisStudioSectionProps {
  studies: ClinicalStudy[];
  selectedStudy: ClinicalStudy;
  onSelectStudy: (study: ClinicalStudy) => void;
  onOpenWorkstation: (study: ClinicalStudy) => void;
}

export const PrognosisStudioSection: React.FC<PrognosisStudioSectionProps> = ({
  studies,
  selectedStudy,
  onSelectStudy,
  onOpenWorkstation,
}) => {
  return (
    <div className="prognosis-studio-container">
      {/* Patient Header & Quick Switcher */}
      <div className="prognosis-header-banner glass-panel">
        <div className="patient-active-badge">
          <div className="patient-avatar-circle">
            <User size={20} />
          </div>
          <div>
            <div className="header-patient-name">{selectedStudy.metadata.patientName}</div>
            <div className="header-patient-meta font-mono">
              ID: {selectedStudy.metadata.patientId} • {selectedStudy.metadata.patientAge} • {selectedStudy.metadata.patientSex} • {selectedStudy.bodyPart} ({selectedStudy.modality})
            </div>
          </div>
        </div>

        <div className="patient-switcher-wrap">
          <span className="switcher-label font-mono">SWITCH PATIENT:</span>
          <select
            value={selectedStudy.id}
            onChange={(e) => {
              const found = studies.find((s) => s.id === e.target.value);
              if (found) onSelectStudy(found);
            }}
            className="patient-select-dropdown font-mono"
          >
            {studies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.metadata.patientName} ({s.bodyPart})
              </option>
            ))}
          </select>

          <button className="btn-secondary" onClick={() => onOpenWorkstation(selectedStudy)}>
            <Activity size={14} />
            <span>Open in DICOM Workstation</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Main Spacious Prognosis Content */}
      <div className="prognosis-content-wrapper glass-panel">
        <PrognosisTab
          study={selectedStudy}
          hasAnalyzed={true}
          onRunAnalysis={() => {}}
        />
      </div>

      <style>{`
        .prognosis-studio-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .prognosis-header-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          gap: 16px;
          flex-wrap: wrap;
        }

        .patient-active-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .patient-avatar-circle {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.15);
          color: var(--cyan-bright);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-patient-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: #ffffff;
        }

        .header-patient-meta {
          font-size: 0.76rem;
          color: var(--text-secondary);
        }

        .patient-switcher-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .switcher-label {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .patient-select-dropdown {
          background: rgba(8, 14, 26, 0.8);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 7px 12px;
          color: var(--text-primary);
          font-size: 0.8rem;
          outline: none;
        }

        .prognosis-content-wrapper {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: rgba(10, 16, 32, 0.8);
        }
      `}</style>
    </div>
  );
};
