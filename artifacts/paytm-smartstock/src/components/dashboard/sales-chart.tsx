import { useGetTransactions } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";

export function SalesChart() {
  const { data: transactions, isLoading } = useGetTransactions();

  // Aggregate transactions by date/time for the chart
  const chartData = transactions?.slice().reverse().reduce((acc: any[], curr) => {
    const time = format(new Date(curr.timestamp), "HH:mm");
    const existing = acc.find(item => item.time === time);
    if (existing) {
      existing.sales += curr.total;
    } else {
      acc.push({ time, sales: curr.total });
    }
    return acc;
  }, []) || [];

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-lg">Sales Trend</h2>
        <p className="text-sm text-muted-foreground mt-1">Live transaction volume over time</p>
      </div>

      <div className="h-[300px] w-full">
        {isLoading ? (
          <div className="w-full h-full bg-muted/30 animate-pulse rounded-xl" />
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00baf2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00baf2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(val) => `₹${val}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`₹${value}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#00baf2" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSales)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center flex-col text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
            <p>No sales data yet</p>
            <p className="text-sm">Log a sale to generate the chart</p>
          </div>
        )}
      </div>
    </div>
  );
}
