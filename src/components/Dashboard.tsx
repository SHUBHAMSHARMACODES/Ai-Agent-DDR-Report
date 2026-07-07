import React from "react";
import { DDRReport } from "../types";
import { 
  BarChart3, Activity, Droplets, Thermometer, ShieldAlert, 
  MapPin, CheckCircle, HelpCircle, FileText, Sparkles, Building, Waves 
} from "lucide-react";

interface DashboardProps {
  reports: DDRReport[];
  selectedReportId: string | null;
  onSelectReport: (id: string) => void;
  onLoadSample: () => void;
  setActiveTab: (tab: "dashboard" | "viewer" | "studio") => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onLoadSample,
  setActiveTab,
}) => {
  // Compute analytics based on reports
  const totalReports = reports.length;
  const activeLeaks = reports.reduce((sum, r) => sum + (r.areaObservations?.length || 0), 0);
  
  // Calculate average delta T
  let totalDelta = 0;
  let deltaCount = 0;
  reports.forEach(r => {
    r.areaObservations?.forEach(obs => {
      const diff = parseFloat(obs.thermalData?.tempDiff);
      if (!isNaN(diff)) {
        totalDelta += diff;
        deltaCount++;
      }
    });
  });
  const avgDelta = deltaCount > 0 ? (totalDelta / deltaCount).toFixed(1) : "0.0";

  // Check if there are no reports yet and show clean start layout
  if (totalReports === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 p-8 flex items-center justify-center min-h-[90vh]">
        <div className="max-w-xl w-full text-center bg-white border border-slate-200 rounded-3xl p-10 shadow-lg flex flex-col items-center gap-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shadow-md animate-pulse">
            <Sparkles className="w-10 h-10" />
          </div>
          <div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full uppercase font-mono tracking-wider">
              No Data Processed Yet
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-3 tracking-tight">Your Portfolio is Empty</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-md mx-auto">
              Welcome to UrbanRoof AI DDR Report Engine. You haven't uploaded any PDF inspection reports or thermal scans yet. Please upload your documents to generate a live, interactive Detailed Diagnostic Report (DDR).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-4">
            <button
              onClick={() => setActiveTab("studio")}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-95 text-white font-mono text-xs font-bold py-3 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              Upload & Merge PDFs
            </button>
            <button
              onClick={onLoadSample}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold py-3 px-5 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              Load Demo Sample
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header Hero */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Building className="w-3.5 h-3.5" />
              <span>Multi-Site Structural Inspection Portfolio</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Diagnostic Intelligence Dashboard</h2>
            <p className="text-xs text-slate-500 mt-1">
              Real-time telemetry overview of non-destructive visual surveys, thermography scans, and capillary leakage pathways.
            </p>
          </div>

          <button
            onClick={() => setActiveTab("studio")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold rounded-xl shadow-sm transition-all shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Launch AI Workshop
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Total Reports</span>
              <h4 className="text-xl font-bold font-mono text-slate-800 mt-0.5">{totalReports} Units</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Dampness Zones</span>
              <h4 className="text-xl font-bold font-mono text-slate-800 mt-0.5">{activeLeaks} Areas</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Avg Thermal Delta</span>
              <h4 className="text-xl font-bold font-mono text-slate-800 mt-0.5">-{avgDelta}°C</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Unresolved Gaps</span>
              <h4 className="text-2xl font-bold font-mono mt-1 text-rose-600">Active Alert</h4>
            </div>
          </div>
        </div>

        {/* Diagnostic Structural Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Blueprint Heatmap Map */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-8 flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Flat 103 Structural Diagnostic Blueprint</h3>
                <p className="text-[10px] text-slate-400 font-mono">Cross-referencing observed internal dampness to wet facilities</p>
              </div>
              <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <Waves className="w-3 h-3 text-blue-500 animate-pulse" />
                Active Infiltration
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 flex-1 min-h-[300px] flex items-center justify-center border border-slate-800 relative">
              {/* High-fidelity architectural vector draft showing water flow */}
              <svg className="w-full h-full max-w-[480px] max-h-[280px]" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Structural Walls */}
                <rect x="10" y="10" width="380" height="220" stroke="#475569" strokeWidth="2.5" strokeDasharray="3,3" />
                
                {/* Internal Compartments */}
                <line x1="140" y1="10" x2="140" y2="230" stroke="#334155" strokeWidth="2" /> {/* Hall boundary */}
                <line x1="140" y1="130" x2="390" y2="130" stroke="#334155" strokeWidth="2" /> {/* Horizontal split */}
                <line x1="260" y1="130" x2="260" y2="230" stroke="#334155" strokeWidth="2" /> {/* Kitchen partition */}
                <line x1="260" y1="10" x2="260" y2="130" stroke="#334155" strokeWidth="2" /> {/* Bathroom boundary */}

                {/* Text Labels */}
                <text x="35" y="40" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">HALLWAY</text>
                <text x="165" y="40" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">COMMON BATHROOM</text>
                <text x="290" y="40" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">MASTER BDRM</text>
                <text x="165" y="165" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">COMMON BDRM</text>
                <text x="290" y="165" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">KITCHEN</text>

                {/* Leak Indicator Circles & Capillary Transmission Lines */}
                {/* 1. Common Bathroom tile failure rising in hallway & common bedroom skirting */}
                {/* Leak core inside Common Bathroom */}
                <circle cx="200" cy="50" r="14" fill="#ef4444" fillOpacity="0.25" className="animate-ping" />
                <circle cx="200" cy="50" r="6" fill="#f59e0b" />
                <text x="195" y="53" fill="#ffffff" fontSize="9" fontWeight="bold">B1</text>
                {/* Capillary paths to Hall skirting (left) */}
                <path d="M 200 50 Q 140 40 100 45" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="2,3" />
                <circle cx="100" cy="45" r="4" fill="#3b82f6" />
                {/* Capillary path to Common Bedroom skirting (down) */}
                <path d="M 200 50 Q 190 110 180 145" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="2,3" />
                <circle cx="180" cy="145" r="4" fill="#3b82f6" />

                {/* 2. Master bathroom tile gaps seepage to master bedroom & kitchen */}
                <circle cx="330" cy="50" r="12" fill="#ef4444" fillOpacity="0.25" />
                <circle cx="330" cy="50" r="5" fill="#f59e0b" />
                <text x="326" y="53" fill="#ffffff" fontSize="8" fontWeight="bold">B2</text>
                {/* Path to Master bed skirting */}
                <path d="M 330 50 Q 350 80 340 100" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="2,2" />
                <circle cx="340" cy="100" r="3.5" fill="#3b82f6" />
                {/* Path to Kitchen skirting */}
                <path d="M 330 50 Q 320 120 310 180" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="2,2" />
                <circle cx="310" cy="180" r="3.5" fill="#3b82f6" />

                {/* 3. External Facade Ingress (Master Bed wall) */}
                <path d="M 390 60 Q 380 75 365 75" fill="none" stroke="#f43f5e" strokeWidth="2" />
                <circle cx="365" cy="75" r="4.5" fill="#f43f5e" />
                <text x="360" y="70" fill="#f43f5e" fontSize="7" fontWeight="bold" fontFamily="monospace">Facade Crack</text>
              </svg>

              {/* Absolute Map Key Info overlays */}
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded px-2 py-1 text-[9px] font-mono text-slate-400">
                <span className="text-amber-400 font-bold">B1/B2</span> = Grouting / Pipe Defect Source
              </div>
              <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded px-2 py-1 text-[9px] font-mono text-slate-400">
                <span className="text-blue-400 font-bold">Blue Dots</span> = Rising Damp Area (-ve side)
              </div>
            </div>
          </div>

          {/* Quick Portfolio Status list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3">
              Inspected Portfolio ({totalReports})
            </h3>
            
            <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto max-h-[300px]">
              {reports.map((report) => (
                <div 
                  key={report.id}
                  className="group border border-slate-150 rounded-xl p-3.5 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-300 transition-all cursor-pointer"
                  onClick={() => {
                    onSelectReport(report.id);
                    setActiveTab("viewer");
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                        {report.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {report.clientName}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[9px] font-mono border-t border-slate-200 pt-2 text-slate-400">
                    <span>{report.areaObservations?.length || 0} Ingress Zones</span>
                    <span className="bg-rose-100/50 text-rose-700 px-1.5 py-0.2 rounded uppercase font-semibold">
                      {report.severityAssessment?.level || "Medium"} Threat
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7 Section Deliverable Checklist Tracker */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono mb-4 border-b border-slate-100 pb-2">
            7-Section DDR Compilation Compliance Checklist
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "1. Property Issue Summary",
              "2. Area-wise Observations",
              "3. Probable Root Cause",
              "4. Severity Assessment",
              "5. Recommended Actions",
              "6. Additional Notes",
              "7. Missing/Unclear Information"
            ].map((section, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-mono font-medium text-slate-700">{section}</span>
              </div>
            ))}
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-700">Thermal Scan Mappings</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
