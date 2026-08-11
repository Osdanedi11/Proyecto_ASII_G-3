import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type WorkloadPoint = {
  member: string;
  hours: number;
};

type WorkloadChartProps = {
  data: WorkloadPoint[];
};

export function WorkloadChart({ data }: WorkloadChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="member" stroke="#8fa8c5" axisLine={false} tickLine={false} />
          <YAxis stroke="#8fa8c5" axisLine={false} tickLine={false} width={32} />
          <Tooltip
            contentStyle={{
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(7, 20, 34, 0.94)',
            }}
          />
          <Bar dataKey="hours" fill="#7cd6ff" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
