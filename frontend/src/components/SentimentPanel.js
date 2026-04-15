import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = { positive: '#10b981', neutral: '#f59e0b', negative: '#ef4444' };

const SentimentPanel = ({ data }) => {
  if (!data) return (
    <div className="card empty-state">
      <p>No sentiment data yet. Submit feedback with comments to see analysis.</p>
    </div>
  );

  const pieData = Object.entries(data.distribution)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  return (
    <div className="sentiment-panel">
      <div className="card">
        <h3>Sentiment Distribution</h3>
        <div className="sentiment-summary">
          {Object.entries(data.distribution).map(([label, count]) => (
            <div key={label} className={`sentiment-badge ${label}`}>
              <strong>{count}</strong>
              <span>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {pieData.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name.toLowerCase()] || '#8b5cf6'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {data.topKeywords?.length > 0 && (
        <div className="card">
          <h3>Most Common Issues / Themes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topKeywords} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="keyword" width={130} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SentimentPanel;
