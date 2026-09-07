import React from 'react';
import type { ClinicalStudy } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  ShieldCheck,
  Stethoscope,
  Maximize,
} from 'lucide-react';

interface FindingsTabProps {
  study: ClinicalStudy;
  hasAnalyzed: boolean;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}

export const FindingsTab: React.FC<FindingsTabProps> = ({
  study,
  hasAnalyzed,
  isAnalyzing,
  onRunAnalysis,
}) => {
  if (!hasAnalyzed) {
    return (
      <div className="tab-empty-state">
        <div className="empty-icon-wrap">
          <Activity size={32} className="empty-icon" />
        </div>
        <h3>Deep Learning Inference Ready</h3>
        <p>
          Click <strong>Run DL Analysis</strong> to execute DenseNet-121 feature extraction, generate Grad-CAM heatmaps, and detect organ anomalies.
        </p>
        <button className="btn-primary" onClick={onRunAnalysis} disabled={isAnalyzing}>
          <Activity size={16} />
          <span>Execute Voxel Analysis</span>
        </button>
      </div>
    );
  }

  const isCritical = study.severity === 'critical';
  const isHigh = study.severity === 'high';
  const isNormal = study.severity === 'normal';

  return (
    <div className="findings-tab-container">
      {/* Triage Banner */}
      <div
        className={`triage-banner ${
          isCritical ? 'critical' : isHigh ? 'high' : 'normal'
        }`}
      >
        <div className="triage-icon">
          {isCritical ? (
            <AlertCircle size={22} />
          ) : isHigh ? (
            <AlertTriangle size={22} />
          ) : (
            <CheckCircle2 size={22} />
          )}
        </div>
        <div className="triage-content">
          <div className="triage-headline">
            {isNormal ? 'NO ACUTE ABNORMALITIES' : `${study.severity.toUpperCase()} ALERT: ${study.primaryAnomaly}`}
          </div>
          <div className="triage-sub">
            Affected Region: <strong>{study.affectedOrgan}</strong> • DL Confidence: <strong>{(study.confidenceScore * 100).toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* Pathology Summary Box */}
      <div className="finding-section">
        <div className="section-title-wrap">
          <Stethoscope size={16} className="section-icon" />
          <h4>Diagnostic Impression & AI Summary</h4>
        </div>
        <div className="impression-box">
          <p>{study.pathologySummary}</p>
        </div>
      </div>

      {/* Multi-Label Anomaly Probabilities */}
      <div className="finding-section">
        <div className="section-title-wrap">
          <Activity size={16} className="section-icon" />
          <h4>Multi-Label Pathology Classification</h4>
        </div>
        <div className="probability-list">
          {study.pathologyProbabilities.map((item, idx) => {
            const pct = (item.probability * 100).toFixed(1);
            const isTop = item.isAnomaly;
            return (
              <div key={idx} className={`prob-row ${isTop ? 'highlight' : ''}`}>
                <div className="prob-label-row">
                  <span className="prob-name">
                    {item.name}
                    {isTop && <span className="anomaly-chip">ANOMALY</span>}
                  </span>
                  <span className="prob-pct">{pct}%</span>
                </div>
                <div className="prob-bar-track">
                  <div
                    className={`prob-bar-fill ${
                      item.probability > 0.75
                        ? 'critical'
                        : item.probability > 0.4
                        ? 'warning'
                        : 'normal'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Anomaly Biomarkers */}
      {study.boundingBoxes.length > 0 && (
        <div className="finding-section">
          <div className="section-title-wrap">
            <Maximize size={16} className="section-icon" />
            <h4>Detected Lesion / Structural Biomarkers</h4>
          </div>
          <div className="biomarker-cards-grid">
            {study.boundingBoxes.map((box, idx) => (
              <div key={idx} className="anomaly-metric-card">
                <div className="card-top">
                  <span className="metric-tag">{box.label}</span>
                  <span className="confidence-pill">{(box.confidence * 100).toFixed(1)}% match</span>
                </div>
                <div className="metric-specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">RECIST Diameter</span>
                    <span className="spec-value">{box.diameterMm} mm</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Radiodensity</span>
                    <span className="spec-value">{box.densityHu} HU</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Coordinates</span>
                    <span className="spec-value font-mono">
                      [{box.x}%, {box.y}%]
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Radiological Findings */}
      <div className="finding-section">
        <div className="section-title-wrap">
          <FileText size={16} className="section-icon" />
          <h4>Radiological Evidence List</h4>
        </div>
        <ul className="findings-bullet-list">
          {study.findings.map((item, idx) => (
            <li key={idx} className="finding-bullet-item">
              <span className="bullet-indicator" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Clinical Next Steps */}
      <div className="finding-section">
        <div className="section-title-wrap">
          <ShieldCheck size={16} className="section-icon text-cyan" />
          <h4>Recommended Clinical Interventions & Orders</h4>
        </div>
        <div className="recommendations-container">
          {study.recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation-item">
              <div className="rec-step-number">{idx + 1}</div>
              <div className="rec-text">{rec}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .findings-tab-container {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 16px;
        }

        .tab-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 60px 24px;
          gap: 16px;
        }

        .empty-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cyan-bright);
        }

        .tab-empty-state h3 {
          font-size: 1.15rem;
          font-weight: 700;
        }

        .tab-empty-state p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          max-width: 360px;
          line-height: 1.5;
        }

        .triage-banner {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          border: 1px solid;
        }

        .triage-banner.critical {
          background: rgba(244, 63, 94, 0.12);
          border-color: rgba(244, 63, 94, 0.4);
          color: #fca5a5;
        }
        .triage-banner.critical .triage-icon {
          color: #f43f5e;
        }

        .triage-banner.high {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.4);
          color: #fde68a;
        }
        .triage-banner.high .triage-icon {
          color: #f59e0b;
        }

        .triage-banner.normal {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.4);
          color: #a7f3d0;
        }
        .triage-banner.normal .triage-icon {
          color: #10b981;
        }

        .triage-headline {
          font-weight: 800;
          font-size: 0.92rem;
          letter-spacing: -0.2px;
        }

        .triage-sub {
          font-size: 0.78rem;
          opacity: 0.9;
          margin-top: 2px;
        }

        .finding-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
        }

        .section-title-wrap h4 {
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }

        .section-icon {
          color: var(--cyan-bright);
        }

        .impression-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-left: 3px solid var(--cyan-primary);
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          line-height: 1.5;
          color: #e2e8f0;
        }

        .probability-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          padding: 12px;
          border-radius: var(--radius-md);
        }

        .prob-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .prob-row.highlight .prob-name {
          color: #fca5a5;
          font-weight: 700;
        }

        .prob-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.78rem;
        }

        .prob-name {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .anomaly-chip {
          background: rgba(244, 63, 94, 0.25);
          color: #fb7185;
          font-size: 0.62rem;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 3px;
          letter-spacing: 0.5px;
        }

        .prob-pct {
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--text-secondary);
        }

        .prob-bar-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
          overflow: hidden;
        }

        .prob-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .prob-bar-fill.critical {
          background: linear-gradient(90deg, #f43f5e, #e11d48);
          box-shadow: 0 0 8px rgba(244, 63, 94, 0.5);
        }

        .prob-bar-fill.warning {
          background: linear-gradient(90deg, #f59e0b, #d97706);
        }

        .prob-bar-fill.normal {
          background: linear-gradient(90deg, #06b6d4, #0284c7);
        }

        .biomarker-cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .anomaly-metric-card {
          background: rgba(18, 27, 49, 0.8);
          border: 1px solid rgba(244, 63, 94, 0.3);
          border-radius: var(--radius-md);
          padding: 10px 12px;
        }

        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .metric-tag {
          font-size: 0.8rem;
          font-weight: 700;
          color: #fca5a5;
        }

        .confidence-pill {
          background: rgba(244, 63, 94, 0.18);
          color: #f43f5e;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .metric-specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .spec-item {
          display: flex;
          flex-direction: column;
        }

        .spec-label {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .spec-value {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .font-mono {
          font-family: var(--font-mono);
        }

        .findings-bullet-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .finding-bullet-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .bullet-indicator {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--cyan-bright);
          margin-top: 6px;
          flex-shrink: 0;
        }

        .recommendations-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .recommendation-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(6, 182, 212, 0.06);
          border: 1px solid rgba(6, 182, 212, 0.15);
          border-radius: var(--radius-sm);
        }

        .rec-step-number {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.2);
          color: var(--cyan-bright);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .rec-text {
          font-size: 0.8rem;
          color: #e2e8f0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
