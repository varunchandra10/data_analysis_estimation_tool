import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

const statusStyles = {
  completed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  running: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  failed: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  pending: 'border-slate-600 bg-slate-800/80 text-slate-200',
};

const PipelineNode = ({ data }) => {
  const badgeClass = statusStyles[data.status] || statusStyles.pending;

  return (
    <div className={`relative min-w-[230px] rounded-2xl border p-4 shadow-xl backdrop-blur ${data.active ? 'border-indigo-400/70 bg-slate-950 text-white ring-2 ring-indigo-500/25' : 'border-slate-700/80 bg-slate-900/90 text-slate-100'} dark:bg-slate-950`}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent" />
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-slate-950 !bg-slate-400" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">{data.label}</p>
          <h3 className="mt-1 text-sm font-semibold text-inherit">{data.version}</h3>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.24em] ${badgeClass}`}>
          {data.status}
        </span>
      </div>

      <div className="relative mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-400">Timestamp</span>
          <span className="font-medium text-slate-100">{data.timestamp || 'Pending'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-400">Lineage</span>
          <span className="max-w-[120px] truncate font-medium text-slate-100">{data.lineage || 'root'}</span>
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.25em]">
        <span className={`${data.rollbackAvailable ? 'text-amber-400' : 'text-slate-500'}`}>
          {data.rollbackAvailable ? 'Rollback available' : 'Current lineage'}
        </span>
        {data.active && (
          <span className="rounded-full bg-indigo-500/15 px-2 py-1 text-indigo-300 border border-indigo-500/20">Active</span>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-slate-950 !bg-slate-400" />
    </div>
  );
};

const nodeTypes = {
  pipelineNode: PipelineNode,
};

const buildNodes = (stages) => {
  return stages.map((stage, index) => ({
    id: stage.id || stage.stage || `${index}`,
    type: 'pipelineNode',
    position: { x: index * 290, y: 0 },
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
        color: isFailed ? '#fb7185' : isRunning ? '#f59e0b' : '#818cf8',
      },
      style: {
        stroke: isFailed ? '#fb7185' : isRunning ? '#f59e0b' : '#818cf8',
        strokeWidth: 2,
        strokeDasharray: isFailed ? '6 4' : '0',
      },
    };
  });
};

export default function PipelineGraph({
  stages = [],
  activeVersion,
  title = 'Pipeline Visualization',
  subtitle = 'RAW → CLEANING → OUTLIERS → VALIDATION → WEIGHTING → REPORT',
}) {
  const fallbackStages = [
    { id: 'raw', stage: 'raw', label: 'RAW', version: 'raw_source', status: 'completed', timestamp: null, lineage: 'source' },
    { id: 'cleaning', stage: 'cleaning', label: 'CLEANING', version: 'v1_cleaned', status: 'pending', timestamp: null, lineage: 'raw' },
    { id: 'outliers', stage: 'outliers', label: 'OUTLIERS', version: 'v2_outliers', status: 'pending', timestamp: null, lineage: 'cleaning' },
    { id: 'validation', stage: 'validation', label: 'VALIDATION', version: 'v3_validated', status: 'pending', timestamp: null, lineage: 'outliers' },
    { id: 'weighting', stage: 'weighting', label: 'WEIGHTING', version: 'v4_weighted', status: 'pending', timestamp: null, lineage: 'validation' },
    { id: 'report', stage: 'report', label: 'REPORT', version: 'v5_report', status: 'pending', timestamp: null, lineage: 'weighting' },
  ];

  const normalizedStages = stages.length > 0 ? stages : fallbackStages;
  const nodes = buildNodes(normalizedStages.map((stage) => ({
    ...stage,
    active: activeVersion ? stage.version === activeVersion : stage.active,
    rollbackAvailable: stage.rollbackAvailable ?? normalizedStages.indexOf(stage) < normalizedStages.length - 1,
  })));
  const edges = buildEdges(normalizedStages);
  const width = Math.max(980, normalizedStages.length * 290);

  return (
    <div className="rounded-3xl border border-slate-800 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Pipeline Graph</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <span className="block uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Active Version</span>
          <span className="mt-1 block font-semibold text-slate-900 dark:text-slate-50">{activeVersion || 'N/A'}</span>
        </div>
      </div>

      <div className="h-[430px] w-full overflow-x-auto overflow-y-hidden rounded-2xl bg-slate-50/80 dark:bg-slate-900/30">
        <div style={{ width, height: 430 }} className="min-w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={22} size={1} color="rgba(148,163,184,0.2)" />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}