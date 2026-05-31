/**
 * Landed-cost Reality Check Dashboard
 * Lagging indicator: BLS Import Price Index (Industrial Supplies & Materials)
 * Pattern: stats cards + trend chart + 6-month forecast with confidence bands
 */

import { useMemo } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ExternalLink, Loader2, AlertCircle, DollarSign, BarChart2, Activity, Calendar } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart
} from "recharts";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

// Format date as MMM 'YY (e.g. "Jan '25")
function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// Generate a 6-month linear forecast with confidence bands
function buildForecast(historicalData: { date: string; value: number }[]) {
  if (historicalData.length < 3) return [];
  const n = historicalData.length;
  // Simple linear regression on last 12 points
  const recent = historicalData.slice(-12);
  const xs = recent.map((_, i) => i);
  const ys = recent.map(d => d.value);
  const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
  const slope = xs.reduce((acc, x, i) => acc + (x - xMean) * (ys[i] - yMean), 0) /
    xs.reduce((acc, x) => acc + (x - xMean) ** 2, 0);
  const intercept = yMean - slope * xMean;

  // Residual std dev for confidence band
  const residuals = ys.map((y, i) => y - (intercept + slope * xs[i]));
  const stdDev = Math.sqrt(residuals.reduce((a, b) => a + b ** 2, 0) / residuals.length);

  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  return Array.from({ length: 6 }, (_, i) => {
    const forecastDate = new Date(lastDate);
    forecastDate.setMonth(forecastDate.getMonth() + i + 1);
    const x = recent.length + i;
    const forecast = intercept + slope * x;
    const band = stdDev * (1 + (i + 1) * 0.15); // widening band
    return {
      date: fmtDate(forecastDate.toISOString()),
      forecast: parseFloat(forecast.toFixed(2)),
      upper: parseFloat((forecast + 1.645 * band).toFixed(2)),
      lower: parseFloat((forecast - 1.645 * band).toFixed(2)),
      isForecast: true,
    };
  });
}

export default function LandedCostDashboard() {
  const { data: allIndices, isLoading, error } = trpc.supplyChainIndices.getAll.useQuery();

  const blsData = useMemo(() => {
    return (allIndices || [])
      .filter(d => d.blsImportPrice !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allIndices]);

  const historicalSeries = useMemo(() =>
    blsData.map(d => ({ date: d.date, value: parseFloat(d.blsImportPrice || "0") })),
    [blsData]
  );

  const chartData = useMemo(() => {
    const historical = historicalSeries.map(d => ({
      date: fmtDate(d.date),
      actual: d.value,
      forecast: undefined as number | undefined,
      upper: undefined as number | undefined,
      lower: undefined as number | undefined,
      isForecast: false,
    }));
    const forecast = buildForecast(historicalSeries).map(f => ({
      date: f.date,
      actual: undefined as number | undefined,
      forecast: f.forecast,
      upper: f.upper,
      lower: f.lower,
      isForecast: true,
    }));
    return [...historical, ...forecast];
  }, [historicalSeries]);

  // Stats
  const stats = useMemo(() => {
    if (historicalSeries.length === 0) return null;
    const values = historicalSeries.map(d => d.value);
    const latest = values[values.length - 1];
    const prev = values[values.length - 2] ?? latest;
    const yearAgo = values[values.length - 13] ?? values[0];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const mom = prev > 0 ? ((latest - prev) / prev) * 100 : 0;
    const yoy = yearAgo > 0 ? ((latest - yearAgo) / yearAgo) * 100 : 0;
    const latestEntry = blsData[blsData.length - 1];
    return { latest, prev, yearAgo, min, max, avg, mom, yoy, latestEntry };
  }, [historicalSeries, blsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading import price data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-lg text-foreground mb-2">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const trendIcon = (change: number) => {
    if (change > 0.5) return <TrendingUp className="w-5 h-5 text-red-500" />;
    if (change < -0.5) return <TrendingDown className="w-5 h-5 text-green-500" />;
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  const changeText = (change: number, suffix = "%") => {
    const color = change > 0 ? "text-red-600" : change < 0 ? "text-green-600" : "text-slate-500";
    return (
      <span className={`font-semibold ${color}`}>
        {change > 0 ? "+" : ""}{change.toFixed(2)}{suffix}
      </span>
    );
  };

  // Find where forecast starts for reference line
  const forecastStartDate = chartData.find(d => d.isForecast)?.date;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white py-12 shadow-2xl">
        <div className="container">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-5 h-5" />
              Back to Brief
            </button>
          </Link>
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-widest text-blue-300 font-medium">
              Supply Chain Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Landed-cost Reality Check
            </h1>
            <p className="text-lg text-blue-200">
              BLS Import Price Index — Industrial Supplies &amp; Materials (Lagging Indicator)
            </p>
          </div>
        </div>
      </header>

      <main className="container py-12">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Current Index
                </CardDescription>
                <CardTitle className="text-3xl">{stats.latest.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-sm">
                  {trendIcon(stats.mom)}
                  {changeText(stats.mom)} MoM
                </div>
                <div className="text-xs text-muted-foreground mt-1.5">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {stats.latestEntry ? fmtDate(stats.latestEntry.date) : ""}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Year-over-Year
                </CardDescription>
                <CardTitle className="text-3xl">{changeText(stats.yoy)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">vs. 12 months prior</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" /> Period High
                </CardDescription>
                <CardTitle className="text-3xl">{stats.max.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Peak in dataset</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" /> Period Average
                </CardDescription>
                <CardTitle className="text-3xl">{stats.avg.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Mean over all data</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trend + Forecast Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              BLS Import Price Index — Historical &amp; 6-Month Forecast
            </CardTitle>
            <CardDescription>
              Shaded area shows 90% confidence band for the 6-month projection. Base year 2000 = 100.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={420}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  height={55}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tickFormatter={v => v.toFixed(0)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.97)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === "upper" || name === "lower") return null;
                    return [typeof value === "number" ? value.toFixed(2) : value, name];
                  }}
                />
                <Legend />
                {/* Confidence band */}
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="#bfdbfe"
                  fillOpacity={0.4}
                  name="upper"
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="#ffffff"
                  fillOpacity={1}
                  name="lower"
                  legendType="none"
                />
                {/* Actual line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: '#2563eb', r: 3 }}
                  activeDot={{ r: 6 }}
                  name="BLS Import Price Index"
                  connectNulls={false}
                />
                {/* Forecast line */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{ fill: '#93c5fd', r: 3 }}
                  name="6-Month Forecast"
                  connectNulls={false}
                />
                {forecastStartDate && (
                  <ReferenceLine
                    x={forecastStartDate}
                    stroke="#94a3b8"
                    strokeDasharray="4 2"
                    label={{ value: "Forecast →", position: "top", fontSize: 11, fill: "#64748b" }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interpretation Guide */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">Interpretation Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">BLS Import Price Index</strong> measures the actual landed cost of imported industrial supplies and materials. This is a <strong className="text-foreground">lagging indicator</strong> that reflects realized costs after tariffs, freight, and other charges are applied.
            </p>
            <p>
              The index is based on 2000 = 100. A current value of {stats?.latest.toFixed(2)} represents a {stats ? ((stats.latest - 100) / 100 * 100).toFixed(1) : "—"}% cumulative change since the base year.
            </p>
            <p className="pt-2 border-t border-border">
              <strong className="text-foreground">Cost Signal:</strong> Rising BLS values indicate increasing import costs, which directly impact automotive manufacturing margins. Compare this lagging indicator with leading indicators (TPU, materials pricing) to anticipate future cost pressures.
            </p>
            <p>
              <strong className="text-foreground">Forecast Note:</strong> The 6-month projection uses linear trend extrapolation from recent data. The shaded band represents the 90% confidence interval — wider bands indicate higher uncertainty further into the future.
            </p>
            <div className="pt-2 border-t border-border">
              <a
                href="https://www.bls.gov/mxp/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Data Source: U.S. Bureau of Labor Statistics (BLS)
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
