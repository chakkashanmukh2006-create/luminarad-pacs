import React from 'react';
import type { ClinicalStudy } from '../types';
import { FindingsTab } from './AnalysisTabs/FindingsTab';
import { PrognosisTab } from './AnalysisTabs/PrognosisTab';
import { DicomMetadataTab } from './AnalysisTabs/DicomMetadataTab';
import { TrainingConsoleTab } from './AnalysisTabs/TrainingConsoleTab';
import { Activity, Clock, Database, Terminal } from 'lucide-react';

interface AnalysisPanelProps {
  study: ClinicalStudy;
  activeTab: 'findings' | 'prognosis' | 'metadata' | 'training';
  setActiveTab: (tab: 'findings' | 'prognosis' | 'metadata' | 'training') => void;
  hasAnalyzed: boolean;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  study,
  activeTab,
  setActiveTab,
  hasAnalyzed,
  isAnalyzing,
  onRunAnalysis,
}) => {
  return (
    <aside className="analysis-sidebar-panel">
      {/* Tab Navigation Header */}
      <div className="panel-tab-bar">
        <button
          className={`panel-tab-btn ${activeTab === 'findings' ? 'active' : ''}`}
          onClick={() => setActiveTab('findings')}
        >
          <Activity size={14} />
          <span>Findings</span>
          {study.anomalyDetected && hasAnalyzed && <span className="tab-badge-alert">!</span>}
        </button>

        <button
          className={`panel-tab-btn ${activeTab === 'prognosis' ? 'active' : ''}`}
          onClick={() => setActiveTab('prognosis')}
        >
          <Clock size={14} />
          <span>5-Yr Prognosis</span>
        </button>

        <button
          className={`panel-tab-btn ${activeTab === 'metadata' ? 'active' : ''}`}
          onClick={() => setActiveTab('metadata')}
        >
          <Database size={14} />
          <span>DICOM Tags</span>
        </button>

        <button
          className={`panel-tab-btn tab-training ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          <Terminal size={14} />
          <span>Training Console</span>
          <span className="tab-pill-ai">AI</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="panel-content-body">
        {activeTab === 'findings' && (
          <FindingsTab
            study={study}
            hasAnalyzed={hasAnalyzed}
            isAnalyzing={isAnalyzing}
            onRunAnalysis={onRunAnalysis}
          />
        )}
        {activeTab === 'prognosis' && (
          <PrognosisTab
            study={study}
            hasAnalyzed={hasAnalyzed}
            onRunAnalysis={onRunAnalysis}
          />
        )}
        {activeTab === 'metadata' && <DicomMetadataTab study={study} />}
        {activeTab === 'training' && <TrainingConsoleTab />}
      </div>

      <style>{`
        .analysis-sidebar-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(10, 16, 32, 0.95);
          overflow: hidden;
        }

        .panel-tab-bar {
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(7, 12, 24, 0.95);
          padding: 0 8px;
          gap: 2px;
          overflow-x: auto;
          flex-shrink: 0;
        }

        .panel-tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 11px 12px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .panel-tab-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.02);
        }

        .panel-tab-btn.active {
          color: var(--cyan-bright);
          border-bottom-color: var(--cyan-bright);
          background: rgba(6, 182, 212, 0.05);
        }

        .panel-tab-btn.tab-training.active {
          color: #c084fc;
          border-bottom-color: var(--purple-ai);
          background: rgba(168, 85, 247, 0.08);
        }

        .tab-badge-alert {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f43f5e;
          color: #ffffff;
          font-size: 0.62rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tab-pill-ai {
          font-size: 0.6rem;
          background: rgba(168, 85, 247, 0.25);
          color: #e9d5ff;
          padding: 1px 4px;
          border-radius: 3px;
          font-family: var(--font-mono);
          font-weight: 700;
        }

        .panel-content-body {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </aside>
  );
};
