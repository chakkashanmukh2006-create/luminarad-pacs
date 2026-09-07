import React, { useState, useEffect, useRef } from 'react';
import { KAGGLE_DATASETS } from '../../data/kaggleDatasets';
import type { KaggleDataset, EpochMetric } from '../../types';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Terminal,
  Cpu,
  Layers,
  Sliders,
  Database,
  LineChart,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';

export const TrainingConsoleTab: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<KaggleDataset>(KAGGLE_DATASETS[0]);
  const [modelBackbone, setModelBackbone] = useState('DenseNet-121 (CheXNet)');
  const [learningRate, setLearningRate] = useState('0.0001');
  const [batchSize, setBatchSize] = useState('32');
  const [optimizer, setOptimizer] = useState('AdamW');
  const [targetEpochs, setTargetEpochs] = useState(25);

  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [metrics, setMetrics] = useState<EpochMetric[]>([
    { epoch: 1, trainLoss: 0.692, valLoss: 0.714, trainAcc: 0.62, valAcc: 0.59, auroc: 0.68, f1Score: 0.64 },
    { epoch: 2, trainLoss: 0.541, valLoss: 0.582, trainAcc: 0.74, valAcc: 0.71, auroc: 0.77, f1Score: 0.72 },
    { epoch: 3, trainLoss: 0.428, valLoss: 0.463, trainAcc: 0.81, valAcc: 0.79, auroc: 0.84, f1Score: 0.80 },
    { epoch: 4, trainLoss: 0.352, valLoss: 0.389, trainAcc: 0.86, valAcc: 0.83, auroc: 0.88, f1Score: 0.84 },
    { epoch: 5, trainLoss: 0.284, valLoss: 0.321, trainAcc: 0.90, valAcc: 0.87, auroc: 0.91, f1Score: 0.88 },
  ]);

  const [logs, setLogs] = useState<string[]>([
    '[INIT] Loaded Kaggle Dataset: nih-chest-xrays/data (112,120 radiographs)',
    '[SETUP] Backbone: DenseNet-121 initialized with ImageNet-1K pretrained weights',
    '[OPTIM] Optimizer AdamW (lr=1e-4, weight_decay=1e-2, betas=(0.9, 0.999))',
    '[DEVICE] WebGL / Metal GPU acceleration active (batch_size=32, fp16=True)',
    '[EPOCH 1/25] step 400/400 - loss: 0.6920 - val_loss: 0.7140 - auroc: 0.6820',
    '[EPOCH 2/25] step 400/400 - loss: 0.5410 - val_loss: 0.5820 - auroc: 0.7710',
    '[EPOCH 3/25] step 400/400 - loss: 0.4280 - val_loss: 0.4630 - auroc: 0.8440',
    '[EPOCH 4/25] step 400/400 - loss: 0.3520 - val_loss: 0.3890 - auroc: 0.8820',
    '[EPOCH 5/25] step 400/400 - loss: 0.2840 - val_loss: 0.3210 - auroc: 0.9140',
  ]);

  const lossCanvasRef = useRef<HTMLCanvasElement>(null);
  const aurocCanvasRef = useRef<HTMLCanvasElement>(null);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Live training simulation loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTraining && !isPaused) {
      timer = setInterval(() => {
        setCurrentStep((prevStep) => {
          if (prevStep < 10) {
            return prevStep + 1;
          } else {
            // Next Epoch triggered!
            setCurrentEpoch((prevEpoch) => {
              if (prevEpoch >= targetEpochs) {
                setIsTraining(false);
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                });
                setLogs((l) => [
                  ...l,
                  `[COMPLETE] Training reached target ${targetEpochs} epochs with Peak AUROC 0.946!`,
                  `[EXPORT] Checkpoint weights saved to /checkpoints/luminarad_${selectedDataset.id}_best.pth`,
                ]);
                return prevEpoch;
              }

              const nextEp = prevEpoch + 1;
              const lastMetric = metrics[metrics.length - 1];
              const decay = Math.max(0.015 - nextEp * 0.0005, 0.004);
              const trainLoss = Math.max(Number((lastMetric.trainLoss - decay).toFixed(4)), 0.082);
              const valLoss = Math.max(Number((lastMetric.valLoss - decay * 0.92).toFixed(4)), 0.114);
              const auroc = Math.min(Number((lastMetric.auroc + 0.008).toFixed(4)), 0.962);
              const valAcc = Math.min(Number((lastMetric.valAcc + 0.007).toFixed(4)), 0.948);
              const trainAcc = Math.min(Number((lastMetric.trainAcc + 0.008).toFixed(4)), 0.965);
              const f1Score = Math.min(Number((lastMetric.f1Score + 0.007).toFixed(4)), 0.952);

              setMetrics((m) => [
                ...m,
                { epoch: nextEp, trainLoss, valLoss, trainAcc, valAcc, auroc, f1Score },
              ]);

              const timestamp = new Date().toISOString().substring(11, 19);
              setLogs((l) => [
                ...l,
                `[${timestamp}] [EPOCH ${nextEp}/${targetEpochs}] loss: ${trainLoss} - val_loss: ${valLoss} - auroc: ${auroc} (46.8 img/s)`,
              ]);

              return nextEp;
            });
            return 0;
          }
        });
      }, 350);
    }
    return () => clearInterval(timer);
  }, [isTraining, isPaused, targetEpochs, metrics, selectedDataset]);

  // Draw Loss Curve Canvas
  useEffect(() => {
    const canvas = lossCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 360;
    const height = 150;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const padLeft = 35;
    const padRight = 20;
    const padTop = 15;
    const padBottom = 25;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.font = '9px JetBrains Mono';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';

    [0.8, 0.6, 0.4, 0.2, 0.0].forEach((val) => {
      const y = padTop + chartH - (val / 0.8) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(1), padLeft - 6, y + 3);
    });

    const stepX = chartW / Math.max(metrics.length - 1, 1);

    // Train Loss Line (Cyan)
    ctx.beginPath();
    metrics.forEach((m, idx) => {
      const x = padLeft + idx * stepX;
      const y = padTop + chartH - (m.trainLoss / 0.8) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Val Loss Line (Rose/Red)
    ctx.beginPath();
    metrics.forEach((m, idx) => {
      const x = padLeft + idx * stepX;
      const y = padTop + chartH - (m.valLoss / 0.8) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 2]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [metrics]);

  // Draw AUROC Curve Canvas
  useEffect(() => {
    const canvas = aurocCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 360;
    const height = 150;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const padLeft = 35;
    const padRight = 20;
    const padTop = 15;
    const padBottom = 25;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.font = '9px JetBrains Mono';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';

    [1.0, 0.8, 0.6].forEach((val) => {
      const y = padTop + chartH - ((val - 0.5) / 0.5) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(2), padLeft - 6, y + 3);
    });

    const stepX = chartW / Math.max(metrics.length - 1, 1);

    // AUROC Line (Emerald)
    ctx.beginPath();
    metrics.forEach((m, idx) => {
      const x = padLeft + idx * stepX;
      const y = padTop + chartH - ((m.auroc - 0.5) / 0.5) * chartH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }, [metrics]);

  const handleStartTraining = () => {
    setIsTraining(true);
    setIsPaused(false);
    setLogs((l) => [
      ...l,
      `[START] Dispatched training run on ${selectedDataset.name} with ${modelBackbone}...`,
    ]);
  };

  const handlePauseTraining = () => {
    setIsPaused(!isPaused);
    setLogs((l) => [
      ...l,
      isPaused ? '[RESUME] Resuming training worker threads...' : '[PAUSE] Training paused by user.',
    ]);
  };

  const handleResetTraining = () => {
    setIsTraining(false);
    setIsPaused(false);
    setCurrentEpoch(1);
    setCurrentStep(0);
    setMetrics([
      { epoch: 1, trainLoss: 0.692, valLoss: 0.714, trainAcc: 0.62, valAcc: 0.59, auroc: 0.68, f1Score: 0.64 },
    ]);
    setLogs([
      `[RESET] Training state cleared. Ready to train on ${selectedDataset.name}.`,
    ]);
  };

  const handleDownloadWeights = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
    });
    const blob = new Blob(
      [
        JSON.stringify(
          {
            model: modelBackbone,
            dataset: selectedDataset.id,
            finalEpoch: currentEpoch,
            bestAuroc: metrics[metrics.length - 1]?.auroc || 0.942,
            loss: metrics[metrics.length - 1]?.valLoss || 0.14,
            exportTimestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luminarad_${selectedDataset.id}_checkpoint.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const latest = metrics[metrics.length - 1];

  return (
    <div className="training-console-container">
      {/* Top Banner: Kaggle Ingestion Badge */}
      <div className="kaggle-badge-header">
        <div className="kaggle-title-wrap">
          <Database size={18} className="text-purple" />
          <div>
            <h4>Kaggle Medical Imaging Dataset Ingestion</h4>
            <span className="dataset-handle-badge">{selectedDataset.kaggleHandle}</span>
          </div>
        </div>
        <div className="dataset-stats-pills">
          <span className="stat-pill">{selectedDataset.totalImages}</span>
          <span className="stat-pill">{selectedDataset.downloadSize}</span>
        </div>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="dataset-selector-grid">
        {KAGGLE_DATASETS.map((ds) => (
          <button
            key={ds.id}
            className={`dataset-card-btn ${selectedDataset.id === ds.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedDataset(ds);
              handleResetTraining();
            }}
          >
            <div className="ds-name">{ds.name}</div>
            <div className="ds-meta">
              <span>{ds.totalImages.split(' ')[0]} images</span> • <span>{ds.modalities[0]}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Class Distribution Histogram */}
      <div className="console-panel">
        <div className="panel-title-row">
          <Layers size={14} className="text-cyan" />
          <h5>Benchmark Class Distribution & Prevalence</h5>
        </div>
        <div className="class-dist-list">
          {selectedDataset.classDistribution.slice(0, 6).map((c, idx) => (
            <div key={idx} className="class-dist-item">
              <div className="class-dist-header">
                <span>{c.className}</span>
                <span className="font-mono">{c.percentage}%</span>
              </div>
              <div className="class-bar-track">
                <div
                  className="class-bar-fill"
                  style={{
                    width: `${c.percentage}%`,
                    background:
                      c.className.includes('Cancer') || c.className.includes('Fracture')
                        ? '#f43f5e'
                        : '#06b6d4',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Hyperparameters & Architecture */}
      <div className="console-panel">
        <div className="panel-title-row">
          <Sliders size={14} className="text-cyan" />
          <h5>Model Architecture & Hyperparameter Configuration</h5>
        </div>
        <div className="hyperparameters-grid">
          <div className="param-field">
            <label>Vision Backbone</label>
            <select
              value={modelBackbone}
              onChange={(e) => setModelBackbone(e.target.value)}
              className="param-select"
            >
              {selectedDataset.recommendedBackbones.map((bb) => (
                <option key={bb} value={bb}>
                  {bb}
                </option>
              ))}
            </select>
          </div>

          <div className="param-field">
            <label>Learning Rate</label>
            <select
              value={learningRate}
              onChange={(e) => setLearningRate(e.target.value)}
              className="param-select"
            >
              <option value="0.001">1e-3 (Fast Warmup)</option>
              <option value="0.0001">1e-4 (CheXNet Benchmark)</option>
              <option value="0.00005">5e-5 (Fine-tuning)</option>
            </select>
          </div>

          <div className="param-field">
            <label>Batch Size</label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value)}
              className="param-select"
            >
              <option value="16">16 Images / Step</option>
              <option value="32">32 Images / Step</option>
              <option value="64">64 Images / Step</option>
            </select>
          </div>

          <div className="param-field">
            <label>Optimizer</label>
            <select
              value={optimizer}
              onChange={(e) => setOptimizer(e.target.value)}
              className="param-select"
            >
              <option value="AdamW">AdamW (Decoupled)</option>
              <option value="SGD">SGD + Nesterov (0.9)</option>
              <option value="Lion">Lion (EvoLved)</option>
            </select>
          </div>

          <div className="param-field">
            <label>Target Epochs</label>
            <select
              value={targetEpochs}
              onChange={(e) => setTargetEpochs(parseInt(e.target.value))}
              className="param-select"
            >
              <option value="10">10 Epochs (Quick Test)</option>
              <option value="25">25 Epochs (Standard)</option>
              <option value="50">50 Epochs (Convergence)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Training Controls & Telemetry */}
      <div className="console-panel training-action-panel">
        <div className="panel-title-row space-between">
          <div className="title-with-icon">
            <Cpu size={15} className="text-purple" />
            <h5>Live Training Studio</h5>
          </div>
          <div className="training-state-badge">
            {isTraining ? (
              isPaused ? (
                <span className="badge-warn">PAUSED</span>
              ) : (
                <span className="badge-active blink-dot">TRAINING ACTIVE</span>
              )
            ) : (
              <span className="badge-idle">IDLE</span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="epoch-progress-section">
          <div className="epoch-progress-labels">
            <span>
              Epoch <strong>{currentEpoch}</strong> of <strong>{targetEpochs}</strong>
            </span>
            <span className="font-mono">
              Step {currentStep * 40} / 400 ({(currentStep * 10).toFixed(0)}%)
            </span>
          </div>
          <div className="epoch-track">
            <div
              className="epoch-fill"
              style={{
                width: `${((currentEpoch - 1 + currentStep / 10) / targetEpochs) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="training-buttons-row">
          {!isTraining ? (
            <button className="btn-primary" onClick={handleStartTraining}>
              <Play size={16} />
              <span>Start Kaggle Model Training</span>
            </button>
          ) : (
            <button className="btn-secondary" onClick={handlePauseTraining}>
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              <span>{isPaused ? 'Resume Training' : 'Pause Training'}</span>
            </button>
          )}
          <button className="btn-secondary" onClick={handleResetTraining} title="Reset Weights">
            <RotateCcw size={15} />
            <span>Reset</span>
          </button>
          <button
            className="btn-secondary ml-auto"
            onClick={handleDownloadWeights}
            title="Export Trained PyTorch / ONNX Checkpoint"
          >
            <Download size={15} />
            <span>Export Weights</span>
          </button>
        </div>
      </div>

      {/* Real-time Loss & AUROC Charts */}
      <div className="charts-grid-2col">
        <div className="console-panel">
          <div className="panel-title-row space-between">
            <div className="title-with-icon">
              <TrendingDown size={14} className="text-cyan" />
              <h6>Loss Convergence (Train vs Val)</h6>
            </div>
            <div className="chart-legend-mini">
              <span className="dot-cyan" /> Train: {latest?.trainLoss}
              <span className="dot-rose" /> Val: {latest?.valLoss}
            </div>
          </div>
          <canvas ref={lossCanvasRef} className="mini-chart-canvas" />
        </div>

        <div className="console-panel">
          <div className="panel-title-row space-between">
            <div className="title-with-icon">
              <LineChart size={14} className="text-emerald" />
              <h6>ROC-AUC Diagnostic Precision</h6>
            </div>
            <div className="chart-legend-mini">
              <span className="dot-emerald" /> Mean AUROC: <strong>{latest?.auroc}</strong>
            </div>
          </div>
          <canvas ref={aurocCanvasRef} className="mini-chart-canvas" />
        </div>
      </div>

      {/* Live Confusion Matrix & Metrics */}
      <div className="console-panel">
        <div className="panel-title-row">
          <ShieldCheck size={14} className="text-cyan" />
          <h5>Validation Confusion Matrix (Kaggle Test Split)</h5>
        </div>
        <div className="matrix-and-stats-row">
          <div className="confusion-matrix-grid">
            <div className="matrix-cell label-cell">Predicted +</div>
            <div className="matrix-cell label-cell">Predicted -</div>
            <div className="matrix-cell value-cell tp">
              <span className="cell-num">1,842</span>
              <span className="cell-label">True Positive</span>
            </div>
            <div className="matrix-cell value-cell fp">
              <span className="cell-num">94</span>
              <span className="cell-label">False Positive</span>
            </div>
            <div className="matrix-cell value-cell fn">
              <span className="cell-num">62</span>
              <span className="cell-label">False Negative</span>
            </div>
            <div className="matrix-cell value-cell tn">
              <span className="cell-num">8,420</span>
              <span className="cell-label">True Negative</span>
            </div>
          </div>

          <div className="matrix-stats-summary">
            <div className="matrix-stat-item">
              <span className="stat-name">Sensitivity / Recall</span>
              <span className="stat-val font-mono text-cyan">96.7%</span>
            </div>
            <div className="matrix-stat-item">
              <span className="stat-name">Specificity</span>
              <span className="stat-val font-mono text-emerald">98.9%</span>
            </div>
            <div className="matrix-stat-item">
              <span className="stat-name">Positive Predictive (PPV)</span>
              <span className="stat-val font-mono text-cyan">95.1%</span>
            </div>
            <div className="matrix-stat-item">
              <span className="stat-name">F1-Score</span>
              <span className="stat-val font-mono text-purple">0.959</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Log Stream */}
      <div className="console-panel">
        <div className="panel-title-row space-between">
          <div className="title-with-icon">
            <Terminal size={14} className="text-cyan" />
            <h5>Training Iteration Logs & Telemetry</h5>
          </div>
          <span className="terminal-rate-pill font-mono">48.2 img/sec</span>
        </div>
        <div ref={logTerminalRef} className="terminal-output-box">
          {logs.map((line, idx) => (
            <div key={idx} className="terminal-log-line">
              <span className="prompt-sym">&gt;</span> {line}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .training-console-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
        }

        .kaggle-badge-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: rgba(168, 85, 247, 0.08);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: var(--radius-md);
        }

        .kaggle-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .kaggle-title-wrap h4 {
          font-size: 0.88rem;
          font-weight: 700;
          color: #ffffff;
        }

        .dataset-handle-badge {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: #c084fc;
        }

        .dataset-stats-pills {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stat-pill {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          padding: 3px 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          color: var(--text-secondary);
        }

        .dataset-selector-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .dataset-card-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          padding: 10px 12px;
          background: rgba(14, 23, 42, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .dataset-card-btn:hover {
          background: rgba(22, 36, 66, 0.8);
          border-color: rgba(168, 85, 247, 0.3);
        }

        .dataset-card-btn.active {
          background: rgba(168, 85, 247, 0.12);
          border-color: var(--purple-ai);
          box-shadow: 0 0 14px rgba(168, 85, 247, 0.2);
        }

        .ds-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .ds-meta {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .console-panel {
          background: rgba(14, 23, 42, 0.65);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 14px;
        }

        .panel-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .panel-title-row.space-between {
          justify-content: space-between;
        }

        .title-with-icon {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panel-title-row h5, .panel-title-row h6 {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-secondary);
        }

        .class-dist-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .class-dist-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .class-dist-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.74rem;
          color: var(--text-secondary);
        }

        .class-bar-track {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 999px;
          overflow: hidden;
        }

        .class-bar-fill {
          height: 100%;
          border-radius: 999px;
        }

        .hyperparameters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .param-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .param-field label {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .param-select {
          background: rgba(8, 14, 26, 0.8);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 6px 10px;
          color: var(--text-primary);
          font-size: 0.78rem;
          outline: none;
          font-family: var(--font-sans);
        }

        .training-state-badge {
          font-size: 0.7rem;
          font-family: var(--font-mono);
          font-weight: 700;
        }

        .badge-active {
          color: #10b981;
        }

        .badge-warn {
          color: #f59e0b;
        }

        .badge-idle {
          color: var(--text-muted);
        }

        .epoch-progress-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
        }

        .epoch-progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.74rem;
          color: var(--text-secondary);
        }

        .epoch-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
          overflow: hidden;
        }

        .epoch-fill {
          height: 100%;
          background: linear-gradient(90deg, #06b6d4, #a855f7);
          transition: width 0.3s ease;
        }

        .training-buttons-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ml-auto {
          margin-left: auto;
        }

        .training-console-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 16px;
          width: 100%;
          box-sizing: border-box;
        }

        .console-panel {
          background: rgba(14, 23, 42, 0.65);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 14px;
          min-width: 0;
          box-sizing: border-box;
        }

        .dataset-selector-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .dataset-selector-grid > * {
          min-width: 0;
        }

        .hyperparameters-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .hyperparameters-grid > * {
          min-width: 0;
        }

        .charts-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .charts-grid-2col > * {
          min-width: 0;
        }

        .matrix-and-stats-row {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 12px;
          align-items: center;
        }

        .matrix-and-stats-row > * {
          min-width: 0;
        }

        .chart-legend-mini {
          font-size: 0.68rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dot-cyan {
          display: inline-block;
          width: 7px;
          height: 7px;
          background: #06b6d4;
          border-radius: 50%;
        }

        .dot-rose {
          display: inline-block;
          width: 7px;
          height: 7px;
          background: #f43f5e;
          border-radius: 50%;
        }

        .dot-emerald {
          display: inline-block;
          width: 7px;
          height: 7px;
          background: #10b981;
          border-radius: 50%;
        }

        .mini-chart-canvas {
          width: 100%;
          height: 150px;
          display: block;
        }

        .matrix-and-stats-row {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 12px;
          align-items: center;
        }

        .confusion-matrix-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .matrix-cell {
          padding: 8px;
          border-radius: var(--radius-sm);
          text-align: center;
        }

        .label-cell {
          background: rgba(255, 255, 255, 0.02);
          font-size: 0.65rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .value-cell {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-subtle);
        }

        .value-cell.tp {
          background: rgba(16, 185, 129, 0.15);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .value-cell.tn {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.3);
        }

        .value-cell.fp, .value-cell.fn {
          background: rgba(244, 63, 94, 0.1);
          border-color: rgba(244, 63, 94, 0.25);
        }

        .cell-num {
          font-family: var(--font-mono);
          font-size: 0.95rem;
          font-weight: 700;
        }

        .cell-label {
          font-size: 0.62rem;
          color: var(--text-muted);
        }

        .matrix-stats-summary {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .matrix-stat-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.74rem;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }

        .stat-name {
          color: var(--text-secondary);
        }

        .stat-val {
          font-weight: 700;
        }

        .terminal-rate-pill {
          font-size: 0.68rem;
          color: var(--emerald-success);
          background: rgba(16, 185, 129, 0.12);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .terminal-output-box {
          height: 140px;
          background: #020409;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          overflow-y: auto;
          color: #38bdf8;
          line-height: 1.45;
        }

        .terminal-log-line {
          white-space: pre-wrap;
          word-break: break-all;
        }

        .prompt-sym {
          color: #a855f7;
        }

        .text-purple {
          color: var(--purple-ai);
        }
        .text-cyan {
          color: var(--cyan-bright);
        }
        .text-emerald {
          color: var(--emerald-success);
        }
      `}</style>
    </div>
  );
};
