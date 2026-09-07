import React, { useState, useRef, useEffect } from 'react';
import type { ClinicalStudy } from '../../types';
import {
  TrendingUp,
  Clock,
  HeartPulse,
  CheckCircle2,
  Calendar,
  Activity,
  Sliders,
  Zap
} from 'lucide-react';

interface PrognosisTabProps {
  study: ClinicalStudy;
  hasAnalyzed: boolean;
  onRunAnalysis: () => void;
}

export const PrognosisTab: React.FC<PrognosisTabProps> = ({
  study,
  hasAnalyzed,
  onRunAnalysis,
}) => {
  const { prognosis } = study;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Local state for interactive interventions
  const [interventions, setInterventions] = useState(prognosis.interventions);

  useEffect(() => {
    setInterventions(prognosis.interventions);
  }, [prognosis]);

  // Calculate current active benefit multiplier
  const activeBenefit = interventions
    .filter((i) => i.active)
    .reduce((sum, i) => sum + i.healthBenefitPercent, 0);

  const calculated5YrSurvival = Math.min(
    Math.round(prognosis.fiveYearSurvivalRate + activeBenefit * 0.9),
    99
  );

  const calculatedBiologicalAge = Math.max(
    prognosis.biologicalOrganAge - Math.round(activeBenefit * 0.25),
    prognosis.chronologicalAge - 2
  );

  const toggleIntervention = (id: string) => {
    setInterventions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  // Draw 5-Year Trajectory Chart on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasAnalyzed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 400;
    const height = 200;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const padLeft = 40;
    const padRight = 30;
    const padTop = 25;
    const padBottom = 35;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.font = '10px JetBrains Mono';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';

    [100, 75, 50, 25, 0].forEach((val) => {
      const y = padTop + chartH - (val / 100) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();
      ctx.fillText(`${val}%`, padLeft - 6, y + 3);
    });

    const points = prognosis.trajectory;
    const stepX = chartW / (points.length - 1);

    // 1. Draw Baseline Decline Area & Line (Red/Orange)
    ctx.beginPath();
    points.forEach((p, idx) => {
      const x = padLeft + idx * stepX;
      const y = padTop + chartH - (p.baselineHealth / 100) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    // stroke baseline line
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Draw Interventional Trajectory Area & Line (Cyan/Emerald)
    const activePoints = points.map((p) => {
      // Scale based on active interventions
      const dynamicVal = Math.min(Math.round(p.baselineHealth + (p.withIntervention - p.baselineHealth) * (activeBenefit / 50 || 0.3)), 98);
      return { ...p, currentCalculated: dynamicVal };
    });

    // Gradient fill under interventional curve
    const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    areaGrad.addColorStop(0, 'rgba(6, 182, 212, 0.28)');
    areaGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    ctx.beginPath();
    activePoints.forEach((p, idx) => {
      const x = padLeft + idx * stepX;
      const y = padTop + chartH - (p.currentCalculated / 100) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padLeft + chartW, padTop + chartH);
    ctx.lineTo(padLeft, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Line for interventional
    ctx.beginPath();
    activePoints.forEach((p, idx) => {
      const x = padLeft + idx * stepX;
      const y = padTop + chartH - (p.currentCalculated / 100) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Points & Labels
    ctx.textAlign = 'center';
    points.forEach((p, idx) => {
      const x = padLeft + idx * stepX;
      const yActive = padTop + chartH - (activePoints[idx].currentCalculated / 100) * chartH;
      const yBase = padTop + chartH - (p.baselineHealth / 100) * chartH;

      // X-Axis Labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Outfit';
      ctx.fillText(`Yr ${p.year}`, x, padTop + chartH + 18);

      // Baseline dot
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(x, yBase, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Active dot
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x, yActive, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#050811';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Value label on top
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${activePoints[idx].currentCalculated}%`, x, yActive - 8);
    });
  }, [hasAnalyzed, prognosis, activeBenefit]);

  if (!hasAnalyzed) {
    return (
      <div className="tab-empty-state">
        <div className="empty-icon-wrap">
          <Calendar size={32} className="empty-icon" />
        </div>
        <h3>5-Year Prognosis Engine Ready</h3>
        <p>
          Run Deep Learning Analysis to project 5-year organ degradation, biological age divergence, and simulate treatment responses.
        </p>
        <button className="btn-primary" onClick={onRunAnalysis}>
          <Activity size={16} />
          <span>Execute Prognosis Engine</span>
        </button>
      </div>
    );
  }

  const ageDiff = calculatedBiologicalAge - prognosis.chronologicalAge;

  return (
    <div className="prognosis-tab-container">
      {/* Top Prognostic KPIs */}
      <div className="prognosis-kpis-grid">
        {/* Biological vs Chronological Age */}
        <div className="prognosis-card age-card">
          <div className="card-header-mini">
            <Clock size={14} className="text-cyan" />
            <span>Biological Organ Age</span>
          </div>
          <div className="age-comparison-display">
            <div className="age-main-metric">
              <span className="big-number">{calculatedBiologicalAge}</span>
              <span className="unit">yrs</span>
            </div>
            <div className="age-sub-badge">
              {ageDiff > 0 ? (
                <span className="diff-tag critical">
                  +{ageDiff} yrs accelerated aging
                </span>
              ) : (
                <span className="diff-tag optimal">Optimal / Preserved</span>
              )}
            </div>
          </div>
          <div className="chronological-note">
            Chronological Age: <strong>{prognosis.chronologicalAge} yrs</strong>
          </div>
        </div>

        {/* 5-Year Survival / Stability Outlook */}
        <div className="prognosis-card survival-card">
          <div className="card-header-mini">
            <HeartPulse size={14} className="text-cyan" />
            <span>5-Yr Organ Function Outlook</span>
          </div>
          <div className="age-comparison-display">
            <div className="age-main-metric">
              <span className="big-number text-cyan">{calculated5YrSurvival}%</span>
            </div>
            <div className="age-sub-badge">
              <span className="diff-tag optimal">
                <TrendingUp size={11} />
                +{Math.round(activeBenefit * 0.9)}% with treatment
              </span>
            </div>
          </div>
          <div className="chronological-note">
            Baseline without intervention: <strong>{prognosis.fiveYearSurvivalRate}%</strong>
          </div>
        </div>
      </div>

      {/* 5-Year Trajectory Line Chart */}
      <div className="prognosis-card chart-card">
        <div className="chart-header">
          <div className="chart-title-wrap">
            <TrendingUp size={16} className="text-cyan" />
            <h4>5-Year Organ Health & Survivability Curve</h4>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-line active-line" />
              <span>With Clinical Interventions</span>
            </div>
            <div className="legend-item">
              <span className="legend-line baseline-line" />
              <span>Unmanaged Natural History</span>
            </div>
          </div>
        </div>

        <div className="chart-wrapper">
          <canvas ref={canvasRef} className="trajectory-canvas" />
        </div>
      </div>

      {/* Interactive Intervention Simulator */}
      <div className="prognosis-card simulator-card">
        <div className="simulator-header">
          <div className="simulator-title-wrap">
            <Sliders size={16} className="text-cyan" />
            <h4>Clinical Treatment & Lifestyle Simulator</h4>
          </div>
          <span className="simulator-badge">Interactive Toggles</span>
        </div>
        <p className="simulator-desc">
          Toggle medical and surgical interventions below to simulate changes to the 5-year organ trajectory and biological age in real time:
        </p>

        <div className="interventions-list">
          {interventions.map((item) => (
            <div
              key={item.id}
              className={`intervention-toggle-item ${item.active ? 'active' : ''}`}
              onClick={() => toggleIntervention(item.id)}
            >
              <div className="toggle-checkbox">
                {item.active ? <CheckCircle2 size={18} className="text-cyan" /> : <div className="unchecked-box" />}
              </div>
              <div className="toggle-text-wrap">
                <div className="toggle-name-row">
                  <span className="toggle-name">{item.name}</span>
                  <span className="benefit-pill">+{item.healthBenefitPercent}% 5-Yr Reserve</span>
                </div>
                <div className="toggle-desc">{item.impactDescription}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Biomarkers & Risk Thresholds */}
      <div className="prognosis-card biomarkers-card">
        <div className="chart-title-wrap" style={{ marginBottom: '10px' }}>
          <Zap size={16} className="text-cyan" />
          <h4>Quantitative Radiological Biomarkers</h4>
        </div>
        <div className="biomarkers-grid">
          {prognosis.biomarkers.map((bm, idx) => (
            <div key={idx} className="biomarker-row">
              <div className="bm-top">
                <span className="bm-name">{bm.name}</span>
                <span className={`bm-status-badge ${bm.status}`}>{bm.value}</span>
              </div>
              <div className="bm-desc">{bm.description}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .prognosis-tab-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .prognosis-kpis-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .prognosis-kpis-grid > * {
          min-width: 0;
        }

        .prognosis-card {
          background: rgba(14, 23, 42, 0.65);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 14px;
          min-width: 0;
          box-sizing: border-box;
        }

        .card-header-mini {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
          font-weight: 700;
        }

        .age-comparison-display {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 6px 0 4px 0;
        }

        .big-number {
          font-size: 2rem;
          font-weight: 800;
          font-family: var(--font-sans);
          line-height: 1;
        }

        .big-number.text-cyan {
          color: var(--cyan-bright);
        }

        .unit {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .diff-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
        }

        .diff-tag.critical {
          background: rgba(244, 63, 94, 0.15);
          color: #f43f5e;
          border: 1px solid rgba(244, 63, 94, 0.3);
        }

        .diff-tag.optimal {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .chronological-note {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chart-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chart-title-wrap h4 {
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }

        .chart-legend {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .legend-line {
          width: 14px;
          height: 3px;
          border-radius: 2px;
        }

        .active-line {
          background: #06b6d4;
        }

        .baseline-line {
          background: #f43f5e;
          border-top: 1px dashed #f43f5e;
        }

        .chart-wrapper {
          width: 100%;
          overflow: hidden;
        }

        .trajectory-canvas {
          width: 100%;
          height: 200px;
          display: block;
        }

        .simulator-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .simulator-title-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .simulator-title-wrap h4 {
          font-size: 0.82rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }

        .simulator-badge {
          font-size: 0.65rem;
          font-family: var(--font-mono);
          background: rgba(6, 182, 212, 0.15);
          color: var(--cyan-bright);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .simulator-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .interventions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .intervention-toggle-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(18, 28, 51, 0.5);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .intervention-toggle-item:hover {
          background: rgba(22, 36, 66, 0.8);
          border-color: rgba(6, 182, 212, 0.3);
        }

        .intervention-toggle-item.active {
          background: rgba(6, 182, 212, 0.08);
          border-color: rgba(6, 182, 212, 0.4);
        }

        .unchecked-box {
          width: 18px;
          height: 18px;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
        }

        .toggle-text-wrap {
          flex: 1;
        }

        .toggle-name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 3px;
        }

        .toggle-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .benefit-pill {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--emerald-success);
          background: rgba(16, 185, 129, 0.12);
          padding: 1px 6px;
          border-radius: 4px;
        }

        .toggle-desc {
          font-size: 0.74rem;
          color: var(--text-secondary);
          line-height: 1.35;
        }

        .biomarkers-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .biomarker-row {
          padding: 8px 10px;
          background: rgba(18, 28, 51, 0.4);
          border-radius: var(--radius-sm);
          border-left: 2px solid var(--cyan-primary);
        }

        .bm-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .bm-name {
          font-size: 0.78rem;
          font-weight: 600;
        }

        .bm-status-badge {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 700;
        }

        .bm-status-badge.critical {
          color: #f43f5e;
        }

        .bm-status-badge.warning {
          color: #f59e0b;
        }

        .bm-status-badge.optimal {
          color: #10b981;
        }

        .bm-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
