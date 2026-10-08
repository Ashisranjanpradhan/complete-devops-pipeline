import React, { useState } from 'react';
import { Modal } from './Modal';
import { Play, CheckCircle2, AlertTriangle, Sparkles, RotateCcw, Activity, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deploymentApi, incidentApi } from '../services/api';

interface DemoOutageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoOutageModal: React.FC<DemoOutageModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [incidentId, setIncidentId] = useState<number>(1);

  const steps = [
    {
      title: '1. Deploy payment-service v2.8.1',
      desc: 'Simulate automated Jenkins CI/CD release to production introducing an unindexed query and connection leak.',
      actionText: 'Deploy Release v2.8.1',
      icon: <Play size={16} className="text-cyan-400" />,
    },
    {
      title: '2. Telemetry Degradation',
      desc: 'Database connection pool hits 94%, 5xx errors spike to 14.1%, p99 latency surges from 180ms to 2.1s.',
      actionText: 'Simulate Metric Spikes',
      icon: <Activity size={16} className="text-amber-400" />,
    },
    {
      title: '3. Automated SEV-1 Incident Opened',
      desc: 'Prometheus Alertmanager detects SLO breach (HighLatencyAlert & HighErrorRateAlert) and triggers SEV-1.',
      actionText: 'Trigger SEV-1 Incident',
      icon: <AlertTriangle size={16} className="text-rose-400" />,
    },
    {
      title: '4. Autonomous AI Telemetry Correlation',
      desc: 'OpsMind AI correlates recent deployment with connection saturation and produces evidence-backed root cause.',
      actionText: 'Run AI Telemetry Correlator',
      icon: <Sparkles size={16} className="text-indigo-400" />,
    },
    {
      title: '5. Human-Approved Controlled Rollback',
      desc: 'Operator reviews AI evidence, selects previous known-good release v2.8.0, and executes rollback.',
      actionText: 'Execute Rollback to v2.8.0',
      icon: <RotateCcw size={16} className="text-amber-400" />,
    },
    {
      title: '6. Service Recovery & Incident Resolution',
      desc: 'Known-good container deployed. DB connection pool stabilizes at 54%, latency drops to 180ms, incident marked RESOLVED.',
      actionText: 'Verify Mitigation & View Incident',
      icon: <ShieldCheck size={16} className="text-emerald-400" />,
    },
  ];

  const handleExecuteStep = async (stepIndex: number) => {
    setIsRunning(true);
    try {
      if (stepIndex === 0) {
        // Step 1: Deploy v2.8.1
        await deploymentApi.create({
          serviceId: 1,
          version: 'v2.8.1',
          commitHash: 'a72f93c',
          environment: 'production',
          triggeredBy: 'Jenkins Pipeline #142',
        });
        setCurrentStep(1);
      } else if (stepIndex === 1) {
        // Step 2: Metrics degrade
        setCurrentStep(2);
      } else if (stepIndex === 2) {
        // Step 3: Trigger Incident
        const inc = await incidentApi.create({
          serviceId: 1,
          title: 'Payment API 5xx errors spiked to 14% with high DB connection utilization',
          description: 'Payment API p99 latency surged from 180ms to 2.1s. 5xx errors reached 14.1%. HikariCP pool saturated at 94% following deployment v2.8.1.',
          severity: 'CRITICAL',
          createdBy: 'Alertmanager Bot',
          assignedTo: 'devops',
        });
        setIncidentId(inc.id || 1);
        setCurrentStep(3);
      } else if (stepIndex === 3) {
        // Step 4: AI Analysis
        await incidentApi.runAIAnalysis(incidentId);
        setCurrentStep(4);
      } else if (stepIndex === 4) {
        // Step 5: Rollback
        await deploymentApi.rollback(1, {
          targetVersion: 'v2.8.0',
          reason: 'Autonomous AI Root Cause: v2.8.1 DB pool connection leak confirmed',
          operator: 'oncall-sre',
        });
        setCurrentStep(5);
      } else if (stepIndex === 5) {
        // Step 6: Resolved
        await incidentApi.updateStatus(incidentId, {
          status: 'RESOLVED',
          comment: 'Service rolled back successfully to v2.8.0. Metrics normalized.',
        });
        onClose();
        navigate(`/incidents/${incidentId}`);
      }
    } catch (e) {
      console.warn('Demo step executed with mock fallback:', e);
      setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="OpsMind AI — Flagship Outage Simulation (Sections 90 & 91)">
      <div className="space-y-5">
        <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs text-cyan-200">
          <strong>Interactive Demonstration:</strong> Step through the complete DevOps & AI incident workflow: from faulty deployment → telemetry spike → autonomous AI analysis → controlled rollback → recovery.
        </div>

        <div className="space-y-3">
          {steps.map((st, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition ${
                  isCurrent
                    ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : isCompleted
                    ? 'bg-slate-900/40 border-emerald-500/30'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {isCompleted ? <CheckCircle2 size={16} className="text-emerald-400" /> : st.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{st.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{st.desc}</p>
                    </div>
                  </div>

                  {isCurrent && (
                    <button
                      onClick={() => handleExecuteStep(idx)}
                      disabled={isRunning}
                      className="shrink-0 flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] font-semibold rounded-lg shadow transition disabled:opacity-50"
                    >
                      {isRunning ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <>
                          <span>{st.actionText}</span>
                          <ArrowRight size={12} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-white transition flex items-center space-x-1"
          >
            <RefreshCw size={12} />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
