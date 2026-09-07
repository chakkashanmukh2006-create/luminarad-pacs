import React from 'react';
import { TrainingConsoleTab } from '../AnalysisTabs/TrainingConsoleTab';

interface TrainingStudioSectionProps {
  onSelectStudyById: (studyId: string) => void;
}

export const TrainingStudioSection: React.FC<TrainingStudioSectionProps> = ({ onSelectStudyById }) => {
  return (
    <div className="training-studio-section-container">
      <div className="training-studio-wrapper glass-panel">
        <TrainingConsoleTab onSelectStudyById={onSelectStudyById} />
      </div>

      <style>{`
        .training-studio-section-container {
          padding: 24px;
          max-width: 1300px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .training-studio-wrapper {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: rgba(10, 16, 32, 0.85);
        }
      `}</style>
    </div>
  );
};
