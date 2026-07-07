import React from "react";
import { FileText, Plus, Database, Sparkles, HelpCircle, ShieldAlert, Layers, Trash2, FileSearch } from "lucide-react";
import { DDRReport } from "../types";

interface SidebarProps {
  reports: DDRReport[];
  selectedReportId: string | null;
  onSelectReport: (id: string) => void;
  onNewReport: () => void;
  onDeleteReport: (id: string) => void;
  onLoadSample: () => void;
  activeTab: "dashboard" | "viewer" | "studio";
  setActiveTab: (tab: "dashboard" | "viewer" | "studio") => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  onNewReport,
  onDeleteReport,
  onLoadSample,
  activeTab,
  setActiveTab,
}) => {
  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300">
      {/* Branding Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/10">
          <Layers className="w-5.5 h-5.5 text-white stroke-[2]" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide uppercase">UrbanRoof AI</h1>
          <p className="text-[10px] text-slate-500 font-mono">DDR Report Engine v2.0</p>
        </div>
      </div>

      {/* Main Actions */}
      <div className="p-4 border-b border-slate-800 flex flex-col gap-2">
        <button
          onClick={onNewReport}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium py-2.5 px-4 rounded-xl shadow-md hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Report
        </button>

        {reports.length === 0 && (
          <button
            onClick={onLoadSample}
            className="w-full bg-slate-800/40 border border-slate-700/60 text-slate-300 hover:bg-slate-800/80 font-medium py-2 px-3 rounded-lg text-[10px] transition-all flex items-center justify-center gap-1.5 font-mono cursor-pointer"
          >
            <FileSearch className="w-3.5 h-3.5 text-amber-500" />
            Load Sample/Demo DDR
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="p-4 flex flex-col gap-1.5 flex-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2.5 mb-2 font-mono">
          Main Workspace
        </div>

        <button
          onClick={() => setActiveTab("dashboard")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "dashboard"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <Database className="w-4.5 h-4.5" />
          Analytics Dashboard
        </button>

        <button
          onClick={() => {
            if (reports.length > 0 && !selectedReportId) {
              onSelectReport(reports[0].id);
            }
            setActiveTab("viewer");
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "viewer"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <FileText className="w-4.5 h-4.5" />
          Detailed DDR Viewer
        </button>

        <button
          onClick={() => setActiveTab("studio")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === "studio"
              ? "bg-slate-800 text-white shadow-sm"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <Sparkles className="w-4.5 h-4.5 text-amber-400" />
          AI Synthesis Studio
        </button>

        {/* Saved Diagnostic Reports */}
        <div className="mt-6 text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2.5 mb-2 font-mono flex items-center justify-between">
          <span>Saved Reports ({reports.length})</span>
        </div>

        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[260px] pr-1 scrollbar-thin">
          {reports.length === 0 ? (
            <div className="px-3 py-4 text-center text-[11px] font-mono text-slate-600 bg-slate-800/10 rounded-xl border border-dashed border-slate-800/80">
              No reports saved yet.
            </div>
          ) : (
            reports.map((report) => {
              const hasDiscrepancy = report.discrepancies?.length > 0;
              return (
                <div
                  key={report.id}
                  className={`group relative w-full rounded-lg transition-all border p-3 flex flex-col gap-1 ${
                    selectedReportId === report.id && activeTab === "viewer"
                      ? "bg-amber-500/10 border-amber-500/30 text-white"
                      : "border-transparent bg-slate-850/20 text-slate-400 hover:bg-slate-800/40 hover:text-white"
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectReport(report.id);
                      setActiveTab("viewer");
                    }}
                    className="w-full text-left flex flex-col gap-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full pr-6">
                      <span className="font-medium text-xs truncate max-w-[140px]">
                        {report.title || "Diagnostic Report"}
                      </span>
                      {hasDiscrepancy && (
                        <span className="text-[8px] bg-rose-500/15 text-rose-400 border border-rose-500/30 px-1.5 py-0.2 rounded-full font-mono flex items-center gap-0.5 scale-90">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          Alert
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 group-hover:text-slate-400">
                      <span className="truncate max-w-[100px]">Client: {report.clientName}</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>

                  {/* Delete Report Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this report?")) {
                        onDeleteReport(report.id);
                      }
                    }}
                    className="absolute right-2 top-3 text-slate-600 hover:text-rose-400 p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-slate-800 cursor-pointer"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          Help & Diagnostic Support
        </div>
        <p className="text-[10px] text-slate-600 font-mono leading-tight">
          All reports comply with non-destructive structural inspection standards.
        </p>
      </div>
    </aside>
  );
};
