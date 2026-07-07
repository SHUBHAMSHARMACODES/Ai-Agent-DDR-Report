import React, { useState } from "react";
import { Thermometer, Eye, Grid } from "lucide-react";

interface ThermalCanvasProps {
  imageRef: string;
  hotspot: string;
  coldspot: string;
  tempDiff: string;
  areaName: string;
}

export const ThermalCanvas: React.FC<ThermalCanvasProps> = ({
  imageRef,
  hotspot,
  coldspot,
  tempDiff,
  areaName,
}) => {
  const [viewMode, setViewMode] = useState<"thermal" | "normal">("thermal");

  // Parse temperatures to display dynamic details
  const hotNum = parseFloat(hotspot) || 28.0;
  const coldNum = parseFloat(coldspot) || 20.0;
  const diffNum = parseFloat(tempDiff) || (hotNum - coldNum);

  return (
    <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-sm flex flex-col h-full">
      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex justify-between items-center text-xs font-mono text-slate-600">
        <span className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Thermometer className="w-4 h-4 text-rose-500 animate-pulse" />
          Thermal Scan: {imageRef}
        </span>
        <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
          <button
            onClick={() => setViewMode("thermal")}
            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
              viewMode === "thermal"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Thermal Heatmap
          </button>
          <button
            onClick={() => setViewMode("normal")}
            className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
              viewMode === "normal"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Visual Inspection
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
        {viewMode === "thermal" ? (
          <div className="w-full h-full relative flex flex-col justify-between">
            {/* SVG Heatmap Simulation */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Simulated moisture gradient (cold spots) and masonry joints */}
                <radialGradient id="coldSpotGrad" cx="45%" cy="65%" r="35%" fx="45%" fy="65%">
                  <stop offset="0%" stopColor="#00c0ff" stopOpacity="0.85" />
                  <stop offset="35%" stopColor="#0044ff" stopOpacity="0.75" />
                  <stop offset="65%" stopColor="#4400aa" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#110033" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="wallBackground" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#aa5500" />
                  <stop offset="50%" stopColor="#448800" />
                  <stop offset="100%" stopColor="#330055" />
                </linearGradient>
              </defs>

              {/* Background Heat Profile */}
              <rect width="100%" height="100%" fill="url(#wallBackground)" opacity="0.85" />

              {/* Grid Lines for high-tech look */}
              <g stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1">
                <line x1="0" y1="25%" x2="100%" y2="25%" />
                <line x1="0" y1="50%" x2="100%" y2="50%" />
                <line x1="0" y1="75%" x2="100%" y2="75%" />
                <line x1="25%" y1="0" x2="25%" y2="100%" />
                <line x1="50%" y1="0" x2="50%" y2="100%" />
                <line x1="75%" y1="0" x2="75%" y2="100%" />
              </g>

              {/* Cold active moisture zone */}
              <rect width="100%" height="100%" fill="url(#coldSpotGrad)" />

              {/* Joint Line Seepage Simulation */}
              <path
                d="M 10 140 Q 120 180 280 150 T 400 130"
                fill="none"
                stroke="#00ffff"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.4"
                className="animate-pulse"
              />
              <path
                d="M 10 140 Q 120 180 280 150 T 400 130"
                fill="none"
                stroke="#0000ff"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.6"
              />

              {/* Annotations / Crosshairs */}
              {/* Hotspot (Dry Wall) */}
              <g transform="translate(180, 50)" className="cursor-pointer">
                <circle r="8" fill="none" stroke="#ff3300" strokeWidth="1.5" />
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#ff3300" strokeWidth="1" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#ff3300" strokeWidth="1" />
                <rect x="15" y="-10" width="60" height="18" rx="3" fill="#000" fillOpacity="0.75" />
                <text x="20" y="3" fill="#ff4444" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  +{hotspot}
                </text>
              </g>

              {/* Coldspot (Moisture Core) */}
              <g transform="translate(160, 150)" className="cursor-pointer">
                <circle r="8" fill="none" stroke="#00ffff" strokeWidth="1.5" className="animate-ping" />
                <circle r="8" fill="none" stroke="#00ffff" strokeWidth="1.5" />
                <line x1="-12" y1="0" x2="12" y2="0" stroke="#00ffff" strokeWidth="1" />
                <line x1="0" y1="-12" x2="0" y2="12" stroke="#00ffff" strokeWidth="1" />
                <rect x="15" y="-10" width="60" height="18" rx="3" fill="#000" fillOpacity="0.75" />
                <text x="20" y="3" fill="#00ffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  -{coldspot}
                </text>
              </g>

              {/* Scale Sidebar */}
              <g transform="translate(350, 20)">
                <rect width="12" height="150" rx="3" fill="url(#scaleGradient)" />
                <text x="18" y="10" fill="#ff5555" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {hotspot}
                </text>
                <text x="18" y="80" fill="#55ff55" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {((hotNum + coldNum) / 2).toFixed(1)}°C
                </text>
                <text x="18" y="145" fill="#00ffff" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  {coldspot}
                </text>
              </g>

              <defs>
                <linearGradient id="scaleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#aa5500" />
                  <stop offset="50%" stopColor="#448800" />
                  <stop offset="100%" stopColor="#0044ff" />
                </linearGradient>
              </defs>
            </svg>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] text-slate-300 font-mono">
              <span>Evaporative Cooling Active</span>
              <span className="text-cyan-400 font-semibold">ΔT: {tempDiff}</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative flex flex-col justify-between">
            {/* Realistic SVG Representation of Plaster Damage / Tile Gaps */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#ded6cc" /> {/* Dry plaster color */}
              
              {/* Grid tiles / wall texture pattern */}
              <g stroke="#c0b5a6" strokeWidth="1.5">
                <line x1="0" y1="20%" x2="100%" y2="20%" />
                <line x1="0" y1="40%" x2="100%" y2="40%" />
                <line x1="0" y1="60%" x2="100%" y2="60%" />
                <line x1="0" y1="80%" x2="100%" y2="80%" />
                <line x1="20%" y1="0" x2="20%" y2="100%" />
                <line x1="40%" y1="0" x2="40%" y2="100%" />
                <line x1="60%" y1="0" x2="60%" y2="100%" />
                <line x1="80%" y1="0" x2="80%" y2="100%" />
              </g>

              {/* Damp area overlay (darkened plaster) */}
              <path
                d="M 50 120 C 100 120, 110 200, 200 200 C 270 200, 280 140, 310 140 C 330 140, 310 210, 380 210 L 380 220 L 50 220 Z"
                fill="#8f8171"
                opacity="0.65"
              />
              
              {/* Efflorescence salts (white/gray specs) */}
              <path
                d="M 80 150 Q 120 140 180 160 T 260 170"
                fill="none"
                stroke="#ffffff"
                strokeWidth="6"
                strokeDasharray="2,5"
                opacity="0.8"
              />
              <path
                d="M 60 180 Q 100 160 150 180 T 220 190"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="4"
                strokeDasharray="4,8"
                opacity="0.9"
              />

              {/* Peeling paint outlines */}
              <path
                d="M 90 145 Q 110 135 140 150 T 190 155"
                fill="none"
                stroke="#695c4e"
                strokeWidth="1.5"
                opacity="0.7"
              />

              {/* Joint Line Gap Highlight (Red/Orange pointing to leak source) */}
              <line x1="80%" y1="60%" x2="80%" y2="80%" stroke="#ff3300" strokeWidth="2.5" strokeDasharray="3,3" />
              <circle cx="80%" cy="60%" r="4" fill="#ff3300" />
              <circle cx="80%" cy="80%" r="4" fill="#ff3300" />

              <rect x="250" y="25" width="115" height="40" rx="4" fill="#000" fillOpacity="0.8" />
              <text x="256" y="40" fill="#ffaa00" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                Damaged Area Details:
              </text>
              <text x="256" y="55" fill="#ffffff" fontSize="9" fontFamily="sans-serif">
                - Active Skirting Dampness
              </text>
            </svg>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] text-slate-300 font-mono">
              <span>Visible Capillary Dampness / Salts</span>
              <span className="text-amber-400 font-semibold">{areaName}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white flex flex-col gap-1 text-[11px] text-slate-500 border-t border-slate-100">
        <div className="flex justify-between font-mono">
          <span>Thermal Delta (ΔT):</span>
          <span className="text-slate-800 font-bold">{tempDiff} (Signifies Active Leak)</span>
        </div>
        <div className="flex justify-between font-mono">
          <span>Cold Core:</span>
          <span className="text-blue-600 font-semibold">{coldspot} (Wet Evaporation Zone)</span>
        </div>
        <div className="flex justify-between font-mono">
          <span>Dry Reference:</span>
          <span className="text-rose-600 font-semibold">{hotspot} (Dry Surrounding Shell)</span>
        </div>
      </div>
    </div>
  );
};
