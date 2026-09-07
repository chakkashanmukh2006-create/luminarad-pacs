import React, { useRef, useState, useEffect } from 'react';
import type { ClinicalStudy } from '../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sun,
  Eye,
  Ruler,
} from 'lucide-react';

interface DicomViewportProps {
  study: ClinicalStudy;
  isAnalyzing: boolean;
  hasAnalyzed: boolean;
}

interface Measurement {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distanceMm: number;
}

export const DicomViewport: React.FC<DicomViewportProps> = ({
  study,
  isAnalyzing,
  hasAnalyzed,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport transformation states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Windowing & Display presets
  const [windowPreset, setWindowPreset] = useState<'default' | 'lung' | 'bone' | 'softTissue'>('default');
  const [windowWidth, setWindowWidth] = useState(study.metadata.windowWidth);
  const [windowCenter, setWindowCenter] = useState(study.metadata.windowCenter);
  const [isInverted, setIsInverted] = useState(false);

  // AI Overlays
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.68);

  // Tool Modes
  const [activeTool, setActiveTool] = useState<'pan' | 'window' | 'caliper'>('pan');

  // Caliper measurements
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentCaliper, setCurrentCaliper] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // Hover HU & cursor coordinates
  const [hoverData, setHoverData] = useState<{ x: number; y: number; hu: number } | null>(null);

  // Image load state
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset viewport when study changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setWindowWidth(study.metadata.windowWidth);
    setWindowCenter(study.metadata.windowCenter);
    setWindowPreset('default');
    setIsInverted(false);
    setMeasurements([]);
    setCurrentCaliper(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = study.imageUrl;
    img.onload = () => {
      imageObjRef.current = img;
      setImageLoaded(true);
      renderBaseImage();
      renderHeatmap();
    };
  }, [study.id, study.imageUrl]);

  // Handle Preset changes
  const applyPreset = (preset: 'default' | 'lung' | 'bone' | 'softTissue') => {
    setWindowPreset(preset);
    if (preset === 'default') {
      setWindowWidth(study.metadata.windowWidth);
      setWindowCenter(study.metadata.windowCenter);
    } else if (preset === 'lung') {
      setWindowWidth(1500);
      setWindowCenter(-600);
    } else if (preset === 'bone') {
      setWindowWidth(2200);
      setWindowCenter(450);
    } else if (preset === 'softTissue') {
      setWindowWidth(400);
      setWindowCenter(50);
    }
  };

  // Re-render when image, invert, or windowing changes
  useEffect(() => {
    if (imageLoaded) {
      renderBaseImage();
      renderHeatmap();
    }
  }, [imageLoaded, windowWidth, windowCenter, isInverted, heatmapOpacity, showHeatmap, study]);

  // Render base radiograph with window/level contrast
  const renderBaseImage = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1024;
    canvas.height = 1024;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Compute contrast/brightness filter based on Window Width and Window Center
    const contrastRatio = Math.min(Math.max(350 / (windowWidth || 350), 0.5), 2.5);
    const brightnessRatio = Math.min(Math.max(1 + (windowCenter - 40) / 400, 0.4), 2.0);

    ctx.filter = `contrast(${contrastRatio * 100}%) brightness(${brightnessRatio * 100}%) ${
      isInverted ? 'invert(100%)' : ''
    }`;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';
  };

  // Render Grad-CAM Heatmap onto overlay canvas
  const renderHeatmap = () => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1024;
    canvas.height = 1024;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showHeatmap || !study.anomalyDetected || !hasAnalyzed) return;

    const { x, y, radius, intensity } = study.heatmapCenter;
    const cx = x * canvas.width;
    const cy = y * canvas.height;
    const radPx = radius * canvas.width * 1.5;

    // Multi-stop Jet/Turbo thermal gradient
    const gradient = ctx.createRadialGradient(cx, cy, 2, cx, cy, radPx);
    gradient.addColorStop(0, `rgba(239, 68, 68, ${0.95 * heatmapOpacity * intensity})`); // Red core
    gradient.addColorStop(0.25, `rgba(249, 115, 22, ${0.85 * heatmapOpacity * intensity})`); // Orange
    gradient.addColorStop(0.5, `rgba(234, 179, 8, ${0.7 * heatmapOpacity * intensity})`); // Yellow
    gradient.addColorStop(0.75, `rgba(6, 182, 212, ${0.45 * heatmapOpacity * intensity})`); // Cyan
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)'); // Fades to transparent

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, radPx, 0, Math.PI * 2);
    ctx.fill();

    // Secondary subtle heat bloom around pathology
    const outerGrad = ctx.createRadialGradient(cx, cy, radPx * 0.4, cx, cy, radPx * 1.6);
    outerGrad.addColorStop(0, `rgba(168, 85, 247, ${0.25 * heatmapOpacity})`);
    outerGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radPx * 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 6));
  };

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (activeTool === 'window') {
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
    } else if (activeTool === 'caliper') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setCurrentCaliper({ x1: x, y1: y, x2: x, y2: y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const normX = Math.min(Math.max((e.clientX - rect.left - pan.x) / (rect.width * zoom), 0), 1);
      const normY = Math.min(Math.max((e.clientY - rect.top - pan.y) / (rect.height * zoom), 0), 1);
      // Realistic estimated HU based on region and anomaly center
      const distToAnomaly = Math.hypot(normX - study.heatmapCenter.x, normY - study.heatmapCenter.y);
      let calculatedHu = -450 + Math.round((1 - normY) * 350); // lung baseline
      if (study.bodyPart === 'LEG') {
        calculatedHu = 380 + Math.round((1 - Math.abs(normX - 0.5)) * 600); // cortical bone
      }
      if (distToAnomaly < 0.12) {
        calculatedHu = study.boundingBoxes[0]?.densityHu || 65;
      }
      setHoverData({
        x: Math.round(normX * 1024),
        y: Math.round(normY * 1024),
        hu: calculatedHu,
      });
    }

    if (!isPanning && !currentCaliper) return;

    if (activeTool === 'pan') {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (activeTool === 'window') {
      const dx = e.clientX - startPan.x;
      const dy = e.clientY - startPan.y;
      setWindowWidth((prev) => Math.max(prev + dx * 2, 50));
      setWindowCenter((prev) => prev - dy);
      setStartPan({ x: e.clientX, y: e.clientY });
    } else if (activeTool === 'caliper' && currentCaliper && rect) {
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setCurrentCaliper({ ...currentCaliper, x2: x, y2: y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (activeTool === 'caliper' && currentCaliper) {
      const dx = currentCaliper.x2 - currentCaliper.x1;
      const dy = currentCaliper.y2 - currentCaliper.y1;
      const pixelDist = Math.hypot(dx, dy);
      if (pixelDist > 5) {
        const mm = pixelDist * (study.metadata.pixelSpacing[0] || 0.143);
        setMeasurements((prev) => [
          ...prev,
          {
            x1: currentCaliper.x1,
            y1: currentCaliper.y1,
            x2: currentCaliper.x2,
            y2: currentCaliper.y2,
            distanceMm: Number(mm.toFixed(1)),
          },
        ]);
      }
      setCurrentCaliper(null);
    }
  };

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    applyPreset('default');
    setIsInverted(false);
    setMeasurements([]);
  };

  return (
    <div className="dicom-workstation-container">
      {/* Top Workstation Controls Bar */}
      <div className="workstation-toolbar">
        {/* Tool Modes */}
        <div className="tool-group">
          <button
            className={`tool-btn ${activeTool === 'pan' ? 'active' : ''}`}
            onClick={() => setActiveTool('pan')}
            title="Pan / Navigate Mode"
          >
            <Maximize2 size={15} />
            <span>Pan</span>
          </button>
          <button
            className={`tool-btn ${activeTool === 'window' ? 'active' : ''}`}
            onClick={() => setActiveTool('window')}
            title="Interactive Window / Level Drag"
          >
            <Sun size={15} />
            <span>W/L Drag</span>
          </button>
          <button
            className={`tool-btn ${activeTool === 'caliper' ? 'active' : ''}`}
            onClick={() => setActiveTool('caliper')}
            title="Digital Caliper (Measure Lesion / Bone in mm)"
          >
            <Ruler size={15} />
            <span>Caliper</span>
            {measurements.length > 0 && <span className="caliper-count">{measurements.length}</span>}
          </button>
        </div>

        <div className="divider-vert" />

        {/* Window Presets */}
        <div className="tool-group">
          <span className="preset-label">Window:</span>
          <button
            className={`preset-pill ${windowPreset === 'default' ? 'active' : ''}`}
            onClick={() => applyPreset('default')}
          >
            Std
          </button>
          <button
            className={`preset-pill ${windowPreset === 'lung' ? 'active' : ''}`}
            onClick={() => applyPreset('lung')}
          >
            Lung
          </button>
          <button
            className={`preset-pill ${windowPreset === 'bone' ? 'active' : ''}`}
            onClick={() => applyPreset('bone')}
          >
            Bone
          </button>
          <button
            className={`preset-pill ${windowPreset === 'softTissue' ? 'active' : ''}`}
            onClick={() => applyPreset('softTissue')}
          >
            Soft
          </button>
        </div>

        <div className="divider-vert" />

        {/* Zoom & Invert actions */}
        <div className="tool-group">
          <button
            className="tool-btn icon-only"
            onClick={() => setZoom((z) => Math.min(z * 1.2, 6))}
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
          <button
            className="tool-btn icon-only"
            onClick={() => setZoom((z) => Math.max(z / 1.2, 0.4))}
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            className={`tool-btn ${isInverted ? 'active' : ''}`}
            onClick={() => setIsInverted(!isInverted)}
            title="Invert Grayscale (Black/White Bone)"
          >
            <Eye size={15} />
            <span>Invert</span>
          </button>
          <button className="tool-btn icon-only" onClick={resetViewport} title="Reset Viewport">
            <RotateCcw size={15} />
          </button>
        </div>

        <div className="divider-vert" />

        {/* AI Heatmap & Bounding Box Toggles */}
        <div className="ai-overlay-controls">
          <label className="checkbox-label" title="Toggle Grad-CAM Attention Heatmap">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
            />
            <span className="checkbox-text">Heatmap</span>
          </label>
          <label className="checkbox-label" title="Toggle Anomaly Bounding Box">
            <input
              type="checkbox"
              checked={showBoundingBoxes}
              onChange={(e) => setShowBoundingBoxes(e.target.checked)}
            />
            <span className="checkbox-text">Boxes</span>
          </label>
          <div className="opacity-slider-wrap" title="Heatmap Opacity">
            <span className="slider-label">Alpha:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
              style={{ width: '60px' }}
            />
          </div>
        </div>
      </div>

      {/* Main Medical DICOM Canvas Viewport */}
      <div
        ref={containerRef}
        className={`dicom-viewport-canvas-wrapper ${activeTool}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Laser scanner animation while running DL analysis */}
        {isAnalyzing && <div className="laser-scanner-line" />}

        {/* Medical Viewport Canvas Canvas Layer with Pan/Zoom */}
        <div
          className="canvas-transform-layer"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Base Radiograph Canvas */}
          <canvas ref={canvasRef} className="dicom-base-canvas" />

          {/* Grad-CAM Heatmap Canvas */}
          <canvas ref={heatmapCanvasRef} className="dicom-heatmap-canvas" />

          {/* Caliper Measurement SVG Layer */}
          <svg className="caliper-svg-layer">
            {measurements.map((m, idx) => (
              <g key={idx} className="caliper-group">
                <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} className="caliper-line" />
                <circle cx={m.x1} cy={m.y1} r={3} className="caliper-endpoint" />
                <circle cx={m.x2} cy={m.y2} r={3} className="caliper-endpoint" />
                <text
                  x={(m.x1 + m.x2) / 2 + 5}
                  y={(m.y1 + m.y2) / 2 - 5}
                  className="caliper-text"
                >
                  {m.distanceMm} mm
                </text>
              </g>
            ))}
            {currentCaliper && (
              <g className="caliper-group active">
                <line
                  x1={currentCaliper.x1}
                  y1={currentCaliper.y1}
                  x2={currentCaliper.x2}
                  y2={currentCaliper.y2}
                  className="caliper-line active"
                />
                <circle cx={currentCaliper.x1} cy={currentCaliper.y1} r={3} className="caliper-endpoint" />
                <circle cx={currentCaliper.x2} cy={currentCaliper.y2} r={3} className="caliper-endpoint" />
              </g>
            )}
          </svg>

          {/* Anomaly Bounding Box & Pathology Tag */}
          {hasAnalyzed &&
            showBoundingBoxes &&
            study.boundingBoxes.map((box, idx) => {
              const leftPx = (box.x / 100) * 1024;
              const topPx = (box.y / 100) * 1024;
              const widthPx = (box.width / 100) * 1024;
              const heightPx = (box.height / 100) * 1024;

              return (
                <div
                  key={idx}
                  className="anomaly-bounding-box"
                  style={{
                    left: `${leftPx}px`,
                    top: `${topPx}px`,
                    width: `${widthPx}px`,
                    height: `${heightPx}px`,
                  }}
                >
                  <div className="box-corner tl" />
                  <div className="box-corner tr" />
                  <div className="box-corner bl" />
                  <div className="box-corner br" />

                  <div className="anomaly-tag-badge">
                    <span className="anomaly-tag-alert">●</span>
                    <span className="anomaly-tag-label">{box.label}</span>
                    <span className="anomaly-tag-conf">{(box.confidence * 100).toFixed(1)}%</span>
                  </div>

                  <div className="anomaly-dimension-pill">
                    d: {box.diameterMm} mm | {box.densityHu} HU
                  </div>
                </div>
              );
            })}
        </div>

        {/* True DICOM 4-Corner HUD (Heads-Up Display) */}
        <div className="dicom-hud hud-top-left">
          <div className="hud-primary">{study.metadata.institutionName}</div>
          <div className="hud-line">
            <span className="hud-bold">{study.metadata.patientName}</span>
          </div>
          <div className="hud-line">ID: {study.metadata.patientId}</div>
          <div className="hud-line">
            AGE: {study.metadata.patientAge} / {study.metadata.patientSex}
          </div>
        </div>

        <div className="dicom-hud hud-top-right">
          <div className="hud-primary">
            MOD: {study.metadata.modality} ({study.metadata.viewPosition})
          </div>
          <div className="hud-line">PART: {study.metadata.bodyPart}</div>
          <div className="hud-line">DATE: {study.metadata.studyDate}</div>
          <div className="hud-line">MANUF: {study.metadata.manufacturer}</div>
        </div>

        <div className="dicom-hud hud-bottom-left">
          <div className="hud-line">
            ZOOM: <span className="hud-value">{(zoom * 100).toFixed(0)}%</span>
          </div>
          <div className="hud-line">
            WW/WL: <span className="hud-value">{windowWidth} / {windowCenter}</span>
          </div>
          <div className="hud-line">
            PRESET: <span className="hud-value">{windowPreset.toUpperCase()}</span>
          </div>
          {isInverted && <div className="hud-line hud-warn">INVERTED MONOCHROME1</div>}
        </div>

        <div className="dicom-hud hud-bottom-right">
          <div className="hud-line">
            kVp: {study.metadata.kvp} | mA: {study.metadata.xrayTubeCurrent}
          </div>
          <div className="hud-line">EXP: {study.metadata.exposureTime} ms</div>
          <div className="hud-line">
            SPACE: {study.metadata.pixelSpacing[0]}x{study.metadata.pixelSpacing[1]} mm
          </div>
          {hoverData && (
            <div className="hud-line hud-live-coord">
              [X:{hoverData.x}, Y:{hoverData.y}] ~ {hoverData.hu} HU
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dicom-workstation-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #020409;
          border-right: 1px solid var(--border-subtle);
          position: relative;
        }

        .workstation-toolbar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: rgba(12, 19, 36, 0.95);
          border-bottom: 1px solid var(--border-subtle);
          overflow-x: auto;
          z-index: 30;
        }

        .tool-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .tool-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }

        .tool-btn.icon-only {
          padding: 6px 8px;
        }

        .tool-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .tool-btn.active {
          background: rgba(6, 182, 212, 0.2);
          border-color: var(--cyan-primary);
          color: var(--cyan-bright);
        }

        .caliper-count {
          background: var(--cyan-primary);
          color: #000000;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 999px;
        }

        .divider-vert {
          width: 1px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
        }

        .preset-label {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-right: 2px;
        }

        .preset-pill {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          color: var(--text-secondary);
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .preset-pill:hover {
          color: #ffffff;
        }

        .preset-pill.active {
          background: rgba(16, 185, 129, 0.18);
          border-color: var(--emerald-success);
          color: var(--emerald-success);
        }

        .ai-overlay-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .checkbox-text {
          font-weight: 500;
        }

        .opacity-slider-wrap {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .slider-label {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
        }

        .dicom-viewport-canvas-wrapper {
          flex: 1;
          position: relative;
          background: #000000;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }

        .dicom-viewport-canvas-wrapper.pan {
          cursor: grab;
        }
        .dicom-viewport-canvas-wrapper.pan:active {
          cursor: grabbing;
        }
        .dicom-viewport-canvas-wrapper.window {
          cursor: ns-resize;
        }
        .dicom-viewport-canvas-wrapper.caliper {
          cursor: crosshair;
        }

        .canvas-transform-layer {
          position: absolute;
          width: 1024px;
          height: 1024px;
        }

        .dicom-base-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 1024px;
          height: 1024px;
        }

        .dicom-heatmap-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 1024px;
          height: 1024px;
          pointer-events: none;
          mix-blend-mode: screen;
        }

        .caliper-svg-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 1024px;
          height: 1024px;
          pointer-events: none;
        }

        .caliper-line {
          stroke: #38bdf8;
          stroke-width: 2.5;
          stroke-dasharray: 4 2;
        }

        .caliper-line.active {
          stroke: #f43f5e;
        }

        .caliper-endpoint {
          fill: #38bdf8;
          stroke: #020617;
          stroke-width: 1.5;
        }

        .caliper-text {
          fill: #38bdf8;
          font-family: var(--font-mono);
          font-size: 14px;
          font-weight: 700;
          background: rgba(0,0,0,0.8);
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.9));
        }

        .anomaly-bounding-box {
          position: absolute;
          border: 2px solid #f43f5e;
          pointer-events: none;
          animation: pulseGlow 2.5s infinite ease-in-out;
        }

        .box-corner {
          position: absolute;
          width: 8px;
          height: 8px;
          border-color: #f43f5e;
          border-style: solid;
        }
        .box-corner.tl { top: -2px; left: -2px; border-width: 3px 0 0 3px; }
        .box-corner.tr { top: -2px; right: -2px; border-width: 3px 3px 0 0; }
        .box-corner.bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; }
        .box-corner.br { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; }

        .anomaly-tag-badge {
          position: absolute;
          top: -24px;
          left: -2px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(225, 29, 72, 0.95);
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
        }

        .anomaly-tag-alert {
          color: #fef08a;
          font-size: 8px;
          animation: blinkDot 1s infinite;
        }

        .anomaly-dimension-pill {
          position: absolute;
          bottom: -22px;
          left: -2px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(244, 63, 94, 0.5);
          color: #f8fafc;
          padding: 1px 6px;
          border-radius: 3px;
          font-family: var(--font-mono);
          font-size: 10px;
          white-space: nowrap;
        }

        /* DICOM HUD styling */
        .dicom-hud {
          position: absolute;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.85);
          text-shadow: 0 1px 3px #000000, 0 0 5px #000000;
          pointer-events: none;
          z-index: 20;
          line-height: 1.4;
        }

        .hud-top-left { top: 12px; left: 14px; }
        .hud-top-right { top: 12px; right: 14px; text-align: right; }
        .hud-bottom-left { bottom: 12px; left: 14px; }
        .hud-bottom-right { bottom: 12px; right: 14px; text-align: right; }

        .hud-primary {
          color: var(--cyan-bright);
          font-weight: 700;
          font-size: 0.78rem;
          margin-bottom: 2px;
        }

        .hud-bold {
          font-weight: 700;
          color: #ffffff;
        }

        .hud-value {
          color: #38bdf8;
          font-weight: 600;
        }

        .hud-warn {
          color: #f59e0b;
          font-weight: 700;
        }

        .hud-live-coord {
          color: #a855f7;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};
