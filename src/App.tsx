import React, { useState } from 'react';
import { CLINICAL_STUDIES } from './data/studies';
import type { ClinicalStudy } from './types';
import { Navbar, type AppSection } from './components/Navbar';
import { StudySelector } from './components/StudySelector';
import { DicomViewport } from './components/DicomViewport';
import { FindingsTab } from './components/AnalysisTabs/FindingsTab';
import { PatientHubSection } from './components/Sections/PatientHubSection';
import { PrognosisStudioSection } from './components/Sections/PrognosisStudioSection';
import { TrainingStudioSection } from './components/Sections/TrainingStudioSection';
import { ReportSection } from './components/Sections/ReportSection';
import confetti from 'canvas-confetti';
import { Clock, Activity, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [studies, setStudies] = useState<ClinicalStudy[]>(CLINICAL_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState<ClinicalStudy>(CLINICAL_STUDIES[0]);
  const [activeSection, setActiveSection] = useState<AppSection>('patients');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(true);

  const handleSelectStudy = (study: ClinicalStudy) => {
    setSelectedStudy(study);
    setHasAnalyzed(true);
  };

  const handleSelectStudyById = (studyId: string) => {
    const found = studies.find((s) => s.id === studyId);
    if (found) {
      setSelectedStudy(found);
      setHasAnalyzed(true);
      setActiveSection('workstation');
    }
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasAnalyzed(true);
      if (selectedStudy.anomalyDetected) {
        confetti({
          particleCount: 40,
          spread: 45,
          origin: { y: 0.3, x: 0.4 },
        });
      }
    }, 1800);
  };

  const handleUploadCustomImage = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const newStudy: ClinicalStudy = {
      id: `UPLOAD-${Date.now()}`,
      title: `Custom Upload - ${file.name}`,
      shortDesc: `Imported clinical DICOM file: ${file.name}`,
      thumbnailUrl: objectUrl,
      imageUrl: objectUrl,
      modality: 'DX',
      bodyPart: 'CHEST',
      severity: 'high',
      anomalyDetected: true,
      primaryAnomaly: 'Suspicious Focal Density & Structural Asymmetry',
      affectedOrgan: 'Thoracic Cavity',
      confidenceScore: 0.941,
      metadata: {
        sopInstanceUID: `1.2.840.10008.5.1.4.1.1.1.${Date.now()}`,
        studyInstanceUID: `1.2.840.113619.2.55.3.${Date.now()}`,
        patientId: `IMP-${Math.floor(100000 + Math.random() * 900000)}`,
        patientName: 'IMPORTED^PATIENT',
        patientAge: '058Y',
        patientSex: 'O',
        studyDate: new Date().toISOString().split('T')[0],
        modality: 'DX',
        bodyPart: 'CHEST',
        viewPosition: 'AP',
        kvp: 120,
        exposureTime: 12,
        xrayTubeCurrent: 250,
        pixelSpacing: [0.143, 0.143],
        bitsAllocated: 16,
        bitsStored: 12,
        photometricInterpretation: 'MONOCHROME2',
        windowCenter: 40,
        windowWidth: 350,
        manufacturer: 'LOCAL CLIENT PACS CONNECTOR',
        institutionName: 'CUSTOM IMPORT RADIOLOGY SUITE',
      },
      pathologySummary: 'User-provided radiographic examination processed through DenseNet-121 feature maps. Identified suspicious focal density with elevated attention score.',
      findings: [
        'User-provided radiological scan loaded successfully.',
        'High-density focal opacity identified in thoracic field.',
        'Surrounding lung parenchyma evaluated for bilateral symmetry.',
      ],
      recommendations: [
        'Correlate with previous historical radiographs and clinical symptoms.',
        'Consider thin-slice helical CT for multi-planar reconstruction.',
      ],
      pathologyProbabilities: [
        { name: 'Solitary Nodule / Opacity', probability: 0.941, isAnomaly: true, category: 'neoplasm' },
        { name: 'Infiltration / Consolidation', probability: 0.421, isAnomaly: false, category: 'parenchymal' },
        { name: 'Pleural Effusion', probability: 0.182, isAnomaly: false, category: 'parenchymal' },
      ],
      boundingBoxes: [
        {
          x: 35,
          y: 35,
          width: 15,
          height: 15,
          label: 'Focal Opacity / Suspect Lesion',
          confidence: 0.941,
          diameterMm: 28.5,
          densityHu: 54,
        },
      ],
      heatmapCenter: {
        x: 0.42,
        y: 0.42,
        radius: 0.14,
        intensity: 0.95,
      },
      prognosis: {
        chronologicalAge: 58,
        biologicalOrganAge: 69,
        organName: 'Parenchymal Field',
        overallScore: 42,
        fiveYearSurvivalRate: 58,
        fiveYearComplicationRisk: 52,
        trajectory: [
          { year: 1, label: 'Year 1', baselineHealth: 70, withIntervention: 88, riskLevel: 'moderate' },
          { year: 2, label: 'Year 2', baselineHealth: 58, withIntervention: 85, riskLevel: 'high' },
          { year: 3, label: 'Year 3', baselineHealth: 49, withIntervention: 82, riskLevel: 'high' },
          { year: 4, label: 'Year 4', baselineHealth: 41, withIntervention: 80, riskLevel: 'critical' },
          { year: 5, label: 'Year 5', baselineHealth: 34, withIntervention: 78, riskLevel: 'critical' },
        ],
        biomarkers: [
          { name: 'Radiodensity Gradient', value: '+54 HU', status: 'warning', description: 'Soft tissue hyperdensity.' },
          { name: 'Spatial Margin Index', value: 'Irregular Margins', status: 'warning', description: 'Elevated likelihood of invasive tissue growth.' },
        ],
        interventions: [
          {
            id: 'ct_followup',
            name: 'High-Resolution Diagnostic Chest CT',
            impactDescription: 'Confirms cross-sectional dimensions and rule out vascular malformation.',
            healthBenefitPercent: 24,
            active: true,
          },
          {
            id: 'pulmonary_consult',
            name: 'Urgent Pulmonology Consultation',
            impactDescription: 'Spirometry and serial volumetric assessment.',
            healthBenefitPercent: 16,
            active: true,
          },
        ],
      },
    };

    setStudies((prev) => [newStudy, ...prev]);
    setSelectedStudy(newStudy);
    setHasAnalyzed(false);
    setActiveSection('workstation');
  };

  return (
    <div className="app-shell">
      {/* Top Global Navigation with Clean Sections */}
      <Navbar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isAnalyzing={isAnalyzing}
        selectedPatientName={selectedStudy.metadata.patientName}
      />

      {/* Main Section Content Area */}
      <div className="section-body-viewport">
        {/* 1. PATIENT CASES & ONBOARDING HUB */}
        {activeSection === 'patients' && (
          <PatientHubSection
            studies={studies}
            selectedStudy={selectedStudy}
            onSelectStudy={handleSelectStudy}
            onOpenWorkstation={(study) => {
              handleSelectStudy(study);
              setActiveSection('workstation');
            }}
            onOpenPrognosis={(study) => {
              handleSelectStudy(study);
              setActiveSection('prognosis');
            }}
            onUploadCustomImage={handleUploadCustomImage}
          />
        )}

        {/* 2. FOCUSED DIAGNOSTIC PACS WORKSTATION */}
        {activeSection === 'workstation' && (
          <div className="workstation-view-container">
            {/* Quick Study Switcher Strip */}
            <StudySelector
              studies={studies}
              selectedStudy={selectedStudy}
              onSelectStudy={handleSelectStudy}
              onUploadCustomImage={handleUploadCustomImage}
              onRunAnalysis={handleRunAnalysis}
              isAnalyzing={isAnalyzing}
            />

            {/* Split Screen: DICOM Canvas (Left) & Focused Findings (Right) */}
            <div className="workstation-split-grid">
              <div className="workstation-canvas-pane">
                <DicomViewport
                  study={selectedStudy}
                  isAnalyzing={isAnalyzing}
                  hasAnalyzed={hasAnalyzed}
                />
              </div>

              <div className="workstation-findings-pane">
                <div className="findings-pane-header">
                  <div className="header-title-row">
                    <Activity size={16} className="text-cyan" />
                    <span>DL Pathology Findings</span>
                  </div>
                  <button
                    className="btn-prognosis-jump"
                    onClick={() => setActiveSection('prognosis')}
                    title="Jump to 5-Year Organ Health Studio"
                  >
                    <Clock size={13} />
                    <span>5-Yr Prognosis</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div className="findings-scroll-content">
                  <FindingsTab
                    study={selectedStudy}
                    hasAnalyzed={hasAnalyzed}
                    isAnalyzing={isAnalyzing}
                    onRunAnalysis={handleRunAnalysis}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. 5-YEAR PROGNOSIS & LONGEVITY STUDIO */}
        {activeSection === 'prognosis' && (
          <PrognosisStudioSection
            studies={studies}
            selectedStudy={selectedStudy}
            onSelectStudy={handleSelectStudy}
            onOpenWorkstation={(study) => {
              handleSelectStudy(study);
              setActiveSection('workstation');
            }}
          />
        )}

        {/* 4. KAGGLE AI TRAINING STUDIO */}
        {activeSection === 'training' && (
          <TrainingStudioSection
            onSelectStudyById={(id) => {
              handleSelectStudyById(id);
              setActiveSection('workstation');
            }}
          />
        )}

        {/* 5. CLINICAL REPORT & DICOM TAGS */}
        {activeSection === 'report' && (
          <ReportSection
            studies={studies}
            selectedStudy={selectedStudy}
            onSelectStudy={handleSelectStudy}
            onOpenWorkstation={(study) => {
              handleSelectStudy(study);
              setActiveSection('workstation');
            }}
          />
        )}
      </div>

      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg-darkest);
        }

        .section-body-viewport {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        .workstation-view-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .workstation-split-grid {
          display: grid;
          grid-template-columns: minmax(400px, 54%) minmax(440px, 46%);
          flex: 1;
          overflow: hidden;
        }

        .workstation-canvas-pane {
          height: 100%;
          overflow: hidden;
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
        }

        .workstation-findings-pane {
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: rgba(10, 16, 32, 0.95);
        }

        .findings-pane-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(7, 12, 24, 0.95);
        }

        .header-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          font-weight: 700;
          color: #ffffff;
        }

        .btn-prognosis-jump {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          background: rgba(6, 182, 212, 0.12);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: var(--radius-sm);
          color: var(--cyan-bright);
          font-size: 0.74rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-prognosis-jump:hover {
          background: var(--cyan-primary);
          color: #000000;
        }

        .findings-scroll-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        @media (max-width: 960px) {
          .workstation-split-grid {
            display: flex;
            flex-direction: column;
            height: auto;
          }
          .workstation-canvas-pane {
            height: 520px;
          }
          .workstation-findings-pane {
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
