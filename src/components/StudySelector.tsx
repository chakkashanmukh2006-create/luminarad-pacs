import React, { useRef } from 'react';
import type { ClinicalStudy } from '../types';
import { Upload, Crosshair, Sparkles } from 'lucide-react';

interface StudySelectorProps {
  studies: ClinicalStudy[];
  selectedStudy: ClinicalStudy;
  onSelectStudy: (study: ClinicalStudy) => void;
  onUploadCustomImage: (file: File) => void;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export const StudySelector: React.FC<StudySelectorProps> = ({
  studies,
  selectedStudy,
  onSelectStudy,
  onUploadCustomImage,
  onRunAnalysis,
  isAnalyzing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustomImage(e.target.files[0]);
    }
  };

  return (
    <div className="study-selector-bar">
      <div className="studies-scroll-container">
        <span className="case-library-label">STUDIES:</span>
        <div className="study-chips-list">
          {studies.map((study) => {
            const isSelected = study.id === selectedStudy.id;
            return (
              <button
                key={study.id}
                onClick={() => onSelectStudy(study)}
                className={`study-card-chip ${isSelected ? 'selected' : ''}`}
                title={study.shortDesc}
              >
                <div className="chip-thumbnail-wrap">
                  <img src={study.thumbnailUrl} alt={study.title} className="chip-thumbnail" />
                  {study.anomalyDetected ? (
                    <span className="chip-alert-indicator" title="Pathological Anomaly Detected" />
                  ) : (
                    <span className="chip-normal-indicator" title="Normal Scan" />
                  )}
                </div>
                <div className="chip-info">
                  <div className="chip-header">
                    <span className="chip-modality">{study.modality} • {study.bodyPart}</span>
                    <span className="chip-id">{study.metadata.patientId}</span>
                  </div>
                  <div className="chip-patient">{study.metadata.patientName}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom DICOM / Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".dcm,image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          className="btn-upload-dicom"
          onClick={() => fileInputRef.current?.click()}
          title="Upload local DICOM or Radiograph file"
        >
          <Upload size={14} />
          <span>Upload DICOM</span>
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="analyze-action-wrap">
        <button
          className={`btn-analyze ${isAnalyzing ? 'analyzing' : ''}`}
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Crosshair size={18} className="spin-slow" />
              <span>Analyzing Voxels...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Run DL Analysis</span>
            </>
          )}
        </button>
      </div>

      <style>{`
        .study-selector-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 24px;
          background: rgba(10, 16, 32, 0.95);
          border-bottom: 1px solid var(--border-subtle);
          gap: 16px;
        }

        .studies-scroll-container {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 2px;
          flex: 1;
        }

        .case-library-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-muted);
          letter-spacing: 1px;
          font-weight: 700;
        }

        .study-chips-list {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .study-card-chip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 12px 5px 6px;
          background: rgba(20, 31, 56, 0.4);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .study-card-chip:hover {
          background: rgba(30, 47, 85, 0.6);
          border-color: rgba(6, 182, 212, 0.3);
        }

        .study-card-chip.selected {
          background: rgba(6, 182, 212, 0.12);
          border-color: var(--cyan-primary);
          box-shadow: 0 0 14px rgba(6, 182, 212, 0.2);
        }

        .chip-thumbnail-wrap {
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 4px;
          overflow: hidden;
          background: #000;
          flex-shrink: 0;
        }

        .chip-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: contrast(1.2);
        }

        .chip-alert-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f43f5e;
          box-shadow: 0 0 6px #f43f5e;
        }

        .chip-normal-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }

        .chip-info {
          display: flex;
          flex-direction: column;
        }

        .chip-header {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .chip-modality {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: var(--cyan-bright);
          font-weight: 600;
        }

        .chip-id {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .chip-patient {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-primary);
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-upload-dicom {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px dashed rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .btn-upload-dicom:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--cyan-bright);
          color: #ffffff;
        }

        .analyze-action-wrap {
          display: flex;
          align-items: center;
        }

        .btn-analyze {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%);
          color: #ffffff;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 700;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(6, 182, 212, 0.35);
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-analyze:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.55);
        }

        .btn-analyze.analyzing {
          background: linear-gradient(135deg, #e11d48 0%, #9f1239 100%);
          box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);
          cursor: wait;
        }

        .spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
