import React, { useRef } from 'react';
import type { ClinicalStudy } from '../../types';
import {
  Upload,
  User,
  Activity,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react';

interface PatientHubSectionProps {
  studies: ClinicalStudy[];
  selectedStudy: ClinicalStudy;
  onSelectStudy: (study: ClinicalStudy) => void;
  onOpenWorkstation: (study: ClinicalStudy) => void;
  onOpenPrognosis: (study: ClinicalStudy) => void;
  onUploadCustomImage: (file: File) => void;
}

export const PatientHubSection: React.FC<PatientHubSectionProps> = ({
  studies,
  selectedStudy,
  onSelectStudy,
  onOpenWorkstation,
  onOpenPrognosis,
  onUploadCustomImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustomImage(e.target.files[0]);
    }
  };

  return (
    <div className="patient-hub-container">
      {/* Welcome Banner & Guided Steps */}
      <div className="hub-welcome-banner glass-panel">
        <div className="welcome-text-wrap">
          <div className="welcome-tag">
            <Sparkles size={14} className="text-cyan" />
            <span>Clinical Diagnostic Intelligence Suite</span>
          </div>
          <h2>Welcome to LuminaRad PACS</h2>
          <p>
            An enterprise radiology workstation designed for high-resolution DICOM viewing, deep learning cancer and fracture anomaly detection, and predictive 5-year organ health prognosis.
          </p>
        </div>

        {/* 3 Simple Workflow Steps */}
        <div className="workflow-steps-grid">
          <div className="workflow-step-card">
            <div className="step-num">1</div>
            <div className="step-content">
              <h4>Select or Upload Scan</h4>
              <p>Choose a clinical reference case below or upload your own DICOM / X-ray file.</p>
            </div>
          </div>

          <div className="workflow-step-card">
            <div className="step-num">2</div>
            <div className="step-content">
              <h4>Analyze in Workstation</h4>
              <p>Run DenseNet-121 DL inference to generate Grad-CAM heatmaps & bounding masks.</p>
            </div>
          </div>

          <div className="workflow-step-card">
            <div className="step-num">3</div>
            <div className="step-content">
              <h4>Forecast 5-Yr Prognosis</h4>
              <p>Measure biological organ age, project survival trajectories, and simulate treatments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Upload Dropzone Box */}
      <div className="upload-dropzone-box" onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".dcm,image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className="upload-icon-circle">
          <Upload size={26} />
        </div>
        <div className="upload-text-content">
          <h3>Upload DICOM or Radiograph File</h3>
          <p>Click here or drag and drop any medical radiograph (DICOM .dcm, PNG, JPG, WebP) to open a new examination</p>
        </div>
        <button className="btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
          <Upload size={15} />
          <span>Browse File</span>
        </button>
      </div>

      {/* Section Title: Patient Examination Queue */}
      <div className="hub-section-header">
        <div>
          <h3>Active Clinical Studies ({studies.length})</h3>
          <p>Select a patient examination to view scan, review AI findings, or inspect 5-year organ health</p>
        </div>
      </div>

      {/* Grid of Patient Study Cards */}
      <div className="patient-cards-grid">
        {studies.map((study) => {
          const isSelected = study.id === selectedStudy.id;
          const isCritical = study.severity === 'critical';
          const isHigh = study.severity === 'high';

          return (
            <div
              key={study.id}
              className={`patient-study-card glass-panel ${isSelected ? 'selected-border' : ''}`}
            >
              {/* Card Header */}
              <div className="card-top-row">
                <div className="patient-avatar-wrap">
                  <User size={18} />
                </div>
                <div className="patient-title-block">
                  <div className="patient-name">{study.metadata.patientName}</div>
                  <div className="patient-id-sub font-mono">
                    {study.metadata.patientId} • {study.metadata.patientAge} • {study.metadata.patientSex}
                  </div>
                </div>
                <div className="status-badge-wrap">
                  {isCritical ? (
                    <span className="badge badge-critical">Critical Finding</span>
                  ) : isHigh ? (
                    <span className="badge badge-high">High Priority</span>
                  ) : (
                    <span className="badge badge-normal">Normal Reference</span>
                  )}
                </div>
              </div>

              {/* Card Body: Thumbnail & Details */}
              <div className="card-body-row">
                <div className="card-img-preview" onClick={() => onOpenWorkstation(study)}>
                  <img src={study.thumbnailUrl} alt={study.title} />
                  <div className="img-hover-overlay">
                    <Activity size={20} />
                    <span>Open Viewer</span>
                  </div>
                </div>

                <div className="card-meta-details">
                  <div className="meta-pill-row">
                    <span className="meta-pill">{study.modality} ({study.metadata.viewPosition})</span>
                    <span className="meta-pill">{study.bodyPart}</span>
                    <span className="meta-pill font-mono">{study.metadata.studyDate}</span>
                  </div>

                  <div className="primary-finding-text">
                    <strong>Diagnosis:</strong> {study.primaryAnomaly}
                  </div>

                  <p className="card-short-desc">{study.shortDesc}</p>

                  <div className="kpi-mini-grid">
                    <div className="kpi-item">
                      <span className="kpi-lbl">Biological Organ Age</span>
                      <span className="kpi-val text-cyan">{study.prognosis.biologicalOrganAge} yrs</span>
                    </div>
                    <div className="kpi-item">
                      <span className="kpi-lbl">5-Yr Stability</span>
                      <span className="kpi-val text-emerald">{study.prognosis.fiveYearSurvivalRate}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="card-actions-footer">
                <button
                  className="btn-primary flex-1"
                  onClick={() => {
                    onSelectStudy(study);
                    onOpenWorkstation(study);
                  }}
                >
                  <Activity size={15} />
                  <span>Open in PACS Workstation</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    onSelectStudy(study);
                    onOpenPrognosis(study);
                  }}
                  title="View 5-Year Organ Health Trajectory"
                >
                  <Clock size={15} />
                  <span>5-Yr Prognosis</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .patient-hub-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 28px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .hub-welcome-banner {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          background: linear-gradient(135deg, rgba(14, 23, 42, 0.9) 0%, rgba(20, 32, 58, 0.85) 100%);
          border: 1px solid rgba(6, 182, 212, 0.25);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
        }

        .welcome-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--cyan-bright);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .welcome-text-wrap h2 {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
          background: linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .welcome-text-wrap p {
          color: var(--text-secondary);
          font-size: 0.92rem;
          max-width: 820px;
          line-height: 1.5;
        }

        .workflow-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .workflow-step-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(8, 14, 26, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }

        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.15);
          color: var(--cyan-bright);
          border: 1px solid rgba(6, 182, 212, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .step-content h4 {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .step-content p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .upload-dropzone-box {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px 24px;
          background: rgba(15, 23, 42, 0.5);
          border: 2px dashed rgba(6, 182, 212, 0.35);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-dropzone-box:hover {
          background: rgba(6, 182, 212, 0.08);
          border-color: var(--cyan-bright);
          transform: translateY(-1px);
        }

        .upload-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.15);
          color: var(--cyan-bright);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .upload-text-content {
          flex: 1;
        }

        .upload-text-content h3 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .upload-text-content p {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .hub-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 10px;
        }

        .hub-section-header h3 {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .hub-section-header p {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .patient-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .patient-study-card {
          display: flex;
          flex-direction: column;
          padding: 18px;
          border-radius: var(--radius-lg);
          gap: 14px;
          transition: all 0.2s ease;
        }

        .patient-study-card:hover {
          border-color: rgba(6, 182, 212, 0.4);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .patient-study-card.selected-border {
          border-color: var(--cyan-primary);
          box-shadow: 0 0 16px rgba(6, 182, 212, 0.25);
        }

        .card-top-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .patient-avatar-wrap {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cyan-bright);
        }

        .patient-title-block {
          flex: 1;
        }

        .patient-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
        }

        .patient-id-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .card-body-row {
          display: flex;
          gap: 16px;
        }

        .card-img-preview {
          width: 110px;
          height: 110px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #000;
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
          border: 1px solid var(--border-subtle);
        }

        .card-img-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: contrast(1.15);
        }

        .img-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(6, 182, 212, 0.75);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .card-img-preview:hover .img-hover-overlay {
          opacity: 1;
        }

        .card-meta-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .meta-pill-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .meta-pill {
          font-size: 0.68rem;
          padding: 2px 7px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          color: var(--text-secondary);
        }

        .primary-finding-text {
          font-size: 0.8rem;
          color: #f8fafc;
        }

        .card-short-desc {
          font-size: 0.74rem;
          color: var(--text-secondary);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .kpi-mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 4px;
          background: rgba(8, 14, 26, 0.4);
          padding: 6px 10px;
          border-radius: var(--radius-sm);
        }

        .kpi-item {
          display: flex;
          flex-direction: column;
        }

        .kpi-lbl {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .kpi-val {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .card-actions-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }

        .flex-1 {
          flex: 1;
        }

        @media (max-width: 1024px) {
          .workflow-steps-grid {
            grid-template-columns: 1fr;
          }
          .patient-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
