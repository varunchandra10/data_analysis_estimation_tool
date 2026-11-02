import { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTheme } from '../../context/ThemeContext';
import { GitBranch, CheckCircle2, Clock, AlertTriangle, Play } from 'lucide-react';

const statusStyles = {
  completed: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
  running: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
  failed: 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
  pending: 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400',
};

const StatusIcon = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />;
    case 'running':
      return <Play size={10} className="text-amber-500 shrink-0 animate-pulse" />;
    case 'failed':
      return <AlertTriangle size={11} className="text-rose-500 shrink-0" />;
    default:
      return <Clock size={11} className="text-slate-400 shrink-0" />;
  }
};

const PipelineNode = ({ data }) => {
  const badgeClass = statusStyles[data.status] || statusStyles.pending;

  return (
    <div
      className={`relative min-w-[240px] rounded-2xl border p-4 shadow-lg backdrop-blur-md transition-all duration-200 select-none ${
        data.active
          ? 'border-indigo-500/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ring-2 ring-indigo-500/30 shadow-indigo-500/10'
          : 'border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-white dark:!border-slate-900 !bg-slate-400 dark:!bg-slate-600"
      />

      {/* Node Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            <GitBranch size={11} />
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest leading-none">
              {data.label}
            </p>
          </div>
          <h3 className="mt-1 text-sm font-mono font-bold text-slate-900 dark:text-white">
            {data.version}
          </h3>
        </div>

        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider ${badgeClass}`}>
          <StatusIcon status={data.status} />
          <span>{data.status}</span>
        </span>
      </div>

      {/* Metadata Attributes */}
      <div className="relative mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 font-sans">Timestamp:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
            {data.timestamp || 'In-Memory Buffer'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 font-sans">Lineage:</span>
          <span className="max-w-[130px] truncate font-semibold text-indigo-600 dark:text-indigo-400 text-[11px]" title={data.lineage}>
            {data.lineage || 'root'}
          </span>
        </div>
      </div>

      {/* Node Footer Badges */}
      <div className="relative mt-3 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-wider">
        <span className={data.rollbackAvailable ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400 dark:text-slate-500'}>
          {data.rollbackAvailable ? '↺ Checkpoint' : '• Current Root'}
        </span>
        {data.active && (
          <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-bold">
            Active Workspace
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-white dark:!border-slate-900 !bg-slate-400 dark:!bg-slate-600"
      />
    </div>
  );
};

const buildNodes = (stages) => {
  return stages.map((stage, index) => ({
    id: stage.id || stage.stage || `${index}`,
    type: 'pipelineNode',
    position: { x: index * 300, y: 0 },
    data: {
      label: stage.label || stage.stage?.toUpperCase() || `STAGE ${index + 1}`,
      version: stage.version || 'v0_unknown',
      status: stage.status || 'pending',
      timestamp: stage.timestamp || null,
      lineage: stage.lineage || (index === 0 ? 'source' : stages[index - 1]?.version || 'previous'),
      active: Boolean(stage.active),
      rollbackAvailable: Boolean(stage.rollbackAvailable),
    },
  }));
};

const buildEdges = (stages) => {
  return stages.slice(0, -1).map((stage, index) => {
    const nextStage = stages[index + 1];
    const isRunning = stage.status === 'running' || nextStage?.status === 'running';
    const isFailed = stage.status === 'failed' || nextStage?.status === 'failed';

    return {
      id: `${stage.id || stage.stage || index}-${nextStage.id || nextStage.stage || index + 1}`,
      source: stage.id || stage.stage || `${index}`,
      target: nextStage.id || nextStage.stage || `${index + 1}`,
      type: 'smoothstep',
      animated: isRunning,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isFailed ? '#f43f5e' : isRunning ? '#f59e0b' : '#6366f1',
      },
      style: {
        stroke: isFailed ? '#f43f5e' : isRunning ? '#f59e0b' : '#6366f1',
        strokeWidth: 2,
        strokeDasharray: isFailed ? '6 4' : '0',
      },
    };
  });
};

/**
 * Enhanced PipelineGraph
 * Interactive Directed Acyclic Graph (DAG) visualizing transformation checkpoints across the pipeline lifecycle.
 */
export default function PipelineGraph({
  stages = [],
  activeVersion,
  title = 'Pipeline Transformation Lineage',
  subtitle = 'RAW → CLEANING → OUTLIERS → VALIDATION → WEIGHTING → REPORT',
}) {
  const { isDark = true } = useTheme();

  const fallbackStages = useMemo(() => [
    { id: 'raw', stage: 'raw', label: 'RAW', version: 'raw_source', status: 'completed', timestamp: null, lineage: 'source' },
    { id: 'cleaning', stage: 'cleaning', label: 'CLEANING', version: 'v1_cleaned', status: 'pending', timestamp: null, lineage: 'raw' },
    { id: 'outliers', stage: 'outliers', label: 'OUTLIERS', version: 'v2_outliers', status: 'pending', timestamp: null, lineage: 'cleaning' },
    { id: 'validation', stage: 'validation', label: 'VALIDATION', version: 'v3_validated', status: 'pending', timestamp: null, lineage: 'outliers' },
    { id: 'weighting', stage: 'weighting', label: 'WEIGHTING', version: 'v4_weighted', status: 'pending', timestamp: null, lineage: 'validation' },
    { id: 'report', stage: 'report', label: 'REPORT', version: 'v5_report', status: 'pending', timestamp: null, lineage: 'weighting' },
  ], []);

  const normalizedStages = stages.length > 0 ? stages : fallbackStages;

  const nodeTypes = useMemo(() => ({
    pipelineNode: PipelineNode,
  }), []);

  const nodes = useMemo(() => {
    return buildNodes(
      normalizedStages.map((stage) => ({
        ...stage,
        active: activeVersion ? stage.version === activeVersion : stage.active,
        rollbackAvailable: stage.rollbackAvailable ?? normalizedStages.indexOf(stage) < normalizedStages.length - 1,
      }))
    );
  }, [normalizedStages, activeVersion]);

  const edges = useMemo(() => buildEdges(normalizedStages), [normalizedStages]);
  const width = Math.max(980, normalizedStages.length * 300);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm overflow-hidden font-sans">
      
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              <GitBranch size={13} />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Pipeline Graph
            </p>
          </div>
          <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white font-mono">
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
            {subtitle}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3.5 py-2 text-right text-xs">
          <span className="block uppercase tracking-wider text-slate-400 font-mono text-[9px] font-bold">
            Active Version Scope
          </span>
          <span className="mt-0.5 block font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {activeVersion || 'Current Workspace Root'}
          </span>
        </div>
      </div>

      {/* React Flow Viewport Container */}
      <div className="h-[430px] w-full overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div style={{ width, height: 430 }} className="min-w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={22} size={1} color={isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.25)'} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
