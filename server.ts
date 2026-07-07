import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize local storage database file path
const DATA_DIR = path.join(process.cwd(), "data");
const REPORTS_FILE = path.join(DATA_DIR, "reports.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

if (!fs.existsSync(REPORTS_FILE)) {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify([], null, 2));
}

// Helper function to read/write reports
const getReports = () => {
  try {
    const data = fs.readFileSync(REPORTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveReport = (report: any) => {
  const reports = getReports();
  // If report has id, update it, otherwise add it
  const index = reports.findIndex((r: any) => r.id === report.id);
  if (index >= 0) {
    reports[index] = report;
  } else {
    reports.push(report);
  }
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
  return reports;
};

// Standard mock data representing the perfect merged DDR from the provided documents
// This is used for a flawless out-of-the-box demonstration of the complex sample inspection data
const SAMPLE_DDR = {
  id: "sample-ddr-103",
  title: "Main Detailed Diagnostic Report (DDR) - Flat 103, Yamuna CHS",
  clientName: "Flat No-8/63",
  createdAt: "2026-07-07T08:50:00Z",
  metadata: {
    inspector: "Krushna, Mahesh & Tushar Rahane",
    inspectionDate: "27.09.2022 (Inspection Form) / 03.01.2023 (DDR)",
    propertyType: "Flat / Row House Conflict",
    floors: "11 (Flat) / 1 (Row House) Conflict",
    previousStructuralAudit: "No",
    previousRepairs: "No",
  },
  discrepancies: [
    {
      type: "Property Type & Address Conflict",
      description: "PDF 1 (Inspection Form) lists 'Property Type: Flat' with 'Floors: 11' under 'Customer Name: (Blank)'. PDF 3 (Detailed Diagnosis Report) lists 'Prepared For: Flat No-8/63, Yamuna CHS, Mulund, Mumbai', but under 'Client Details' and 'Description of Site' lists 'Customer Full Address: RH-69, Sukhwani Oasis, Pune' with 'Type of structure: Row House' and 'Floors: 1'. This is a major contradiction between an apartment unit in Mumbai and a row house in Pune.",
      severity: "High"
    },
    {
      type: "Inspection Date Inconsistency",
      description: "The Inspection Form records the date as '27.09.2022 14:28 IST', whereas the Detailed Diagnosis Report (PDF 3) states the inquiry date was '24/12/2022' and the physical inspection date was '03/01/2023 17:00:00 Hours'. This suggests two different inspections or a date transcription error.",
      severity: "Medium"
    }
  ],
  propertySummary: "Comprehensive structural dampness, efflorescence, and water ingress assessment for a property designated as Flat No-8/63 (Yamuna CHS, Mulund, Mumbai) / Row House RH-69 (Sukhwani Oasis, Pune). The inspection reveals multiple active moisture zones along skirting levels, floor joints, external facades, and parking ceilings. Thermal scan surveys verify extensive cooling signatures matching raw moisture patterns, signifying active, continuous water capillary transmission primarily driven by tile joint failures and external cracks.",
  areaObservations: [
    {
      id: "area-1",
      name: "Hallway (Ground Floor Skirting)",
      negativeObservation: "Observed active rising dampness and blistering paint at the skirting level of the Hallway.",
      positiveObservation: "Identified hollow tiles, open gaps and blackish dirt accumulation in the tile joints of the Common Bathroom directly adjacent.",
      thermalData: {
        imageRef: "RB02380X.JPG",
        hotspot: "28.8°C",
        coldspot: "23.4°C",
        tempDiff: "5.4°C",
        analysis: "A significant temperature depression of 5.4°C is centered around the lower base of the hallway wall, validating active, continuous evaporative cooling from moisture accumulation."
      },
      photos: ["Photo 1", "Photo 2", "Photo 3", "Photo 4", "Photo 5", "Photo 6", "Photo 7"],
      sourcePhotos: ["Photo 8", "Photo 9", "Photo 10", "Photo 11"],
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
        },
        {
          question: "Adjacent Wet Area Grout",
          selectedAnswer: "Failed / Empty Grout Joints",
          status: "Fail",
          finding: "Common Bathroom tile joints are wide open, letting water seep under the bed."
        },
        {
          question: "Thermal Moisture Core Status",
          selectedAnswer: "Active Evaporative Core Detected",
          status: "Fail",
          finding: "Heavy thermal delta of 5.4°C confirms active lateral water transmission."
        }
      ]
    },
    {
      id: "area-2",
      name: "Common Bedroom Skirting",
      negativeObservation: "Observed moisture spots, dampness and peeling paint at the skirting level of the Common Bedroom partition wall.",
      positiveObservation: "Linked directly to the adjacent Common Bathroom tile joint failure with open grout lines allowing water transmission.",
      thermalData: {
        imageRef: "RB02386X.JPG",
        hotspot: "27.4°C",
        coldspot: "22.4°C",
        tempDiff: "5.0°C",
        analysis: "Thermal imagery highlights a distinct cold band (22.4°C) spanning the lower skirting partition wall, indicating heavy sub-surface water migration."
      },
      photos: ["Photo 12", "Photo 13", "Photo 14"],
      sourcePhotos: ["Photo 15", "Photo 16", "Photo 17", "Photo 18", "Photo 19"],
      checklist: [
        {
          question: "Visual Dampness Level",
          selectedAnswer: "Moderate Dampness",
          status: "Warning",
          finding: "Localised wet patches above the skirting line."
        },
        {
          question: "Paint & Plaster Condition",
          selectedAnswer: "Bubbling Paint Film",
          status: "Warning",
          finding: "Early paint blistering starting near the bathroom partition corner."
        },
        {
          question: "Adjacent Wet Area Grout",
          selectedAnswer: "Hollow Sounding / Cracks",
          status: "Warning",
          finding: "Hollowness detected under adjacent bathroom floor tiles."
        },
        {
          question: "Thermal Moisture Core Status",
          selectedAnswer: "Evaporative Cooling Confirmed",
          status: "Fail",
          finding: "Moisture pooling at the wall base confirmed by a 5.0°C thermal delta."
        }
      ]
    },
    {
      id: "area-3",
      name: "Master Bedroom Skirting & Ceiling-Wall Corner",
      negativeObservation: "Observed moisture spots, dampness, and paint flaking at the skirting level and area near the window in the Master Bedroom.",
      positiveObservation: "Identified visible gaps, hollow sounding floor tile sections, and cracked tile joints in the Master Bedroom Bathroom.",
      thermalData: {
        imageRef: "RB02395X.JPG",
        hotspot: "27.0°C",
        coldspot: "22.0°C",
        tempDiff: "5.0°C",
        analysis: "Heavy thermal depression of 5.0°C detected under the window frame and along the adjacent bathroom junction wall, confirming water pooling behind the plaster."
      },
      photos: ["Photo 20", "Photo 21", "Photo 22", "Photo 23", "Photo 24", "Photo 25"],
      sourcePhotos: ["Photo 26", "Photo 27", "Photo 28", "Photo 29", "Photo 30"],
      checklist: [
        {
          question: "Visual Dampness Level",
          selectedAnswer: "Severe Dampness & Mold",
          status: "Fail",
          finding: "Moisture accumulation near window sill and bathroom junction with visible black mould spores."
        },
        {
          question: "Paint & Plaster Condition",
          selectedAnswer: "Crumbling Plaster / Peeling Paint",
          status: "Fail",
          finding: "Masonry plaster has softened and paint has completely peeled."
        },
        {
          question: "Adjacent Wet Area Grout",
          selectedAnswer: "Tile Hollowness & Open Joints",
          status: "Fail",
          finding: "Master bathroom tile joints are completely cracked with a loose tile substrate."
        },
        {
          question: "Thermal Moisture Core Status",
          selectedAnswer: "Severe Sub-surface Pool",
          status: "Fail",
          finding: "Thermogram shows heavy cooling from water pooling below window sill frame."
        }
      ]
    },
    {
      id: "area-4",
      name: "Kitchen Skirting Level",
      negativeObservation: "Observed active dampness, salt deposition, and paint peeling at the kitchen skirting level of the partition wall.",
      positiveObservation: "Linked to the master bedroom bathroom tile joint gaps on the opposite side of the partition wall.",
      thermalData: {
        imageRef: "RB02402X.JPG",
        hotspot: "25.7°C",
        coldspot: "20.7°C",
        tempDiff: "5.0°C",
        analysis: "Sub-skirting thermal scanning shows a continuous low-temperature zone of 20.7°C, highlighting moisture channelization from adjacent wet facilities."
      },
      photos: ["Photo 31", "Photo 32"],
      sourcePhotos: ["Photo 33", "Photo 34", "Photo 35", "Photo 36", "Photo 37"],
      checklist: [
        {
          question: "Visual Dampness Level",
          selectedAnswer: "Moderate Skirting Dampness",
          status: "Warning",
          finding: "Watermarks observed behind kitchen cabinets on the floor boundary."
        },
        {
          question: "Paint & Plaster Condition",
          selectedAnswer: "Slight Discoloration & Dusting",
          status: "Warning",
          finding: "Efflorescence is beginning to degrade internal finish paint."
        },
        {
          question: "Adjacent Wet Area Grout",
          selectedAnswer: "Open Grout Lines",
          status: "Fail",
          finding: "Open tile joint cracks in Master Bath allow lateral capillary rise into Kitchen wall."
        },
        {
          question: "Thermal Moisture Core Status",
          selectedAnswer: "Moisture Path Confirmed",
          status: "Fail",
          finding: "Active sub-surface dampness detected below floor level (5.0°C Delta)."
        }
      ]
    },
    {
      id: "area-5",
      name: "Master Bedroom Wall Surface & External Facade",
      negativeObservation: "Observed severe dampness, efflorescence, and peeling plaster on the exterior-facing wall of the Master Bedroom.",
      positiveObservation: "Identified major cracks over the external facade of the building near the Master Bedroom and a damaged plumbing duct issue.",
      thermalData: {
        imageRef: "RB02403X.JPG",
        hotspot: "25.5°C",
        coldspot: "20.5°C",
        tempDiff: "5.0°C",
        analysis: "A thermal drop to 20.5°C tracks perfectly with external cracks, indicating rain/duct water is entering directly from the outside facade."
      },
      photos: ["Photo 38", "Photo 39", "Photo 40", "Photo 41"],
      sourcePhotos: ["Photo 42", "Photo 43", "Photo 44", "Photo 45", "Photo 46", "Photo 47", "Photo 48"],
      checklist: [
        {
          question: "Exterior Crack Severity",
          selectedAnswer: "Severe Cracks (Width >2mm)",
          status: "Fail",
          finding: "Visible external masonry plaster cracks near the master bedroom corner."
        },
        {
          question: "Duct & Piping Integrity",
          selectedAnswer: "Damaged / Leaking Plumbing Duct",
          status: "Fail",
          finding: "External duct shows sign of continuous drain overflows and wall wetness."
        },
        {
          question: "Algae & Biological Growth",
          selectedAnswer: "Moderate Moss Colonisation",
          status: "Warning",
          finding: "Green algae patches visible on the external plaster surface."
        },
        {
          question: "Thermal Ingress Telemetry",
          selectedAnswer: "Facade Leak Verified",
          status: "Fail",
          finding: "Active external rainwater seepage confirmed by cooling footprint at crack coordinates."
        }
      ]
    },
    {
      id: "area-6",
      name: "Parking Ceiling Area (Below Flat 103)",
      negativeObservation: "Severe water seepage, paint peeling, and dripping moisture observed on the concrete slab ceiling of the parking lot directly below Flat No. 103.",
      positiveObservation: "Directly linked to plumbing leaks and failed tile grouting inside Flat 103's Common Bathroom directly above.",
      thermalData: {
        imageRef: "RB02404X.JPG",
        hotspot: "25.8°C",
        coldspot: "20.8°C",
        tempDiff: "5.0°C",
        analysis: "Thermal mapping of the parking ceiling captures heavy saturated spots at 20.8°C, representing gravity-assisted vertical percolation of water through the structural RCC slab."
      },
      photos: ["Photo 49", "Photo 50", "Photo 51", "Photo 52"],
      sourcePhotos: ["Photo 53", "Photo 54", "Photo 55", "Photo 56", "Photo 57"],
      checklist: [
        {
          question: "Seepage Classification",
          selectedAnswer: "Active Dripping Leak",
          status: "Fail",
          finding: "Continuous water drops fall from concrete slab, damaging cars parked below."
        },
        {
          question: "Concrete & Slab Condition",
          selectedAnswer: "Micro-cracks & Rust Marks",
          status: "Fail",
          finding: "Brown rust marks indicate early stage oxidation of rebar inside the slab."
        },
        {
          question: "Upstairs Source Check",
          selectedAnswer: "Flat 103 Bathroom Floor",
          status: "Fail",
          finding: "Direct correlation with Common Bathroom tile hollowness and trap leak upstairs."
        },
        {
          question: "Thermal Saturated Area",
          selectedAnswer: "Gravity Seepage Confirmed",
          status: "Fail",
          finding: "Heavy thermal delta of 5.0°C indicates structural concrete core is fully saturated."
        }
      ]
    },
    {
      id: "area-7",
      name: "Common Bathroom Ceiling",
      negativeObservation: "Observed localized dampness, plaster deterioration, and peeling ceiling paint inside Flat No. 103's Common Bathroom.",
      positiveObservation: "External leak originating from Flat No. 203 (directly upstairs) where the bathroom tile joints are completely open and the outlet drain is leaking.",
      thermalData: {
        imageRef: "RB02392X.JPG",
        hotspot: "25.8°C",
        coldspot: "20.8°C",
        tempDiff: "5.0°C",
        analysis: "Ceiling scan reveals localized cooling anomalies, confirming that the leak is gravity-fed from the adjacent upstairs bathroom facility (Flat 203)."
      },
      photos: ["Photo 58"],
      sourcePhotos: ["Photo 59", "Photo 60", "Photo 61", "Photo 62", "Photo 63", "Photo 64"],
      checklist: [
        {
          question: "Seepage Classification",
          selectedAnswer: "Gravity Seepage / Wet Spots",
          status: "Fail",
          finding: "Active ceiling dampness directly above shower cubicle."
        },
        {
          question: "Slab Concrete Condition",
          selectedAnswer: "Efflorescence / Salt Deposition",
          status: "Warning",
          finding: "White salt stalactites forming on ceiling due to hard water leaching."
        },
        {
          question: "Upstairs Resident Source",
          selectedAnswer: "Flat 203 Tile Joint Failure",
          status: "Fail",
          finding: "Flat 203 upstairs bathroom floor grout is cracked and main drain line is leaking."
        },
        {
          question: "Thermal Inflow Verification",
          selectedAnswer: "Vertical Leak Verified",
          status: "Fail",
          finding: "Cold zone (20.8°C) tracks directly to Flat 203 outlet connection coordinates."
        }
      ]
    }
  ],
  rootCause: "The primary root cause of the widespread dampness is dual-source water transmission: \n1. **Internal Capillary Rise (Wet Areas)**: Gaps and failure of tile grouting in the Common Bathroom and Master Bedroom Bathroom allow bathing water to seep below the tile bed. The lack of proper waterproofing beneath the tile allows this water to travel laterally via capillary action, rising up through adjacent walls (skirting levels) of the Hallway, Bedroom, Master Bedroom, and Kitchen.\n2. **External Facade Infiltration**: Open cracks and damaged joints on the exterior walls and plumbing ducts allow rainwater to penetrate the building shell. This is directly causing the severe plaster damage and efflorescence on the Master Bedroom wall.\n3. **Upstairs Bathroom Failure**: The ceiling dampness in Flat 103 is caused by cracked tile joints and outlet pipe leakage from Flat 203 directly above, letting water seep through the concrete slab.",
  severityAssessment: {
    level: "High",
    reasoning: "While the structural safety of the primary RCC columns and beams is currently graded as 'Moderate' (moderate cracks observed but no severe spalling or exposed corroding rebar), the continuous, active seepage of water through the concrete slab (parking ceiling and bathroom ceiling) poses a serious long-term risk of concrete carbonation and rebar corrosion if left untreated. The capillary dampness is also causing extensive aesthetic and hygienic damage (mold, paint flaking, plaster crumbling) inside living quarters."
  },
  recommendedActions: [
    {
      category: "Bathroom & Balcony Grout Treatment",
      steps: [
        "Clean all tile surfaces and remove compromised grout lines.",
        "Cut all floor joints into a clean V-shape using an electric cutter.",
        "Saturate and fill the joints using a liquid polymer-modified mortar (e.g., Dr. Fixit URP) to seal deep micro-cracks beneath the tiles.",
        "Apply specialized RTM grout to form a solid, watertight seal in the tile joints.",
        "Patch corners, drains, and pipe collars with polymer-modified mortar.",
        "Allow the grouting system to air-cure completely for 24-48 hours before exposing to water."
      ]
    },
    {
      category: "External Facade & Duct Restoration",
      steps: [
        "Seal all hairline external cracks on the walls using elastic crack fillers.",
        "Re-grout and seal the plumbing duct penetrations on the external facade.",
        "Apply a high-quality waterproof coating on the external walls to protect the plaster."
      ]
    },
    {
      category: "Plaster Repair Work",
      steps: [
        "Chip off loose, damp-damaged plaster on internal skirting levels and walls.",
        "Apply a strong bonding coat of Dr. Fixit Pidicrete URP (1:1 mix with cement) onto the clean masonry base.",
        "Apply a 20-25mm thick sand-faced cement plaster containing waterproofing additives (e.g., Dr. Fixit LW+, 200ml per bag of cement) in two structured coats."
      ]
    },
    {
      category: "Inter-Flat Resolution (Upstairs Seepage)",
      steps: [
        "Coordinate immediately with the occupant of Flat No. 203 directly above to repair their open bathroom tile joints and clear/reseal the leaking drain outlet. Failure to repair the source in Flat 203 will lead to re-occurrence of Flat 103 ceiling damage."
      ]
    }
  ],
  additionalNotes: "The findings in this Detailed Diagnostic Report are based on non-destructive visual, moisture, and thermal inspections. Water movement is highly dynamic; any delayed action will lead to broader paint flaking, potential mold development causing health/allergy concerns, and accelerated degradation of concrete substrates.",
  missingInfo: [
    "Property Age: Contradictory records list the property age as unknown, but other sections specify 11 years (constructed 2011-2012).",
    "Waterproofing History: No detailed historical records of previous waterproofing coatings or brands used were available on site.",
    "Previous Structural Repair Records: Although specified as 'No', any micro-repair files would help establish building behavior.",
    "Access to Flat 203: Physical interior measurements of Flat 203 were not accessible during the inspection to fully map the upstairs drain piping."
  ]
};

// API Endpoint to get all reports (starts clean/empty)
app.get("/api/reports", (req, res) => {
  const reports = getReports();
  return res.json(reports);
});

// API Endpoint to load the demo/sample report manually
app.post("/api/reports/load-sample", (req, res) => {
  const reports = getReports();
  const sampleExists = reports.some((r: any) => r.id === SAMPLE_DDR.id);
  if (!sampleExists) {
    saveReport(SAMPLE_DDR);
  }
  return res.json(getReports());
});

// API Endpoint to delete a specific report
app.delete("/api/reports/:id", (req, res) => {
  const reports = getReports();
  const filtered = reports.filter((r: any) => r.id !== req.params.id);
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(filtered, null, 2));
  return res.json({ success: true, reports: filtered });
});

// API Endpoint to get a specific report
app.get("/api/reports/:id", (req, res) => {
  const reports = getReports();
  const report = reports.find((r: any) => r.id === req.params.id);
  if (report) {
    return res.json(report);
  }
  if (req.params.id === SAMPLE_DDR.id) {
    return res.json(SAMPLE_DDR);
  }
  return res.status(404).json({ error: "Report not found" });
});

// API Endpoint to generate a DDR using Gemini API
app.post("/api/generate-ddr", async (req, res) => {
  const { inspectionText, thermalText, title } = req.body;

  if (!inspectionText || !thermalText) {
    return res.status(400).json({ error: "Both inspection text and thermal data are required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return res.status(400).json({
      error: "Gemini API key is not configured. Please add your GEMINI_API_KEY in the Secrets / Settings panel of AI Studio.",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
You are an expert structural engineer and AI diagnostic system specializing in waterproofing and building pathology.
Your goal is to parse raw inspection data and thermal scanning data to generate a cohesive, structured "Detailed Diagnostic Report (DDR)".

Input Inspection Data:
${inspectionText}

Input Thermal Imaging Data:
${thermalText}

Generate a clean, professional, structured JSON report following the exact schema specified below. Do not include any markdown styling, preambles, or explanations outside the JSON object. The JSON should be valid and parsable.

JSON Schema:
{
  "id": "generated-id-string",
  "title": "A brief, professional title for the report",
  "clientName": "Extracted customer or property identifier",
  "createdAt": "Current ISO string",
  "metadata": {
    "inspector": "Name of inspectors if found, otherwise 'Not Available'",
    "inspectionDate": "Date of inspection, or 'Not Available'",
    "propertyType": "Type of building (Flat, Row House, etc.), or 'Not Available'",
    "floors": "Number of floors or level, or 'Not Available'",
    "previousStructuralAudit": "Yes / No / 'Not Available'",
    "previousRepairs": "Yes / No / 'Not Available'"
  },
  "discrepancies": [
    {
      "type": "Name of conflict or inconsistency (e.g. flat vs row house, different dates, conflicting findings)",
      "description": "Clear explanation of what conflicts and why",
      "severity": "High / Medium / Low"
    }
  ],
  "propertySummary": "Executive client-friendly summary of the overall issues.",
  "areaObservations": [
    {
      "id": "unique-area-id",
      "name": "Area Name (e.g., Hallway, Common Bedroom)",
      "negativeObservation": "The negative side observation (interior dampness, paint peeling, etc.)",
      "positiveObservation": "The positive side/source observation (tile joint failure, external cracks, plumbing leak, etc.)",
      "thermalData": {
        "imageRef": "Reference code of the thermal image (e.g., RB02380X.JPG), or 'Not Available'",
        "hotspot": "Temperature hotspot (e.g., 28.8°C), or 'Not Available'",
        "coldspot": "Temperature coldspot (e.g., 23.4°C), or 'Not Available'",
        "tempDiff": "The calculated difference (e.g. 5.4°C), or 'Not Available'",
        "analysis": "Client-friendly description explaining the thermal cooling signature in relation to moisture content"
      },
      "photos": ["Mention which positive/negative photos support this (e.g., Photo 1, Photo 2)"],
      "sourcePhotos": ["Mention supporting source photos (e.g., Photo 8, Photo 9)"],
      "checklist": [
        {
          "question": "Standard checkpoint or criteria evaluated (e.g., 'Visual Dampness Level', 'Adjacent Wet Area Grout', 'Paint & Plaster Condition', 'Thermal Moisture Core Status')",
          "selectedAnswer": "The selected answer choice representing the exact finding (multiple-choice style, e.g., 'Severe Rising Dampness', 'Failed / Open Grout', 'Bubbling/Peeling Paint')",
          "status": "Pass / Warning / Fail",
          "finding": "Brief, precise localized diagnostic explanation"
        }
      ]
    }
  ],
  "rootCause": "Clear explanation of the root cause of the leaks, avoiding jargon, describing internal capillary action and external ingress.",
  "severityAssessment": {
    "level": "High / Medium / Low",
    "reasoning": "Detailed technical and structural reasoning for this severity level."
  },
  "recommendedActions": [
    {
      "category": "Therapy Category (e.g., Bathroom Grouting, Plaster Repair)",
      "steps": ["Step 1 description", "Step 2 description"]
    }
  ],
  "additionalNotes": "Any warnings about delayed actions, mold concerns, dynamic water movement, or liability notes.",
  "missingInfo": ["Bullet points of missing details or items explicitly marked N/A in the raw documents"]
}

Rules for Analysis:
1. DO NOT invent details. If something is missing, explicitly set it as "Not Available" or list it in "missingInfo".
2. Merge the inspection data and thermal report logically based on their area names, temperature cold spots, and point numbers (e.g. Area 1 / Point 1 relates to Thermal Image RB02380X.JPG / Photo 1-7).
3. Identify conflicts: Compare property type descriptions, inspection dates, and locations. List any contradictions in the "discrepancies" array.
4. Ensure each room (Hallway, Bedroom, Kitchen, Parking, Bathroom) has unique, room-specific, and highly distinct findings. Do NOT copy-paste descriptions, causes, or checklist answers across different rooms.
5. Provide 3-4 point-wise MCQ-style evaluation checklist items for each room under the "checklist" array.
6. Keep the tone professional, humble, objective, and client-friendly.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "";
    const parsedData = JSON.parse(resultText.trim());
    
    // Assign random ID and date if missing
    parsedData.id = parsedData.id || "gen-" + Math.random().toString(36).substr(2, 9);
    parsedData.createdAt = new Date().toISOString();
    if (title) parsedData.title = title;

    saveReport(parsedData);
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini DDR Generation Error:", error);
    return res.status(500).json({
      error: "An error occurred during AI report generation: " + error.message,
    });
  }
});

// Serve Vite in development, serve compiled dist in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DDR Report Generator Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
