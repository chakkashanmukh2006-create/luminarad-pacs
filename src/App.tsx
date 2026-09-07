import React, { useState } from 'react';
import { CLINICAL_STUDIES } from './data/studies';
import type { ClinicalStudy } from './types';
import { Navbar } from './components/Navbar';
import { StudySelector } from './components/StudySelector';
import { DicomViewport } from './components/DicomViewport';
import { AnalysisPanel } from './components/AnalysisPanel';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  const [studies, setStudies] = useState<ClinicalStudy[]>(CLINICAL_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState<ClinicalStudy>(CLINICAL_STUDIES[0]);
  const [activeTab, setActiveTab] = useState<'findings' | 'prognosis' | 'metadata' | 'training'>('findings');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(true);

  const handleSelectStudy = (study: ClinicalStudy) => {
    setSelectedStudy(study);
    setHasAnalyzed(true);
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
  };

  return (
    <div className="app-shell">
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAnalyzing={isAnalyzing}
      />

      {/* Case Selector Strip */}
      <StudySelector
        studies={studies}
        selectedStudy={selectedStudy}
        onSelectStudy={handleSelectStudy}
        onUploadCustomImage={handleUploadCustomImage}
        onRunAnalysis={handleRunAnalysis}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Radiology Workstation Split Grid */}
      <main className="main-workspace-grid">
        {/* Left Side: DICOM Viewport Workstation */}
        <section className="viewport-column">
          <DicomViewport
            study={selectedStudy}
            isAnalyzing={isAnalyzing}
            hasAnalyzed={hasAnalyzed}
          />
        </section>

        {/* Right Side: Clinical Intelligence & Training Panel */}
        <section className="analysis-column">
          <AnalysisPanel
            study={selectedStudy}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hasAnalyzed={hasAnalyzed}
            isAnalyzing={isAnalyzing}
            onRunAnalysis={handleRunAnalysis}
          />
        </section>
      </main>

      <style>{`
        .app-shell {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg-darkest);
        }

        .main-workspace-grid {
          display: grid;
          grid-template-columns: minmax(360px, 44%) minmax(520px, 56%);
          flex: 1;
          overflow: hidden;
        }

        .viewport-column {
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border-subtle);
        }

        .analysis-column {
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        @media (max-width: 1280px) {
          .main-workspace-grid {
            grid-template-columns: 48% 52%;
          }
        }

        @media (max-width: 960px) {
          .app-shell {
            height: auto;
            overflow-y: auto;
          }
          .main-workspace-grid {
            display: flex;
            flex-direction: column;
            height: auto;
          }
          .viewport-column {
            height: 540px;
          }
          .analysis-column {
            height: auto;
            min-height: 800px;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
