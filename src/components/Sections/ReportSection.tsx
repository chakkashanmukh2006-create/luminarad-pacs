import React from 'react';
import type { ClinicalStudy } from '../../types';
import { DicomMetadataTab } from '../AnalysisTabs/DicomMetadataTab';
import { User, FileText, Activity } from 'lucide-react';

interface ReportSectionProps {
  studies: ClinicalStudy[];
  selectedStudy: ClinicalStudy;
  onSelectStudy: (study: ClinicalStudy) => void;
  onOpenWorkstation: (study: ClinicalStudy) => void;
}

export const ReportSection: React.FC<ReportSectionProps> = ({
  studies,
  selectedStudy,
  onSelectStudy,
  onOpenWorkstation,
}) => {
  return (
    <div className="report-section-container">
      {/* Patient Header & Quick Switcher */}
      <div className="report-header-banner glass-panel">
        <div className="patient-active-badge">
          <div className="patient-avatar-circle">
            <User size={20} />
          </div>
          <div>
            <div className="header-patient-name">{selectedStudy.metadata.patientName}</div>
            <div className="header-patient-meta font-mono">
              ID: {selectedStudy.metadata.patientId} • {selectedStudy.metadata.patientAge} • {selectedStudy.metadata.patientSex} • {selectedStudy.metadata.institutionName}
            </div>
          </div>
        </div>

        <div className="patient-switcher-wrap">
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
            <span>Open in Viewport</span>
          </button>
        </div>
      </div>

      {/* Printable Clinical Diagnostic Summary Card */}
      <div className="clinical-summary-box glass-panel">
        <div className="summary-header">
          <FileText size={18} className="text-cyan" />
          <h3>Official Radiological Examination Report</h3>
          <span className="confidential-stamp">CONFIDENTIAL • MEDICAL RECORD</span>
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <span className="lbl">Examined Region:</span>
            <span className="val">{selectedStudy.bodyPart} ({selectedStudy.modality} {selectedStudy.metadata.viewPosition})</span>
          </div>
          <div className="summary-item">
            <span className="lbl">Date of Examination:</span>
            <span className="val font-mono">{selectedStudy.metadata.studyDate}</span>
          </div>
          <div className="summary-item">
            <span className="lbl">DL Diagnosis:</span>
            <span className="val text-cyan font-bold">{selectedStudy.primaryAnomaly}</span>
          </div>
          <div className="summary-item">
            <span className="lbl">Confidence Index:</span>
            <span className="val font-bold">{(selectedStudy.confidenceScore * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="impression-block">
          <h4>Radiological Impression</h4>
          <p>{selectedStudy.pathologySummary}</p>
        </div>
      </div>

      {/* Searchable DICOM Header Registry */}
      <div className="report-content-wrapper glass-panel">
        <DicomMetadataTab study={selectedStudy} />
      </div>

      <style>{`
        .report-section-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .report-header-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
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

        .patient-select-dropdown {
          background: rgba(8, 14, 26, 0.8);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 7px 12px;
          color: var(--text-primary);
          font-size: 0.8rem;
          outline: none;
        }

        .clinical-summary-box {
          padding: 20px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .summary-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 12px;
        }

        .summary-header h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
          flex: 1;
        }

        .confidential-stamp {
          font-size: 0.65rem;
          font-family: var(--font-mono);
          background: rgba(244, 63, 94, 0.15);
          color: #f43f5e;
          border: 1px solid rgba(244, 63, 94, 0.3);
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 700;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          background: rgba(8, 14, 26, 0.5);
          padding: 12px 16px;
          border-radius: var(--radius-md);
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .lbl {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .val {
          font-size: 0.85rem;
          color: #ffffff;
        }

        .font-bold {
          font-weight: 700;
        }

        .impression-block h4 {
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .impression-block p {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #cbd5e1;
        }

        .report-content-wrapper {
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: rgba(10, 16, 32, 0.8);
        }

        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
};
