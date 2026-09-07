export type Modality = 'DX' | 'CR' | 'CT' | 'MR';
export type BodyPart = 'CHEST' | 'LEG' | 'EXTREMITY' | 'KNEE' | 'SPINE' | 'BRAIN' | 'ABDOMEN';
export type Severity = 'critical' | 'high' | 'moderate' | 'normal';

export interface BoundingBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
  confidence: number; // 0-1
  diameterMm: number;
  densityHu: number; // Hounsfield units
}

export interface PathologyProbability {
  name: string;
  probability: number; // 0-1
  isAnomaly: boolean;
  category: 'neoplasm' | 'fracture' | 'cardiac' | 'parenchymal' | 'infectious';
}

export interface TrajectoryPoint {
  year: number;
  label: string;
  baselineHealth: number; // 0 - 100
  withIntervention: number; // 0 - 100
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

export interface PrognosisData {
  chronologicalAge: number;
  biologicalOrganAge: number;
  organName: string;
  overallScore: number; // 0 - 100
  fiveYearSurvivalRate: number; // 0 - 100
  fiveYearComplicationRisk: number; // 0 - 100
  trajectory: TrajectoryPoint[];
  biomarkers: {
    name: string;
    value: string;
    status: 'optimal' | 'warning' | 'critical';
    description: string;
  }[];
  interventions: {
    id: string;
    name: string;
    impactDescription: string;
    healthBenefitPercent: number;
    active: boolean;
  }[];
}

export interface DicomMetadata {
  sopInstanceUID: string;
  studyInstanceUID: string;
  patientId: string;
  patientName: string;
  patientAge: string;
  patientSex: 'M' | 'F' | 'O';
  studyDate: string;
  modality: Modality;
  bodyPart: BodyPart;
  viewPosition: 'AP' | 'PA' | 'LAT';
  kvp: number;
  exposureTime: number; // ms
  xrayTubeCurrent: number; // mA
  pixelSpacing: [number, number]; // [row, col] in mm
  bitsAllocated: number;
  bitsStored: number;
  photometricInterpretation: 'MONOCHROME1' | 'MONOCHROME2';
  windowCenter: number;
  windowWidth: number;
  manufacturer: string;
  institutionName: string;
}

export interface ClinicalStudy {
  id: string;
  title: string;
  shortDesc: string;
  thumbnailUrl: string;
  imageUrl: string;
  modality: Modality;
  bodyPart: BodyPart;
  metadata: DicomMetadata;
  pathologySummary: string;
  severity: Severity;
  anomalyDetected: boolean;
  primaryAnomaly: string;
  affectedOrgan: string;
  confidenceScore: number;
  findings: string[];
  recommendations: string[];
  pathologyProbabilities: PathologyProbability[];
  boundingBoxes: BoundingBox[];
  heatmapCenter: { x: number; y: number; radius: number; intensity: number };
  prognosis: PrognosisData;
}

export interface KaggleSample {
  id: string;
  studyId: string;
  filename: string;
  label: string;
  patientId: string;
  thumbnailUrl: string;
}

export interface KaggleDataset {
  id: string;
  name: string;
  kaggleHandle: string;
  totalImages: string;
  patientsCount: string;
  downloadSize: string;
  license: string;
  modalities: string[];
  classes: string[];
  classDistribution: { className: string; percentage: number }[];
  description: string;
  recommendedBackbones: string[];
  sampleStudies?: KaggleSample[];
}

export interface EpochMetric {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAcc: number;
  valAcc: number;
  auroc: number;
  f1Score: number;
}

export interface ConfusionMatrixData {
  truePositive: number;
  falsePositive: number;
  falseNegative: number;
  trueNegative: number;
  precision: number;
  recall: number;
  f1: number;
}
