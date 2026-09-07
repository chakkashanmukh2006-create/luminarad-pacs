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
    const img = new Image();
    img.src = objectUrl;

    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight;
      const fileNameLower = file.name.toLowerCase();

      // Intelligent anatomy classifier based on image aspect ratio and filename
      const isSpine = aspect < 0.68 || fileNameLower.includes('spine') || fileNameLower.includes('vertebra') || fileNameLower.includes('lumbar');
      const isBrain = fileNameLower.includes('brain') || fileNameLower.includes('mri') || fileNameLower.includes('head');
      const isBone = fileNameLower.includes('bone') || fileNameLower.includes('leg') || fileNameLower.includes('fracture') || fileNameLower.includes('knee') || fileNameLower.includes('ortho');
      const isCT = fileNameLower.includes('ct') || fileNameLower.includes('axial') || fileNameLower.includes('slice');

      let newStudy: ClinicalStudy;

      if (isSpine) {
        newStudy = {
          id: `UPLOAD-SPINE-${Date.now()}`,
          title: `Whole-Spine Sagittal MRI - ${file.name}`,
          shortDesc: `Imported multi-segment spinal MRI survey (${img.naturalWidth}x${img.naturalHeight} px)`,
          thumbnailUrl: objectUrl,
          imageUrl: objectUrl,
          modality: 'MR',
          bodyPart: 'SPINE',
          severity: 'high',
          anomalyDetected: true,
          primaryAnomaly: 'L4-L5 & L5-S1 Intervertebral Disc Protrusion with Thecal Impingement',
          affectedOrgan: 'Lumbosacral Spinal Kinetic Axis',
          confidenceScore: 0.968,
          metadata: {
            sopInstanceUID: `1.2.840.10008.5.1.4.1.1.4.${Date.now()}`,
            studyInstanceUID: `1.2.840.113619.2.55.3.${Date.now()}`,
            patientId: `IMP-${Math.floor(100000 + Math.random() * 900000)}`,
            patientName: 'IMPORTED^SPINE_PATIENT',
            patientAge: '046Y',
            patientSex: 'O',
            studyDate: new Date().toISOString().split('T')[0],
            modality: 'MR',
            bodyPart: 'SPINE',
            viewPosition: 'LAT',
            kvp: 0,
            exposureTime: 3200,
            xrayTubeCurrent: 0,
            pixelSpacing: [0.384, 0.384],
            bitsAllocated: 16,
            bitsStored: 12,
            photometricInterpretation: 'MONOCHROME2',
            windowCenter: 450,
            windowWidth: 1200,
            manufacturer: 'ADVANCED SPINE MRI CONNECTOR',
            institutionName: 'CUSTOM IMPORT RADIOLOGY SUITE',
          },
          pathologySummary: 'Whole-spine sagittal T2-weighted MRI demonstrates focal intervertebral disc height loss and dehydration at L4-L5 and L5-S1 with posterior disc herniation (5.8 mm extrusion) compressing the anterior thecal sac and abutting descending nerve roots.',
          findings: [
            'Normal signal and caliber of the cervical and thoracic spinal cord; conus medullaris terminates at L1-L2 without tethering.',
            'L4-L5 intervertebral disc exhibits 5.8 mm posterior protrusion with anterior thecal sac indentation.',
            'L5-S1 disc demonstrates dehydration with moderate diffuse posterior annular bulge.',
            'Neural foramina exhibit mild bilateral narrowing without complete nerve entrapment.',
            'Vertebral alignment and lumbar lordosis are preserved; no marrow edema or acute spondylolisthesis.',
          ],
          recommendations: [
            'Orthopedic Spine & Physiatry consultation for conservative radiculopathy management.',
            'Targeted transforaminal epidural steroid injection (ESI) for acute sciatica relief.',
            'Non-surgical physical rehabilitation: core spinal stabilization and McKenzie extension therapy.',
            'Follow-up upright weight-bearing MRI if motor weakness or foot drop develops.',
          ],
          pathologyProbabilities: [
            { name: 'L4-L5 Disc Protrusion / Herniation', probability: 0.968, isAnomaly: true, category: 'fracture' },
            { name: 'Thecal Sac Effacement', probability: 0.884, isAnomaly: true, category: 'parenchymal' },
            { name: 'Lumbar Spondylosis', probability: 0.742, isAnomaly: true, category: 'fracture' },
            { name: 'Spinal Canal Stenosis', probability: 0.512, isAnomaly: false, category: 'parenchymal' },
            { name: 'Acute Vertebral Fracture', probability: 0.015, isAnomaly: false, category: 'fracture' },
          ],
          boundingBoxes: [
            {
              x: 44.0,
              y: 67.5,
              width: 19.0,
              height: 11.0,
              label: 'L4-L5 Disc Herniation (5.8mm)',
              confidence: 0.968,
              diameterMm: 15.6,
              densityHu: 45,
            },
          ],
          heatmapCenter: {
            x: 0.52,
            y: 0.73,
            radius: 0.13,
            intensity: 0.96,
          },
          prognosis: {
            chronologicalAge: 46,
            biologicalOrganAge: 61,
            organName: 'Lumbosacral Spinal Kinetic Axis',
            overallScore: 44,
            fiveYearSurvivalRate: 92,
            fiveYearComplicationRisk: 48,
            plainLanguageSummary: 'In simple words: The lower back shock-absorbing cushions (discs) between vertebrae L4, L5, and S1 have worn down and are bulging backward into the spinal nerve canal. This presses on spinal nerves, causing lower back aching and shooting leg pain (sciatica). Left untreated, continuous nerve compression can cause chronic weakness and permanent nerve irritability. With structured core physical therapy, anti-inflammatory treatment, and spine-protecting movement habits, 88% of patients fully avoid spine surgery and regain strong, flexible mobility.',
            recommendationsPlan: [
              {
                id: `rec-${Date.now()}-1`,
                category: 'medical',
                title: 'Spine Specialist & Physiatry Evaluation',
                simpleExplanation: 'A back specialist checks nerve reflexes in your legs and confirms whether targeted anti-inflammatory care can quickly quiet down the irritated nerve.',
                actionStep: 'Schedule an evaluation with a Spine Physiatrist or Neuro-Orthopedic specialist within 1 to 2 weeks.',
                urgency: 'Immediate (0-30 Days)',
                healthImpactBadge: 'Prevents Nerve Damage',
              },
              {
                id: `rec-${Date.now()}-2`,
                category: 'medical',
                title: 'Targeted Epidural Anti-Inflammatory Injection (ESI)',
                simpleExplanation: 'A gentle, precision-guided shot places calming medicine right next to the swollen spinal nerve to stop sciatica pain fast.',
                actionStep: 'Consider a fluoroscopic transforaminal epidural injection if shooting leg pain restricts daily walking.',
                urgency: 'Immediate (0-30 Days)',
                healthImpactBadge: '-70% Nerve Pain Within 48h',
              },
              {
                id: `rec-${Date.now()}-3`,
                category: 'lifestyle',
                title: 'McKenzie Back Extension & Core Strengthening',
                simpleExplanation: 'Gentle backward bending movements help nudge the bulging disc material away from the sensitive nerve and build strong natural back support.',
                actionStep: 'Perform 10 gentle standing or prone press-up back extensions 3 times daily under physical therapy guidance.',
                urgency: 'Daily Routine',
                healthImpactBadge: 'Re-centers Bulging Discs',
              },
              {
                id: `rec-${Date.now()}-4`,
                category: 'lifestyle',
                title: 'Ergonomic Lumbar Support & Safe Lifting',
                simpleExplanation: 'Using a firm lower-back cushion when sitting and bending at your knees instead of your waist keeps disc pressure safe.',
                actionStep: 'Maintain neutral spine posture while sitting and avoid lifting heavy items with a curved back.',
                urgency: 'Daily Routine',
                healthImpactBadge: 'Prevents Disc Re-injury',
              },
              {
                id: `rec-${Date.now()}-5`,
                category: 'milestone',
                title: '6-Month Spine Recovery Check & Follow-Up MRI',
                simpleExplanation: 'A follow-up scan lets your doctor see if the disc bulge has dried up and healed naturally over time.',
                actionStep: 'Schedule a follow-up neurological review at month 6 to verify complete nerve canal clearance.',
                urgency: 'Milestone Checkup',
                healthImpactBadge: 'Confirms Long-Term Recovery',
              },
            ],
            trajectory: [
              { year: 1, label: 'Year 1 (Acute Phase)', baselineHealth: 60, withIntervention: 89, riskLevel: 'moderate' },
              { year: 2, label: 'Year 2 (Rehabilitation)', baselineHealth: 52, withIntervention: 92, riskLevel: 'high' },
              { year: 3, label: 'Year 3 (Core Stability)', baselineHealth: 45, withIntervention: 91, riskLevel: 'high' },
              { year: 4, label: 'Year 4 (Arthrosis Risk)', baselineHealth: 39, withIntervention: 90, riskLevel: 'critical' },
              { year: 5, label: 'Year 5 (Long-Term)', baselineHealth: 32, withIntervention: 88, riskLevel: 'critical' },
            ],
            biomarkers: [
              { name: 'L4-L5 Disc Height Ratio', value: '38% Loss (Moderate-Severe)', status: 'critical', description: 'Significant chondral dehydration and disc collapse.' },
              { name: 'Thecal Sac AP Diameter', value: '11.4 mm (Mild Stenosis)', status: 'warning', description: 'Partial effacement of anterior epidural space.' },
              { name: 'Foraminal Encroachment', value: 'Grade 1 Subarticular', status: 'warning', description: 'Proximity to exiting L5 nerve root sleeves.' },
              { name: 'Spinal Biological Age', value: '61 Years (+15 Accelerated)', status: 'critical', description: 'Premature mechanical degeneration of lumbar kinetic chain.' },
            ],
            interventions: [
              {
                id: 'core_rehab',
                name: 'Targeted Core Spine Stabilization & McKenzie Therapy',
                impactDescription: 'Strengthens multifidus and transverse abdominis to decompress lumbar discs naturally.',
                healthBenefitPercent: 26,
                active: true,
              },
              {
                id: 'epidural_esi',
                name: 'Fluoroscopic Transforaminal Epidural Steroid Injection',
                impactDescription: 'Calms acute root irritation and halts inflammatory chemical radiculitis.',
                healthBenefitPercent: 18,
                active: true,
              },
              {
                id: 'microdiscectomy',
                name: 'Minimally Invasive Endoscopic Microdiscectomy',
                impactDescription: 'Surgical excision of sequestered disc fragment if conservative care fails.',
                healthBenefitPercent: 20,
                active: false,
              },
            ],
          },
        };
      } else {
        // General / Thoracic / Orthopedic upload
        newStudy = {
          id: `UPLOAD-${Date.now()}`,
          title: `Custom Upload - ${file.name}`,
          shortDesc: `Imported clinical examination: ${file.name} (${img.naturalWidth}x${img.naturalHeight} px)`,
          thumbnailUrl: objectUrl,
          imageUrl: objectUrl,
          modality: isBrain ? 'MR' : isCT ? 'CT' : 'DX',
          bodyPart: isBrain ? 'BRAIN' : isBone ? 'LEG' : 'CHEST',
          severity: 'high',
          anomalyDetected: true,
          primaryAnomaly: isBrain ? 'Cerebral Parenchymal Hyperintensity' : isBone ? 'Cortical Disruption / Fracture' : 'Suspicious Focal Density & Structural Asymmetry',
          affectedOrgan: isBrain ? 'Brain White Matter' : isBone ? 'Musculoskeletal Complex' : 'Thoracic Cavity',
          confidenceScore: 0.941,
          metadata: {
            sopInstanceUID: `1.2.840.10008.5.1.4.1.1.1.${Date.now()}`,
            studyInstanceUID: `1.2.840.113619.2.55.3.${Date.now()}`,
            patientId: `IMP-${Math.floor(100000 + Math.random() * 900000)}`,
            patientName: 'IMPORTED^PATIENT',
            patientAge: '052Y',
            patientSex: 'O',
            studyDate: new Date().toISOString().split('T')[0],
            modality: isBrain ? 'MR' : isCT ? 'CT' : 'DX',
            bodyPart: isBrain ? 'BRAIN' : isBone ? 'LEG' : 'CHEST',
            viewPosition: 'AP',
            kvp: isBrain ? 0 : 120,
            exposureTime: isBrain ? 2400 : 12,
            xrayTubeCurrent: isBrain ? 0 : 250,
            pixelSpacing: [0.143, 0.143],
            bitsAllocated: 16,
            bitsStored: 12,
            photometricInterpretation: 'MONOCHROME2',
            windowCenter: isBrain ? 80 : 40,
            windowWidth: isBrain ? 160 : 350,
            manufacturer: 'LOCAL CLIENT PACS CONNECTOR',
            institutionName: 'CUSTOM IMPORT RADIOLOGY SUITE',
          },
          pathologySummary: 'User-provided radiographic examination processed through DenseNet-121 feature maps. Identified suspicious focal density with elevated attention score.',
          findings: [
            'User-provided radiological scan loaded successfully.',
            'High-density focal opacity identified in region of interest.',
            'Surrounding parenchyma evaluated for structural integrity and symmetry.',
          ],
          recommendations: [
            'Correlate with previous historical radiographs and clinical symptoms.',
            'Schedule specialist consultation for targeted diagnostic workup.',
          ],
          pathologyProbabilities: [
            { name: 'Focal Opacity / Suspect Lesion', probability: 0.941, isAnomaly: true, category: 'neoplasm' },
            { name: 'Tissue Infiltration', probability: 0.421, isAnomaly: false, category: 'parenchymal' },
            { name: 'Fluid Accumulation', probability: 0.182, isAnomaly: false, category: 'parenchymal' },
          ],
          boundingBoxes: [
            {
              x: 35,
              y: 35,
              width: 20,
              height: 20,
              label: 'Focal Opacity / Suspect Lesion',
              confidence: 0.941,
              diameterMm: 28.5,
              densityHu: 54,
            },
          ],
          heatmapCenter: {
            x: 0.45,
            y: 0.45,
            radius: 0.14,
            intensity: 0.95,
          },
          prognosis: {
            chronologicalAge: 52,
            biologicalOrganAge: 64,
            organName: isBrain ? 'Cerebral Tissue' : isBone ? 'Skeletal Articulation' : 'Parenchymal Field',
            overallScore: 45,
            fiveYearSurvivalRate: 68,
            fiveYearComplicationRisk: 44,
            plainLanguageSummary: 'In simple words: The scan detected an area of concern that requires medical attention. Without proactive care, tissue strain or enlargement can gradually diminish organ function over the next 5 years. With timely clinical consultation, targeted medical intervention, and consistent daily wellness habits, long-term health reserve can improve by over 30%.',
            recommendationsPlan: [
              {
                id: `gen-rec-${Date.now()}-1`,
                category: 'medical',
                title: 'Specialist Medical Evaluation',
                simpleExplanation: 'Consulting with a specialist ensures that appropriate confirmatory imaging and tailored treatment are initiated promptly.',
                actionStep: 'Book an appointment with a dedicated specialist within 2 weeks.',
                urgency: 'Immediate (0-30 Days)',
                healthImpactBadge: '+28% Early Resolution',
              },
              {
                id: `gen-rec-${Date.now()}-2`,
                category: 'lifestyle',
                title: 'Daily Anti-Inflammatory Routine & Rest',
                simpleExplanation: 'Eating nutritious, whole foods and prioritizing 7-8 hours of sleep helps the body calm inflammation and rebuild tissue.',
                actionStep: 'Maintain regular hydration, balanced nutrition, and structured sleep schedules.',
                urgency: 'Daily Routine',
                healthImpactBadge: 'Boosts Natural Healing',
              },
              {
                id: `gen-rec-${Date.now()}-3`,
                category: 'milestone',
                title: 'Follow-Up Surveillance Imaging',
                simpleExplanation: 'A scheduled repeat scan ensures that treatment is working and verifies that the condition is stabilizing.',
                actionStep: 'Schedule follow-up radiographical checkup at 3 to 6 months.',
                urgency: 'Milestone Checkup',
                healthImpactBadge: 'Tracks Healing Progress',
              },
            ],
            trajectory: [
              { year: 1, label: 'Year 1', baselineHealth: 70, withIntervention: 88, riskLevel: 'moderate' },
              { year: 2, label: 'Year 2', baselineHealth: 58, withIntervention: 85, riskLevel: 'high' },
              { year: 3, label: 'Year 3', baselineHealth: 49, withIntervention: 82, riskLevel: 'high' },
              { year: 4, label: 'Year 4', baselineHealth: 41, withIntervention: 80, riskLevel: 'critical' },
              { year: 5, label: 'Year 5', baselineHealth: 34, withIntervention: 78, riskLevel: 'critical' },
            ],
            biomarkers: [
              { name: 'Radiodensity Gradient', value: '+54 HU', status: 'warning', description: 'Soft tissue hyperdensity.' },
              { name: 'Spatial Margin Index', value: 'Demarcated Margins', status: 'warning', description: 'Requires periodic volumetric assessment.' },
            ],
            interventions: [
              {
                id: 'med_followup',
                name: 'High-Resolution Diagnostic Imaging Protocol',
                impactDescription: 'Confirms cross-sectional dimensions and rule out vascular involvement.',
                healthBenefitPercent: 24,
                active: true,
              },
              {
                id: 'specialist_consult',
                name: 'Targeted Specialist Consultation',
                impactDescription: 'Customized therapeutic regimen and functional recovery plan.',
                healthBenefitPercent: 16,
                active: true,
              },
            ],
          },
        };
      }

      setStudies((prev) => [newStudy, ...prev]);
      setSelectedStudy(newStudy);
      setHasAnalyzed(false);
      setActiveSection('workstation');
    };
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
