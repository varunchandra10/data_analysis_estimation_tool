import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import { Database, AlertTriangle, Users, ShieldCheck } from 'lucide-react';
import { DEFAULT_PROJECT_ID, apiUrl } from '../api/config';

function MetricBullet({ icon: Icon, label, value, percent }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
      <div className="rounded-md bg-slate-800 p-2">
        <Icon size={18} className="text-cyan-300" />
      </div>
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-semibold text-slate-100">{value} ({percent}%)</div>
      </div>
    </div>
  );
}

export default function QualityScore({ versionName, datasetName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!versionName) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(apiUrl('/api/versioning/quality'), {
          params: {
            version_name: versionName,
            dataset_name: datasetName,
            ...(DEFAULT_PROJECT_ID ? { project_id: DEFAULT_PROJECT_ID } : {}),
          },
        });
        if (!active) return;
        setData(res.data?.quality || null);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.detail || err.message || 'Failed to load quality score');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [versionName, datasetName]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return [{ name: 'Quality', value: data.score, fill: '#22c55e' }];
  }, [data]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#08101f] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase text-slate-500">Data Quality Score</div>
          <h3 className="text-lg font-semibold text-slate-100">{data ? `${data.score}/100 — ${data.grade}` : 'No data'}</h3>
          <div className="text-sm text-slate-400">Version: <span className="font-mono">{versionName}</span></div>
        </div>
        <div style={{ width: 120, height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={18} data={chartData} startAngle={180} endAngle={-180}>
              <RadialBar minAngle={15} background clockWise dataKey="value" />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading && <div className="mt-4 text-sm text-slate-400">Loading quality score...</div>}
      {error && <div className="mt-4 text-sm text-rose-300">{error}</div>}

      {data && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <MetricBullet icon={Database} label="Missing cells" value={data.metrics.missing} percent={data.metrics.missing_pct} />
          <MetricBullet icon={Users} label="Duplicate rows" value={data.metrics.duplicates} percent={data.metrics.duplicate_pct} />
          <MetricBullet icon={AlertTriangle} label="Outlier rows" value={data.metrics.outliers} percent={data.metrics.outlier_pct} />
          <MetricBullet icon={ShieldCheck} label="Validation failures" value={data.metrics.validation_violations} percent={data.metrics.validation_pct} />
        </div>
      )}
    </section>
  );
}
