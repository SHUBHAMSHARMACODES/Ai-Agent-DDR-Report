import React, { useState } from "react";
import { DDRReport } from "../types";
import { ThermalCanvas } from "./ThermalCanvas";
import { 
  FileText, CheckCircle2, AlertTriangle, HelpCircle, AlertOctagon, 
  Settings, Droplets, Info, Calendar, User, Hammer, Thermometer,
  ShieldAlert, Layers, HelpCircle as HelpIcon, FileMinus, ChevronRight,
  Download, ChevronDown, FileCode
} from "lucide-react";

interface DDRViewerProps {
  report: DDRReport | null;
}

type TabType = "summary" | "observations" | "rootcause" | "therapies" | "notes";

export const DDRViewer: React.FC<DDRViewerProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [isExportOpen, setIsExportOpen] = useState(false);

  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50">
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-4 text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">No Report Selected</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Select an existing Diagnostic Report from the sidebar, or navigate to the AI Synthesis Studio to generate a new one.
        </p>
      </div>
    );
  }

  const exportToJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(report, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `${report.title.toLowerCase().replace(/\s+/g, "_")}_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToMarkdown = () => {
    let md = `# DETAILED DIAGNOSTIC REPORT (DDR)\n\n`;
    md += `## Executive Meta Specs\n`;
    md += `- **Report ID:** ${report.id}\n`;
    md += `- **Title:** ${report.title}\n`;
    md += `- **Client Name:** ${report.clientName}\n`;
    md += `- **Inspection Date:** ${report.metadata.inspectionDate}\n`;
    md += `- **Inspector:** ${report.metadata.inspector}\n`;
    md += `- **Property Type:** ${report.metadata.propertyType}\n`;
    md += `- **Floors Checked:** ${report.metadata.floors}\n`;
    md += `- **Previous Structural Audit:** ${report.metadata.previousStructuralAudit}\n`;
    md += `- **Previous Repairs:** ${report.metadata.previousRepairs}\n`;
    md += `- **Threat Level:** ${report.severityAssessment.level} (${report.severityAssessment.reasoning})\n\n`;

    if (report.discrepancies && report.discrepancies.length > 0) {
      md += `### ⚠️ Technical Data Inconsistencies Detected\n`;
      report.discrepancies.forEach((disc) => {
        md += `#### [${disc.severity}] ${disc.type}\n`;
        md += `${disc.description}\n\n`;
      });
    }

    md += `## 1. Executive Property Summary\n`;
    md += `${report.propertySummary}\n\n`;

    md += `## 2. Area-by-Area Diagnostic Logs\n\n`;
    report.areaObservations.forEach((area, index) => {
      md += `### Area ${index + 1}: ${area.name}\n`;
      if (area.thermalData.imageRef) {
        md += `- **Thermal Reference:** ${area.thermalData.imageRef} (Hotspot: ${area.thermalData.hotspot} | Coldspot: ${area.thermalData.coldspot} | Delta T: ${area.thermalData.tempDiff})\n`;
        md += `- **Thermal Analysis:** ${area.thermalData.analysis}\n`;
      }
      md += `\n**Observations:**\n`;
      md += `- **Negative Observation (Impacted):** ${area.negativeObservation}\n`;
      md += `- **Positive Observation (Source/Context):** ${area.positiveObservation}\n\n`;

      md += `**Checklist Evaluation:**\n`;
      area.checklist.forEach((item) => {
        md += `- **${item.question}:** *${item.selectedAnswer}* [Status: **${item.status}**] — ${item.finding}\n`;
      });
      md += `\n---\n\n`;
    });

    md += `## 3. Root Cause Analysis\n`;
    md += `${report.rootCause}\n\n`;

    md += `## 4. Recommended Action Plan\n\n`;
    report.recommendedActions.forEach((action) => {
      md += `### Category: ${action.category}\n`;
      action.steps.forEach((step, stepIdx) => {
        md += `${stepIdx + 1}. ${step}\n`;
      });
      md += `\n`;
    });

    if (report.additionalNotes) {
      md += `## 5. Additional Diagnostic Notes\n`;
      md += `${report.additionalNotes}\n\n`;
    }

    if (report.missingInfo && report.missingInfo.length > 0) {
      md += `### Missing Data Parameters\n`;
      report.missingInfo.forEach((info) => {
        md += `- ${info}\n`;
      });
    }

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `${report.title.toLowerCase().replace(/\s+/g, "_")}_report.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportToHtml = () => {
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${report.title} - Detailed Diagnostic Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #334155;
      line-height: 1.6;
      background-color: #f8fafc;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .deliverable-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      color: #b45309;
      background-color: #fef3c7;
      border: 1px solid #fde68a;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      font-family: monospace;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 12px 0;
      letter-spacing: -0.025em;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      font-size: 13px;
      font-family: monospace;
      color: #64748b;
    }
    .meta-item strong {
      color: #334155;
    }
    .threat-banner {
      margin-top: 24px;
      padding: 16px;
      border-radius: 12px;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .threat-High {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
    }
    .threat-Medium {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }
    .threat-Low {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .conflict-box {
      background-color: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 32px;
    }
    .conflict-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #991b1b;
      margin: 0 0 8px 0;
      font-family: monospace;
    }
    .conflict-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 12px;
    }
    .conflict-card {
      background: #ffffff;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 12px;
    }
    .section {
      margin-bottom: 40px;
    }
    h2 {
      font-size: 16px;
      text-transform: uppercase;
      font-family: monospace;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 16px;
      letter-spacing: 0.05em;
    }
    .summary-text {
      background-color: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
      font-size: 14px;
      white-space: pre-line;
    }
    .area-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .area-header {
      background-color: #f8fafc;
      padding: 12px 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 14px;
    }
    .area-body {
      padding: 20px;
    }
    .observation-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .obs-neg {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      padding: 14px;
      border-radius: 8px;
      font-size: 13px;
    }
    .obs-pos {
      background-color: #f0fdf4;
      border: 1px solid #dcfce7;
      padding: 14px;
      border-radius: 8px;
      font-size: 13px;
    }
    .obs-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 6px;
      font-family: monospace;
    }
    .obs-neg .obs-title { color: #b91c1c; }
    .obs-pos .obs-title { color: #15803d; }
    .thermal-box {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 20px;
    }
    .thermal-title {
      font-size: 10px;
      font-weight: 700;
      color: #1d4ed8;
      text-transform: uppercase;
      font-family: monospace;
      margin-bottom: 6px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 12px;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      font-family: monospace;
      color: #475569;
    }
    .status-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .status-Pass { background-color: #dcfce7; color: #15803d; }
    .status-Fail { background-color: #fee2e2; color: #b91c1c; }
    
    .action-category {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .action-category-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 10px 0;
      font-family: monospace;
    }
    .action-steps {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
    }
    .action-steps li {
      margin-bottom: 6px;
    }
    .no-print {
      margin-top: 32px;
      text-align: center;
      padding-top: 24px;
      border-top: 1px dashed #e2e8f0;
    }
    .btn-print {
      background-color: #0f172a;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;
      font-family: monospace;
    }
    .btn-print:hover {
      background-color: #1e293b;
    }
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border: none;
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="deliverable-badge">DDR Deliverable</div>
      <h1>${report.title}</h1>
      <div class="meta-grid">
        <div class="meta-item">Report ID: <strong>${report.id}</strong></div>
        <div class="meta-item">Client Name: <strong>${report.clientName}</strong></div>
        <div class="meta-item">Inspection Date: <strong>${report.metadata.inspectionDate}</strong></div>
        <div class="meta-item">Inspector: <strong>${report.metadata.inspector}</strong></div>
        <div class="meta-item">Property Type: <strong>${report.metadata.propertyType}</strong></div>
        <div class="meta-item">Floors Checked: <strong>${report.metadata.floors}</strong></div>
        <div class="meta-item">Previous Audit: <strong>${report.metadata.previousStructuralAudit}</strong></div>
        <div class="meta-item">Previous Repairs: <strong>${report.metadata.previousRepairs}</strong></div>
      </div>
      
      <div class="threat-banner threat-${report.severityAssessment.level}">
        <div>
          <span style="font-weight: 800; font-family: monospace;">THREAT LEVEL: ${report.severityAssessment.level.toUpperCase()}</span>
          <div style="font-size: 12px; margin-top: 4px;">${report.severityAssessment.reasoning}</div>
        </div>
      </div>
    </div>`;

    if (report.discrepancies && report.discrepancies.length > 0) {
      html += `
    <div class="conflict-box">
      <h3 class="conflict-title">⚠️ Technical Data Conflict Warning</h3>
      <div style="font-size: 12px; color: #7f1d1d;">The AI cross-document processing unit detected inconsistency metrics across the raw inputs:</div>
      <div class="conflict-list">`;
      report.discrepancies.forEach((disc) => {
        html += `
        <div class="conflict-card">
          <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 12px; margin-bottom: 4px; color: #991b1b;">
            <span>${disc.type}</span>
            <span style="font-size: 9px; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">${disc.severity} Severity</span>
          </div>
          <div style="font-size: 11px; font-family: monospace; color: #4b5563;">${disc.description}</div>
        </div>`;
      });
      html += `
      </div>
    </div>`;
    }

    html += `
    <div class="section">
      <h2>1. Executive Property Summary</h2>
      <div class="summary-text">${report.propertySummary}</div>
    </div>
    
    <div class="section">
      <h2>2. Area-by-Area Diagnostic Logs</h2>`;
      
    report.areaObservations.forEach((area, index) => {
      html += `
      <div class="area-card">
        <div class="area-header">
          <span>Area ${index + 1}: ${area.name}</span>
          ${area.thermalData.imageRef ? `<span style="font-family: monospace; font-size: 11px;">Thermal Ref: ${area.thermalData.imageRef}</span>` : ""}
        </div>
        <div class="area-body">
          <div class="observation-grid">
            <div class="obs-neg">
              <div class="obs-title">Negative Observation (Impacted Zone)</div>
              <div>${area.negativeObservation}</div>
            </div>
            <div class="obs-pos">
              <div class="obs-title">Positive Observation (Source/Context)</div>
              <div>${area.positiveObservation}</div>
            </div>
          </div>`;
          
      if (area.thermalData.imageRef) {
        html += `
          <div class="thermal-box">
            <div class="thermal-title">Thermographic Log Telemetry</div>
            <div style="display: flex; gap: 24px; font-family: monospace; margin-bottom: 8px; font-size: 12px;">
              <span>Hotspot: <strong>${area.thermalData.hotspot}</strong></span>
              <span>Coldspot: <strong>${area.thermalData.coldspot}</strong></span>
              <span>Delta T: <strong style="color: #b91c1c;">${area.thermalData.tempDiff}</strong></span>
            </div>
            <div style="font-size: 12px; color: #1e3a8a;">${area.thermalData.analysis}</div>
          </div>`;
      }
      
      html += `
          <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; font-family: monospace; color: #475569; margin-top: 16px;">Checklist Evaluation Findings</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">Evaluation Question</th>
                <th style="width: 25%;">Selected Status/Answer</th>
                <th>Diagnostic Findings</th>
                <th style="width: 10%;">Result</th>
              </tr>
            </thead>
            <tbody>`;
            
      area.checklist.forEach((item) => {
        html += `
              <tr>
                <td>${item.question}</td>
                <td style="font-family: monospace;">${item.selectedAnswer}</td>
                <td>${item.finding}</td>
                <td><span class="status-badge status-${item.status}">${item.status}</span></td>
              </tr>`;
      });
      
      html += `
            </tbody>
          </table>
        </div>
      </div>`;
    });
    
    html += `
    </div>
    
    <div class="section">
      <h2>3. Root Cause Analysis</h2>
      <div class="summary-text" style="border-left: 4px solid #f59e0b; background-color: #fffbeb;">${report.rootCause}</div>
    </div>
    
    <div class="section">
      <h2>4. Recommended Action Plan</h2>`;
      
    report.recommendedActions.forEach((action) => {
      html += `
      <div class="action-category">
        <h3 class="action-category-title">${action.category}</h3>
        <ol class="action-steps">`;
      action.steps.forEach((step) => {
        html += `
          <li>${step}</li>`;
      });
      html += `
        </ol>
      </div>`;
    });
    
    html += `
    </div>`;
      
    if (report.additionalNotes) {
      html += `
    <div class="section">
      <h2>5. Additional Diagnostic Notes</h2>
      <div class="summary-text">${report.additionalNotes}</div>
    </div>`;
    }
    
    if (report.missingInfo && report.missingInfo.length > 0) {
      html += `
    <div class="section">
      <h2>Missing Parameters / Open Gaps</h2>
      <ul style="font-size: 13px; font-family: monospace; color: #64748b; padding-left: 20px;">`;
      report.missingInfo.forEach((info) => {
        html += `
        <li>${info}</li>`;
      });
      html += `
      </ul>
    </div>`;
    }
    
    html += `
    <div class="no-print">
      <button class="btn-print" onclick="window.print()">Print or Save as PDF</button>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `${report.title.toLowerCase().replace(/\s+/g, "_")}_report.html`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const severityColor = {
    High: "bg-rose-50 text-rose-700 border-rose-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const severityLabel = {
    High: "Severe Risk / Immediate Action Required",
    Medium: "Moderate Risk / Necessary Repair",
    Low: "Low Risk / Monitor Over Time",
  };

  // Quick navigation click
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col h-full">
      {/* Report Header Hero */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 shadow-xs shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                DDR DELIVERABLE
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {report.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{report.title}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Client: <strong className="text-slate-700">{report.clientName}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Date: <strong className="text-slate-700">{report.metadata.inspectionDate}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" />
                Inspector: <strong className="text-slate-700">{report.metadata.inspector}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0 w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
            <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Threat Level</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityColor[report.severityAssessment.level]}`}>
                {report.severityAssessment.level} Threat
              </span>
            </div>

            {/* Download/Export Dropdown */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Report</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
              </button>

              {isExportOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsExportOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 animate-fadeIn">
                    <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Available Formats
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        exportToHtml();
                        setIsExportOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start gap-2.5 transition-all cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800">Print-Friendly HTML (.html)</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">Best for saving as PDF or printing</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        exportToMarkdown();
                        setIsExportOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start gap-2.5 transition-all cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800">Markdown Report (.md)</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">Plain text / documentation format</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        exportToJson();
                        setIsExportOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start gap-2.5 transition-all cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-200">
                        <FileText className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800">Structured JSON (.json)</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">Raw structural database payload</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar for Easy & Clear Usability */}
        <div className="flex border-t border-slate-100 mt-5 pt-4 overflow-x-auto gap-2 no-scrollbar">
          <button
            onClick={() => handleTabChange("summary")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "summary"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            1. Summary Specs
          </button>
          <button
            onClick={() => handleTabChange("observations")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "observations"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            2. Area Diagnostic Logs ({report.areaObservations.length})
          </button>
          <button
            onClick={() => handleTabChange("rootcause")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "rootcause"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            3. Causes & Threat
          </button>
          <button
            onClick={() => handleTabChange("therapies")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "therapies"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-emerald-500" />
            4. Recommended Plan
          </button>
          <button
            onClick={() => handleTabChange("notes")}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "notes"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <HelpIcon className="w-3.5 h-3.5 text-indigo-500" />
            5. Notes & Gaps
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* Technical Discrepancies & Conflicts Panel (rendered at the top of everything for quick alert) */}
          {report.discrepancies && report.discrepancies.length > 0 && (
            <section className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-sm animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 shrink-0">
                  <AlertOctagon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-900 uppercase font-mono tracking-wider">Technical Data Conflict Warning</h4>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                    The AI cross-document processing unit detected inconsistency metrics across your raw inputs:
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {report.discrepancies.map((disc, idx) => (
                  <div key={idx} className="bg-white border border-rose-100 rounded-lg p-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        {disc.type}
                      </span>
                      <span className="text-[8px] bg-rose-100 text-rose-700 border border-rose-200 font-mono px-1.5 py-0.2 rounded font-bold">
                        {disc.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-mono">
                      {disc.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 1: SUMMARY SPECS */}
          {activeTab === "summary" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">1. Executive Property Summary</h3>
                    <p className="text-[9px] text-slate-400 font-mono">Core structural diagnostics findings</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 text-sm text-slate-600 leading-relaxed space-y-4">
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                        {report.propertySummary}
                      </p>
                    </div>

                    <div className="border border-slate-100 rounded-xl p-4 bg-amber-50/20">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono mb-2 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-amber-600" />
                        Diagnostic Evaluation Method
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        This DDR integrates raw site survey transcripts with thermal scanning telemetry. Thermography scanning highlights active subsurface cooling regions indicating dampness retention.
                      </p>
                    </div>
                  </div>

                  {/* Metadata Reference */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono border-b border-slate-200 pb-2 flex items-center justify-between">
                      <span>Inspection Meta Specs</span>
                    </h4>
                    <div className="flex flex-col gap-2 text-xs font-mono">
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-400">Property Type:</span>
                        <span className="text-slate-800 font-semibold">{report.metadata.propertyType}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-400">Floors Checked:</span>
                        <span className="text-slate-800 font-semibold">{report.metadata.floors}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-400">Structural Audit:</span>
                        <span className="text-slate-800 font-semibold">{report.metadata.previousStructuralAudit}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="text-slate-400">Previous Repairs:</span>
                        <span className="text-slate-800 font-semibold">{report.metadata.previousRepairs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Age:</span>
                        <span className="text-slate-800 font-semibold">11 Years (Const. 2011)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setActiveTab("observations")}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-mono text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Proceed to Area Observations
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: AREA OBSERVATIONS & MCQ CHECKLISTS */}
          {activeTab === "observations" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                    <Droplets className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">2. Area-by-Area Diagnostic Logs</h3>
                    <p className="text-[9px] text-slate-400 font-mono">Detailed room inspections and point-wise MCQ evaluation checklists</p>
                  </div>
                </div>

                <div className="flex flex-col gap-8">
                  {report.areaObservations.map((area, idx) => (
                    <div key={area.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                      {/* Area Header */}
                      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-mono text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800">{area.name}</h4>
                        </div>
                        {area.thermalData.imageRef && (
                          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Thermometer className="w-3.5 h-3.5" />
                            Thermal Reference: {area.thermalData.imageRef}
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex flex-col gap-5">
                        {/* Positive & Negative Finding Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Negative Side: Impacted Zone */}
                          <div className="bg-rose-50/30 border border-rose-100 p-4 rounded-xl flex flex-col gap-1.5">
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded px-2 py-0.5 uppercase tracking-wider self-start font-mono">
                              Impacted Zone (-ve Side)
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                              {area.negativeObservation}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {area.photos.map((photo, i) => (
                                <span key={i} className="text-[9px] bg-white border border-rose-200 px-1.5 py-0.5 rounded font-mono text-rose-700 font-semibold">
                                  {photo} (-ve)
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Positive Side: Source */}
                          <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl flex flex-col gap-1.5">
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-0.5 uppercase tracking-wider self-start font-mono">
                              Source Facility (+ve Side)
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                              {area.positiveObservation}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {area.sourcePhotos.map((photo, i) => (
                                <span key={i} className="text-[9px] bg-white border border-amber-200 px-1.5 py-0.5 rounded font-mono text-amber-700 font-semibold">
                                  {photo} (+ve)
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Point-wise MCQ Evaluation Checklists (CRITICAL USER REQUEST) */}
                        {area.checklist && area.checklist.length > 0 ? (
                          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                            <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-mono mb-3 pb-1.5 border-b border-slate-100 flex items-center justify-between">
                              <span>Point-wise Evaluation Checklist</span>
                              <span className="text-[9px] text-slate-400 font-normal">Standardized site assessment parameters</span>
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {area.checklist.map((item, cIdx) => (
                                <div key={cIdx} className="bg-white border border-slate-150 rounded-lg p-3 shadow-xs hover:border-slate-300 transition-all">
                                  <div className="flex items-start justify-between gap-2.5 mb-2">
                                    <span className="text-xs font-bold text-slate-800 leading-tight">
                                      {item.question}
                                    </span>
                                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                                      item.status === 'Pass' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                      item.status === 'Warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                      'bg-rose-50 text-rose-700 border border-rose-100'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </div>
                                  <div className="text-[10px] bg-slate-50 border border-slate-150 rounded p-2 font-mono mb-1 text-slate-700 leading-snug">
                                    <span className="text-[8px] text-slate-400 block uppercase tracking-wide font-bold mb-0.5">Selected Finding Choice:</span>
                                    <span className="font-semibold text-slate-900">{item.selectedAnswer}</span>
                                  </div>
                                  {item.finding && (
                                    <p className="text-[10px] text-slate-500 font-sans pl-1 mt-1">
                                      {item.finding}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-mono italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                            No point-wise checklist evaluated for this room.
                          </div>
                        )}

                        {/* Thermal Scanning Analysis & Canvas representation */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2 border-t border-slate-100 pt-4">
                          {/* Thermography canvas representation */}
                          <div className="lg:col-span-5 flex flex-col justify-center">
                            {area.thermalData.imageRef ? (
                              <ThermalCanvas
                                imageRef={area.thermalData.imageRef}
                                hotspot={area.thermalData.hotspot}
                                coldspot={area.thermalData.coldspot}
                                tempDiff={area.thermalData.tempDiff}
                                areaName={area.name}
                              />
                            ) : (
                              <div className="border border-slate-200 border-dashed rounded-xl bg-slate-50 p-4 text-center text-slate-400 font-mono text-xs">
                                Thermal scan reference not found.
                              </div>
                            )}
                          </div>

                          {/* Extra Commentary and Document proof photos */}
                          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                            <div className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-2 h-full">
                              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-slate-800 font-semibold block mb-0.5">Scientific Scan Commentary:</strong>
                                {area.thermalData.analysis}
                              </div>
                            </div>

                            {/* Extracted Document proof mockup boxes */}
                            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                              <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-2 flex justify-between">
                                <span>Verification Attachments</span>
                                <span className="text-slate-400">PDF original proofs</span>
                              </h5>
                              <div className="grid grid-cols-3 gap-2">
                                {area.photos.slice(0, 1).map((photo, pi) => (
                                  <div key={pi} className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col gap-1 items-center justify-center text-center">
                                    <svg className="w-8 h-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                      <rect x="2" y="2" width="20" height="20" rx="2" />
                                      <path d="M6 18c1.5-2 3.5-3 6-3s4.5 1 6 3" stroke="#e11d48" strokeWidth="2" opacity="0.7" />
                                    </svg>
                                    <span className="text-[9px] font-mono font-semibold text-slate-500 truncate w-full">{photo}</span>
                                  </div>
                                ))}
                                {area.sourcePhotos.slice(0, 2).map((photo, pi) => (
                                  <div key={pi} className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col gap-1 items-center justify-center text-center">
                                    <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                      <rect x="2" y="2" width="20" height="20" rx="2" />
                                      <circle cx="12" cy="12" r="4" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2,2" />
                                    </svg>
                                    <span className="text-[9px] font-mono font-semibold text-slate-500 truncate w-full">{photo}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setActiveTab("rootcause")}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-mono text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Proceed to Causes & Threat
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: ROOT CAUSE & THREAT */}
          {activeTab === "rootcause" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Root Cause Section */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">3. Diagnostic Root Cause</h3>
                    <p className="text-[9px] text-slate-400 font-mono">Physical and capillary water movement transmission pathology</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div className="md:col-span-2 text-sm text-slate-600 leading-relaxed">
                    <div className="whitespace-pre-line font-sans bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 text-xs leading-relaxed font-medium">
                      {report.rootCause}
                    </div>
                  </div>

                  {/* Flow Diagram */}
                  <div className="bg-slate-900 rounded-xl p-4 text-white flex flex-col gap-4 border border-slate-800">
                    <h5 className="text-[9px] font-mono text-slate-400 uppercase font-bold border-b border-slate-800 pb-1.5 flex items-center justify-between">
                      <span>Leak Transmission Path</span>
                      <span className="text-blue-400 font-normal">Capillary rise</span>
                    </h5>
                    <div className="flex flex-col gap-2.5 text-xs font-mono">
                      <div className="flex items-center gap-2 text-rose-400">
                        <span className="w-4 h-4 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center text-[10px] border border-rose-500/20">1</span>
                        <span>Open tile joint failure</span>
                      </div>
                      <div className="h-3 border-l border-slate-800 ml-2"></div>
                      <div className="flex items-center gap-2 text-amber-400">
                        <span className="w-4 h-4 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] border border-amber-500/20">2</span>
                        <span>Water log below tile bed</span>
                      </div>
                      <div className="h-3 border-l border-slate-800 ml-2"></div>
                      <div className="flex items-center gap-2 text-cyan-400">
                        <span className="w-4 h-4 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-[10px] border border-cyan-500/20">3</span>
                        <span>Capillary lateral rise</span>
                      </div>
                      <div className="h-3 border-l border-slate-800 ml-2"></div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <span className="w-4 h-4 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] border border-emerald-500/20">4</span>
                        <span>Evaporative flaking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Severity Assessment Section */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                    <AlertOctagon className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">4. Structural Threat Evaluation</h3>
                    <p className="text-[9px] text-slate-400 font-mono">Structural vulnerability threat appraisal</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className={`p-5 rounded-xl border shrink-0 md:w-80 flex flex-col items-center justify-center text-center ${severityColor[report.severityAssessment.level]}`}>
                    <AlertTriangle className="w-10 h-10 mb-2" />
                    <span className="text-[9px] uppercase font-bold tracking-wider font-mono text-slate-400">Assessed Threat Level</span>
                    <h4 className="text-2xl font-bold font-mono mt-1">{report.severityAssessment.level}</h4>
                    <p className="text-[10px] mt-1.5 font-mono leading-tight">{severityLabel[report.severityAssessment.level]}</p>
                  </div>
                  <div className="flex-1 text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h5 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider font-mono mb-2">Technical Justification:</h5>
                    <p className="whitespace-pre-line font-medium leading-relaxed">{report.severityAssessment.reasoning}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-6 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setActiveTab("therapies")}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-mono text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Proceed to Recommended Plan
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: RECOMMENDED PLAN */}
          {activeTab === "therapies" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                    <Hammer className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">5. Engineering Recommended Therapies</h3>
                    <p className="text-[9px] text-slate-400 font-mono">Structural repair and specialized waterproofing procedures</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {report.recommendedActions.map((action, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-white font-mono text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {action.category}
                      </h4>
                      <ul className="flex flex-col gap-2.5">
                        {action.steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-2 text-xs text-slate-600 font-sans leading-relaxed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="font-medium">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setActiveTab("notes")}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-mono text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Proceed to Notes & Gaps
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB 5: NOTES & GAPS */}
          {activeTab === "notes" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Additional Notes */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                    <Info className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">6. Technical & Liability Notes</h3>
                    <p className="text-[9px] text-slate-400 font-mono">Precautionary warnings and limitations of inspection methods</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line font-medium">
                  {report.additionalNotes}
                </p>
              </section>

              {/* Missing or Unclear Info */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                    <HelpCircle className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">7. Missing or Contradictory Document Gaps</h3>
                    <p className="text-[9px] text-slate-400 font-mono">Identified omissions and information missing from raw site files</p>
                  </div>
                </div>
                {report.missingInfo && report.missingInfo.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {report.missingInfo.map((info, idx) => (
                      <li key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-mono text-slate-600 leading-relaxed font-semibold">
                        <FileMinus className="text-rose-500 w-4 h-4 shrink-0 mt-0.5" />
                        <span>{info}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-400 font-mono bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    All expected information is fully accounted for. No gaps reported.
                  </div>
                )}
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
