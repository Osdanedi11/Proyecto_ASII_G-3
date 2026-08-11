import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ProgressPoint = {
  label: string;
  progress: number;
};

type ProgressChartProps = {
  data: ProgressPoint[];
};

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="progressStroke" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#4fdff5" stopOpacity={0.78} />
              <stop offset="100%" stopColor="#5f92ff" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="label" stroke="#8fa8c5" axisLine={false} tickLine={false} />
          <YAxis stroke="#8fa8c5" axisLine={false} tickLine={false} width={32} />
          <Tooltip
            contentStyle={{
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(7, 20, 34, 0.94)',
            }}
          />
          <Area type="monotone" dataKey="progress" stroke="#4fdff5" strokeWidth={2.5} fill="url(#progressStroke)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
