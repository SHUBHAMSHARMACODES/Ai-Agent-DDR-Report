import React, { useState, useRef } from "react";
import { 
  Sparkles, Terminal, FileText, Upload, Cpu, ArrowRight, ShieldCheck, 
  AlertCircle, FileSearch, FileUp, FileCheck, Eye, EyeOff, X, RefreshCw 
} from "lucide-react";
import { DDRReport } from "../types";

interface ReportStudioProps {
  onReportGenerated: (report: DDRReport) => void;
}

// Complete raw transcripts from the provided sample reports to allow instant testing
const SAMPLE_INSPECTION_TEXT = `
=============================================
URBANROOF SITE INSPECTION REPORT - FLAT 103
=============================================
Inspection Score: 85.71% | Flagged Items: 1
Floors: 11
Property Type: Flat
Inspection Date: 27.09.2022 14:28 IST
Inspected By: Krushna & Mahesh
Previous Structural Audit: No
Previous Repairs: No

IMPACTED AREAS & PATHOLOGY:
---------------------------------------------
Impacted Area 1:
- Negative side Description: Hall Skirting level Dampness
- Positive side Description: Common Bathroom tile hollowness
- Photos: Photo 1, Photo 2, Photo 3, Photo 4, Photo 5, Photo 6, Photo 7
- Positive Side Photos: Photo 8, Photo 9, Photo 10, Photo 11

Impacted Area 2:
- Negative side Description: Bedroom Skirting level Dampness
- Positive side Description: Common Bathroom tile hollowness
- Photos: Photo 12, Photo 13, Photo 14
- Positive Side Photos: Photo 15, Photo 16, Photo 17, Photo 18, Photo 19

Impacted Area 3:
- Negative side Description: Master bedroom Skirting level Dampness
- Positive side Description: MB Bathroom tile hollowness
- Photos: Photo 20, Photo 21, Photo 22, Photo 23, Photo 24, Photo 25
- Positive Side Photos: Photo 26, Photo 27, Photo 28, Photo 29, Photo 30

Impacted Area 4:
- Negative side Description: Kitchen Skirting level Dampness
- Positive side Description: Master bedroom bathroom (tile joints open)
- Photos: Photo 31, Photo 32
- Positive Side Photos: Photo 33, Photo 34, Photo 35, Photo 36, Photo 37

Impacted Area 5:
- Negative side Description: Master bedroom wall dampness (peeling plaster, efflorescence)
- Positive side Description: External wall crack and Duct Issue
- Photos: Photo 38, Photo 39, Photo 40, Photo 41
- Positive Side Photos: Photo 42, Photo 43, Photo 44, Photo 45, Photo 46, Photo 47, Photo 48

Impacted Area 6:
- Negative side Description: Parking Area seepage (Slab dampness below Flat 103)
- Positive side Description: Common Bathroom tile hollowness and plumbing issue
- Photos: Photo 49, Photo 50, Photo 51, Photo 52
- Positive Side Photos: Photo 53, Photo 54, Photo 55, Photo 56, Photo 57

Impacted Area 7:
- Negative side Description: Common Bathroom Ceiling Dampness (mild deterioration)
- Positive side Description: Flat no 203 tile joint open and outlet Leakage
- Photos: Photo 58
- Positive Side Photos: Photo 59, Photo 60, Photo 61, Photo 62, Photo 63, Photo 64

=============================================
SUMMARY CHECKLIST AND STRUCTURE DATA
=============================================
RCC Columns/Beams: Moderate cracks observed (1mm to 3mm)
Rust marks on RCC members: N/A
External wall cracks: Moderate (cracks more than 2mm observed on external walls)
Algae, fungus, moss: Moderate on external walls
Existing paint: Semi-acrylic emulsion (Not sure of manufacturer)
Plaster condition: Loose/hollow sound on external plaster surfaces, patchwork required.
`;

const SAMPLE_THERMAL_TEXT = `
=============================================
THERMAL SCANNING RECORDS (GTC 400 C Professional)
=============================================
Date: 27/09/2022
Device Emissivity: 0.94 | Reflected Temp: 23 °C

THERMAL IMAGES MAPPING TO DAMAGE ZONES:
---------------------------------------------
1. Image: RB02380X.JPG
   - Area: Hall Skirting Level
   - Hotspot: 28.8 °C (Dry upper wall)
   - Coldspot: 23.4 °C (Active moisture core)
   - Delta T: 5.4 °C (Severe sub-surface dampness)

2. Image: RB02386X.JPG
   - Area: Common Bedroom Skirting Level
   - Hotspot: 27.4 °C (Dry reference)
   - Coldspot: 22.4 °C (Active moisture zone)
   - Delta T: 5.0 °C (Dampness confirmed)

3. Image: RB02395X.JPG
   - Area: Master Bedroom Skirting & Ceiling Corner
   - Hotspot: 27.0 °C (Dry upper shell)
   - Coldspot: 22.0 °C (Evaporative core)
   - Delta T: 5.0 °C (Moisture pooling active)

4. Image: RB02402X.JPG
   - Area: Kitchen Skirting
   - Hotspot: 25.7 °C (Dry wall reference)
   - Coldspot: 20.7 °C (Moisture leak)
   - Delta T: 5.0 °C (Capillary ascent)

5. Image: RB02403X.JPG
   - Area: Master Bedroom Wall & External Crack Area
   - Hotspot: 25.5 °C (Dry wall reference)
   - Coldspot: 20.5 °C (Active rain ingress)
   - Delta T: 5.0 °C (Infiltration confirmed)

6. Image: RB02404X.JPG
   - Area: Parking Ceiling below Common Bathroom
   - Hotspot: 25.8 °C (Dry deck slab)
   - Coldspot: 20.8 °C (Saturated percolation zone)
   - Delta T: 5.0 °C (Gravity leakage verified)

7. Image: RB02392X.JPG
   - Area: Common Bathroom Ceiling
   - Hotspot: 25.8 °C (Dry upper zone)
   - Coldspot: 20.8 °C (Active ceiling seepage from Flat 203)
   - Delta T: 5.0 °C (Gravity flow verified)
`;

interface ParsedFile {
  name: string;
  pages: number;
  words: number;
  size: string;
}

export const ReportStudio: React.FC<ReportStudioProps> = ({ onReportGenerated }) => {
  const [title, setTitle] = useState("Main Detailed Diagnostic Report (DDR) - Flat 103");
  const [inspectionText, setInspectionText] = useState("");
  const [thermalText, setThermalText] = useState("");
  
  const [inputModeInspection, setInputModeInspection] = useState<"file" | "manual">("file");
  const [inputModeThermal, setInputModeThermal] = useState<"file" | "manual">("file");
  
  const [inspectionFile, setInspectionFile] = useState<ParsedFile | null>(null);
  const [thermalFile, setThermalFile] = useState<ParsedFile | null>(null);
  
  const [isParsingInspection, setIsParsingInspection] = useState(false);
  const [isParsingThermal, setIsParsingThermal] = useState(false);
  
  const [showInspectionText, setShowInspectionText] = useState(false);
  const [showThermalText, setShowThermalText] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inspectionInputRef = useRef<HTMLInputElement>(null);
  const thermalInputRef = useRef<HTMLInputElement>(null);

  // Load sample texts on click
  const loadSamples = () => {
    setInspectionText(SAMPLE_INSPECTION_TEXT.trim());
    setThermalText(SAMPLE_THERMAL_TEXT.trim());
    setInputModeInspection("file");
    setInputModeThermal("file");
    setInspectionFile({
      name: "Sample_Inspection_Form.pdf",
      pages: 3,
      words: SAMPLE_INSPECTION_TEXT.split(/\s+/).filter(Boolean).length,
      size: "145 KB"
    });
    setThermalFile({
      name: "Sample_Thermal_Data_GTC400C.pdf",
      pages: 2,
      words: SAMPLE_THERMAL_TEXT.split(/\s+/).filter(Boolean).length,
      size: "98 KB"
    });
    setShowInspectionText(false);
    setShowThermalText(false);
    setErrorMsg(null);
  };

  const clearForm = () => {
    setInspectionText("");
    setThermalText("");
    setInspectionFile(null);
    setThermalFile(null);
    setInputModeInspection("file");
    setInputModeThermal("file");
    setShowInspectionText(false);
    setShowThermalText(false);
    setErrorMsg(null);
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  // Browser-side PDF extraction using PDF.js loaded from CDN
  const handlePdfFile = async (file: File, type: "inspection" | "thermal") => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please upload a valid PDF file.");
      return;
    }

    if (type === "inspection") {
      setIsParsingInspection(true);
      setInspectionFile(null);
    } else {
      setIsParsingThermal(true);
      setThermalFile(null);
    }
    setErrorMsg(null);

    const fileSizeStr = (file.size / 1024).toFixed(0) + " KB";

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            throw new Error("Could not read file buffer.");
          }

          const pdfjsLib = (window as any).pdfjsLib;
          if (!pdfjsLib) {
            throw new Error("PDF.js library is not loaded. Please verify your connection or refresh the page.");
          }

          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          
          let extractedText = "";
          let totalWords = 0;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
            totalWords += pageText.split(/\s+/).filter(Boolean).length;
          }

          if (extractedText.trim().length === 0) {
            extractedText = `--- Empty Page content ---\nNo select-able text layer found in this PDF file. It might be a scanned image PDF. Please verify its content.`;
          }

          if (type === "inspection") {
            setInspectionText(extractedText.trim());
            setInspectionFile({
              name: file.name,
              pages: pdf.numPages,
              words: totalWords,
              size: fileSizeStr
            });
            setShowInspectionText(true);
          } else {
            setThermalText(extractedText.trim());
            setThermalFile({
              name: file.name,
              pages: pdf.numPages,
              words: totalWords,
              size: fileSizeStr
            });
            setShowThermalText(true);
          }
        } catch (innerErr: any) {
          console.error("Internal PDF extraction error:", innerErr);
          setErrorMsg(`PDF parsing error: ${innerErr.message || innerErr}`);
        } finally {
          if (type === "inspection") setIsParsingInspection(false);
          else setIsParsingThermal(false);
        }
      };

      reader.onerror = () => {
        setErrorMsg("FileReader reading error.");
        if (type === "inspection") setIsParsingInspection(false);
        else setIsParsingThermal(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error("Outer PDF upload error:", err);
      setErrorMsg(`Failed to initiate file reader: ${err.message || err}`);
      if (type === "inspection") setIsParsingInspection(false);
      else setIsParsingThermal(false);
    }
  };

  const triggerGeneration = async (simulate = false) => {
    if (!inspectionText.trim() || !thermalText.trim()) {
      setErrorMsg("Please upload both PDFs or pre-load sample document data before merging.");
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    setLogs([]);
    setProgress(5);

    // Simulated multi-stage AI workflow pipeline logs
    const stages = [
      { delay: 800, progress: 15, log: "Initializing structural diagnosis pipeline context window..." },
      { delay: 1800, progress: 32, log: `Analyzing Document 1: ${inspectionFile?.name || "Uploaded Site Report"}... Extracted ${inspectionFile?.pages} pages of observations.` },
      { delay: 3000, progress: 54, log: `Correlating Document 2: ${thermalFile?.name || "Thermal Scanning"}... Extracted ${thermalFile?.pages} pages of thermal camera points.` },
      { delay: 4200, progress: 70, log: "Running cross-document conflict scanner: evaluating property type address, dates and floor conflicts." },
      { delay: 5500, progress: 85, log: "Gemini Model synthesizing logical area-by-area dampness mapping and building pathogies." },
      { delay: 6800, progress: 95, log: "Structuring valid DDR JSON output compliant with non-destructive testing guidelines." },
    ];

    stages.forEach((stage) => {
      setTimeout(() => {
        addLog(stage.log);
        setProgress(stage.progress);
      }, stage.delay);
    });

    const totalDuration = 8000;
    setTimeout(async () => {
      if (simulate) {
        addLog("AI Generation successfully bypassed (offline simulation model active).");
        addLog("DDR document generated and compiled with full structural mapping.");
        
        const generated: DDRReport = {
          id: "sim-" + Math.random().toString(36).substr(2, 9),
          title: title || "Diagnostic Report",
          clientName: "Flat No-8/63",
          createdAt: new Date().toISOString(),
          metadata: {
            inspector: "AI Diagnostic Engine (Mahesh & Mahesh)",
            inspectionDate: "27.09.2022 (Inspection Form) / 03.01.2023 (DDR)",
            propertyType: "Flat / Row House Conflict",
            floors: "11 (Flat) / 1 (Row House) Conflict",
            previousStructuralAudit: "No",
            previousRepairs: "No",
          },
          discrepancies: [
            {
              type: "Property Type Address Mismatch",
              description: "PDF 1 mentions Flat No 103, 11 floors in Yamuna CHS. PDF 3 records are prepared for Flat No-8/63, but lists address in Pune as RH-69 Row House (1 floor). Highlighted as conflicting facts.",
              severity: "High"
            }
          ],
          propertySummary: "DDR compiled via AI simulation. This covers detailed capillary leakage analysis at Flat 103 skirting levels. Sources are traced back to wet tiles and joint line structural breakdown.",
          areaObservations: [
            {
              id: "area-1",
              name: "Hallway skirting level",
              negativeObservation: "Observed active rising dampness and blistering paint at the skirting level of the Hallway.",
              positiveObservation: "Identified hollow tiles, open gaps and blackish dirt accumulation in the tile joints of the Common Bathroom directly adjacent.",
              thermalData: {
                imageRef: "RB02380X.JPG",
                hotspot: "28.8°C",
                coldspot: "23.4°C",
                tempDiff: "5.4°C",
                analysis: "High thermal delta verifies surface evaporation cooling due to water accumulation below tile bed."
              },
              photos: ["Photo 1", "Photo 2"],
              sourcePhotos: ["Photo 8", "Photo 9"],
              checklist: [
                {
                  question: "Visual Dampness Level",
                  selectedAnswer: "Severe Rising Dampness (Height ~300mm)",
                  status: "Fail",
                  finding: "Heavy dampness patches detected along hallway skirting line."
                },
                {
                  question: "Paint & Plaster Condition",
                  selectedAnswer: "Flaking & Blistering",
                  status: "Warning",
                  finding: "Paint is peeling off with white efflorescence salt accumulation."
                }
              ]
            },
            {
              id: "area-5",
              name: "Master Bedroom External Wall",
              negativeObservation: "Dampness and efflorescence on Master Bedroom partition walls.",
              positiveObservation: "Cracks observed on exterior building wall near ducts.",
              thermalData: {
                imageRef: "RB02403X.JPG",
                hotspot: "25.5°C",
                coldspot: "20.5°C",
                tempDiff: "5.0°C",
                analysis: "Thermal imagery highlights structural cold cores, confirming facade rain ingress."
              },
              photos: ["Photo 38", "Photo 39"],
              sourcePhotos: ["Photo 42", "Photo 43"],
              checklist: [
                {
                  question: "Exterior Crack Severity",
                  selectedAnswer: "Severe Cracks (Width >2mm)",
                  status: "Fail",
                  finding: "Visible external masonry plaster cracks near the master bedroom corner."
                },
                {
                  question: "Thermal Ingress Telemetry",
                  selectedAnswer: "Facade Leak Verified",
                  status: "Fail",
                  finding: "Active external rainwater seepage confirmed by cooling footprint at crack coordinates."
                }
              ]
            }
          ],
          rootCause: "Water enters below non-waterproofed bathroom tiles, traveling laterally to hallway and bedroom skirtings. Facade rainwater penetrates outer walls via external hairline cracks.",
          severityAssessment: {
            level: "High",
            reasoning: "Persistent moisture path raises risks of RCC rebar corrosion in deck slabs and walls."
          },
          recommendedActions: [
            {
              category: "Tile Joint Grouting Treatment",
              steps: [
                "Cut existing joints into V shape.",
                "Fill with polymer-modified Dr. Fixit cement grout.",
                "Air-cure for 24-48 hours."
              ]
            }
          ],
          additionalNotes: "Ensure regular non-destructive inspection of wet rooms.",
          missingInfo: ["Waterproofing material details and brands: Not Available in documents."]
        };
        
        setIsGenerating(false);
        setProgress(100);
        onReportGenerated(generated);
      } else {
        try {
          const response = await fetch("/api/generate-ddr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inspectionText, thermalText, title }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to generate report from API.");
          }

          const report = await response.json();
          addLog("AI Generation successfully completed using Gemini Model!");
          setIsGenerating(false);
          setProgress(100);
          onReportGenerated(report);
        } catch (err: any) {
          addLog(`Error during API call: ${err.message}`);
          setErrorMsg(`AI Synthesis failed: ${err.message}`);
          setIsGenerating(false);
          setProgress(0);
        }
      }
    }, totalDuration);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        {/* Intro Hero */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 text-amber-600 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4.5 h-4.5" />
              AI Diagnosis Workspace
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Detailed Diagnostic Report Generator</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload your raw PDF files (Inspection Report and Thermal Camera Readings). The AI system will extract textual observations, temperatures, and structural points to automatically synthesize, merge, and construct a cohesive, client-ready DDR.
            </p>
          </div>
          <button
            onClick={loadSamples}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileSearch className="w-4 h-4 text-amber-500" />
            Pre-Load Samples
          </button>
        </section>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
            {errorMsg}
          </div>
        )}

        {/* Inputs Section with Drag-and-Drop / File Uploaders / Manual Text Pasting */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document 1: Site Inspection PDF */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-blue-500" />
                Document 1: Site Inspection Report
              </label>
              
              {/* Manual Input / PDF Upload Toggle Buttons */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setInputModeInspection("file");
                    setErrorMsg(null);
                  }}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md cursor-pointer transition-all ${
                    inputModeInspection === "file" 
                      ? "bg-white text-slate-800 shadow-xs" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputModeInspection("manual");
                    setErrorMsg(null);
                    if (inspectionText.trim()) {
                      setInspectionFile({
                        name: "Manual Text Input",
                        pages: 1,
                        words: inspectionText.split(/\s+/).filter(Boolean).length,
                        size: "N/A"
                      });
                    }
                  }}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md cursor-pointer transition-all ${
                    inputModeInspection === "manual" 
                      ? "bg-white text-slate-800 shadow-xs" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 -mt-2">Contains dampness logs, site photos, and visual survey checklists.</p>

            {inputModeInspection === "manual" ? (
              <div className="flex-1 flex flex-col gap-2 animate-fadeIn min-h-[160px]">
                <textarea
                  value={inspectionText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setInspectionText(text);
                    if (text.trim()) {
                      setInspectionFile({
                        name: "Manual Text Input",
                        pages: 1,
                        words: text.split(/\s+/).filter(Boolean).length,
                        size: "N/A"
                      });
                    } else {
                      setInspectionFile(null);
                    }
                  }}
                  placeholder="Type or paste your raw visual survey notes here directly... (e.g., Hall skirting level dampness, Common Bathroom tile joint cracks, etc.)"
                  className="w-full h-44 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none overflow-y-auto"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Words: {inspectionText.split(/\s+/).filter(Boolean).length}</span>
                  {inspectionText.trim().length > 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Ready for Merge
                    </span>
                  ) : (
                    <span className="text-slate-400">Awaiting your notes...</span>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Drag & Drop Zone */}
                {!inspectionFile && !isParsingInspection ? (
                  <div 
                    onClick={() => inspectionInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handlePdfFile(e.dataTransfer.files[0], "inspection");
                      }
                    }}
                    className="flex-1 min-h-[160px] border-2 border-dashed border-slate-200 hover:border-amber-400/80 bg-slate-50/50 hover:bg-amber-50/5 rounded-xl flex flex-col items-center justify-center gap-3 p-4 text-center cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <FileUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Drag & Drop PDF or Click to upload</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF format up to 10MB</p>
                    </div>
                    <input 
                      type="file" 
                      ref={inspectionInputRef} 
                      accept=".pdf" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePdfFile(e.target.files[0], "inspection");
                        }
                      }}
                    />
                  </div>
                ) : isParsingInspection ? (
                  <div className="flex-1 min-h-[160px] border border-slate-150 bg-slate-50 rounded-xl flex flex-col items-center justify-center gap-3 p-4 text-center">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-xs font-mono text-slate-600">Reading PDF document & extracting text layers...</p>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[160px] border border-emerald-100 bg-emerald-50/10 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{inspectionFile.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">Size: {inspectionFile.size} | {inspectionFile.pages} Pages</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                            {inspectionFile.words} Words parsed
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setInspectionFile(null);
                          setInspectionText("");
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                      <button
                        onClick={() => setShowInspectionText(!showInspectionText)}
                        className="text-[10px] font-mono font-bold text-slate-600 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                      >
                        {showInspectionText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showInspectionText ? "Hide parsed text" : "View parsed text"}
                      </button>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Ready for Merge
                      </span>
                    </div>
                  </div>
                )}

                {/* Collapsible Parsed Text Area */}
                {showInspectionText && inspectionText && (
                  <div className="flex flex-col gap-1.5 animate-fadeIn">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Extracted Text Layer:</span>
                    <textarea
                      value={inspectionText}
                      onChange={(e) => setInspectionText(e.target.value)}
                      className="w-full h-48 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none overflow-y-auto"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Document 2: Thermal Scanning PDF */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-rose-500" />
                Document 2: Thermal Camera Readings
              </label>
              
              {/* Manual Input / PDF Upload Toggle Buttons */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setInputModeThermal("file");
                    setErrorMsg(null);
                  }}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md cursor-pointer transition-all ${
                    inputModeThermal === "file" 
                      ? "bg-white text-slate-800 shadow-xs" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputModeThermal("manual");
                    setErrorMsg(null);
                    if (thermalText.trim()) {
                      setThermalFile({
                        name: "Manual Text Input",
                        pages: 1,
                        words: thermalText.split(/\s+/).filter(Boolean).length,
                        size: "N/A"
                      });
                    }
                  }}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md cursor-pointer transition-all ${
                    inputModeThermal === "manual" 
                      ? "bg-white text-slate-800 shadow-xs" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 -mt-2">Contains thermographic logs, hotspots, coldspots, and Delta T values.</p>

            {inputModeThermal === "manual" ? (
              <div className="flex-1 flex flex-col gap-2 animate-fadeIn min-h-[160px]">
                <textarea
                  value={thermalText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setThermalText(text);
                    if (text.trim()) {
                      setThermalFile({
                        name: "Manual Text Input",
                        pages: 1,
                        words: text.split(/\s+/).filter(Boolean).length,
                        size: "N/A"
                      });
                    } else {
                      setThermalFile(null);
                    }
                  }}
                  placeholder="Type or paste your thermal scan readings here... (e.g., Image: RB02380X.JPG, Area: Hall, Hotspot: 28.8°C, Coldspot: 23.4°C, Delta T: 5.4°C)"
                  className="w-full h-44 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none overflow-y-auto"
                />
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Words: {thermalText.split(/\s+/).filter(Boolean).length}</span>
                  {thermalText.trim().length > 0 ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Ready for Merge
                    </span>
                  ) : (
                    <span className="text-slate-400">Awaiting your notes...</span>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Drag & Drop Zone */}
                {!thermalFile && !isParsingThermal ? (
                  <div 
                    onClick={() => thermalInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handlePdfFile(e.dataTransfer.files[0], "thermal");
                      }
                    }}
                    className="flex-1 min-h-[160px] border-2 border-dashed border-slate-200 hover:border-amber-400/80 bg-slate-50/50 hover:bg-amber-50/5 rounded-xl flex flex-col items-center justify-center gap-3 p-4 text-center cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <FileUp className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Drag & Drop PDF or Click to upload</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports PDF format up to 10MB</p>
                    </div>
                    <input 
                      type="file" 
                      ref={thermalInputRef} 
                      accept=".pdf" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePdfFile(e.target.files[0], "thermal");
                        }
                      }}
                    />
                  </div>
                ) : isParsingThermal ? (
                  <div className="flex-1 min-h-[160px] border border-slate-150 bg-slate-50 rounded-xl flex flex-col items-center justify-center gap-3 p-4 text-center">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-xs font-mono text-slate-600">Reading PDF document & extracting text layers...</p>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[160px] border border-emerald-100 bg-emerald-50/10 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{thermalFile.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">Size: {thermalFile.size} | {thermalFile.pages} Pages</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                            {thermalFile.words} Words parsed
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setThermalFile(null);
                          setThermalText("");
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
                      <button
                        onClick={() => setShowThermalText(!showThermalText)}
                        className="text-[10px] font-mono font-bold text-slate-600 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                      >
                        {showThermalText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {showThermalText ? "Hide parsed text" : "View parsed text"}
                      </button>
                      <span className="text-[9px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Ready for Merge
                      </span>
                    </div>
                  </div>
                )}

                {/* Collapsible Parsed Text Area */}
                {showThermalText && thermalText && (
                  <div className="flex flex-col gap-1.5 animate-fadeIn">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Extracted Text Layer:</span>
                    <textarea
                      value={thermalText}
                      onChange={(e) => setThermalText(e.target.value)}
                      className="w-full h-48 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-mono text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none overflow-y-auto"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Form Controls */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Report Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title for the compiled Diagnostic Report..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end border-t border-slate-100 pt-4 mt-2">
            <button
              onClick={clearForm}
              disabled={isGenerating}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all font-mono disabled:opacity-50 cursor-pointer"
            >
              Reset Data
            </button>
            
            <button
              onClick={() => triggerGeneration(true)}
              disabled={isGenerating}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              Simulate Synthesis
            </button>

            <button
              onClick={() => triggerGeneration(false)}
              disabled={isGenerating}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-mono text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50 animate-pulse-slow cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              Generate DDR Report (Gemini API)
            </button>
          </div>
        </section>

        {/* Active Generation Terminal Console */}
        {isGenerating && (
          <section className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col gap-4 text-slate-200 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-500 animate-pulse" />
                <span className="text-xs font-bold font-mono tracking-wider text-slate-300">
                  AI Structural Analysis pipeline
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                <span className="text-amber-400 font-semibold">{progress}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Console Log Lines */}
            <div className="bg-black/40 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[11px] text-slate-400 flex flex-col gap-1.5 border border-slate-900 leading-normal scrollbar-thin">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-amber-500 shrink-0 font-bold">&gt;</span>
                  <span className={log.includes("ALERT") ? "text-rose-400" : log.includes("completed") ? "text-emerald-400" : ""}>
                    {log}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                <span className="w-1.5 h-3 bg-amber-500 animate-pulse inline-block"></span>
                <span>Awaiting structural evaluation output...</span>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
