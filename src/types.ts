export interface Discrepancy {
  type: string;
  description: string;
  severity: "High" | "Medium" | "Low";
}

export interface ThermalData {
  imageRef: string;
  hotspot: string;
  coldspot: string;
  tempDiff: string;
  analysis: string;
}

export interface ChecklistItem {
  question: string;
  selectedAnswer: string;
  status: "Pass" | "Warning" | "Fail";
  finding: string;
}

export interface AreaObservation {
  id: string;
  name: string;
  negativeObservation: string;
  positiveObservation: string;
  thermalData: ThermalData;
  photos: string[];
  sourcePhotos: string[];
  checklist?: ChecklistItem[]; // Point-wise MCQ checklist evaluation
}

export interface RecommendedAction {
  category: string;
  steps: string[];
}

export interface DDRReport {
  id: string;
  title: string;
  clientName: string;
  createdAt: string;
  metadata: {
    inspector: string;
    inspectionDate: string;
    propertyType: string;
    floors: string;
    previousStructuralAudit: string;
    previousRepairs: string;
  };
  discrepancies: Discrepancy[];
  propertySummary: string;
  areaObservations: AreaObservation[];
  rootCause: string;
  severityAssessment: {
    level: "High" | "Medium" | "Low";
    reasoning: string;
  };
  recommendedActions: RecommendedAction[];
  additionalNotes: string;
  missingInfo: string[];
}

