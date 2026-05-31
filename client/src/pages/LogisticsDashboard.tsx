/**
 * Logistics Surcharges Dashboard
 * Diesel Price + Cass Freight Index + WCI Ocean Container Rate
 * Pattern: stats cards + 3 separate charts + 6-month forecasts with confidence bands
 */

import { useMemo } from "react";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, ExternalLink,
  Loader2, AlertCircle, Fuel, Ship, BarChart2, Calendar, Activity
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area, ComposedChart
} from "recharts";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

// Format date as MMM 'YY
function fmtDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// 6-month linear forecast with widening confidence bands
function buildForecast(series: { date: string; value: number }[]) {
  if (series.length < 3) return [];
  const recent = series.slice(-12);
  const xs = recent.map((_, i) => i);
  const ys = recent.map(d => d.value);
  const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
  const denom = xs.reduce((acc, x) => acc + (x - xMean) ** 2, 0);
  const slope = denom === 0 ? 0 : xs.reduce((acc, x, i) => acc + (x - xMean) * (ys[i] - yMean), 0) / denom;
  const intercept = yMean - slope * xMean;
  const residuals = ys.map((y, i) => y - (intercept + slope * xs[i]));
  const stdDev = Math.sqrt(residuals.reduce((a, b) => a + b ** 2, 0) / residuals.length);

  const lastDate = new Date(series[series.length - 1].date);
  return Array.from({ length: 6 }, (_, i) => {
    const fd = new Date(lastDate);
    fd.setMonth(fd.getMonth() + i + 1);
    const x = recent.length + i;
    const forecast = intercept + slope * x;
    const band = stdDev * (1 + (i + 1) * 0.15);
    return {
      date: fmtDate(fd.toISOString()),
      forecast: parseFloat(forecast.toFixed(3)),
      upper: parseFloat((forecast + 1.645 * band).toFixed(3)),
      lower: parseFloat((forecast - 1.645 * band).toFixed(3)),
    };
  });
}

function buildChartData(
  series: { date: string; value: number }[],
  dataKey: string
) {
  const historical = series.map(d => ({
    date: fmtDate(d.date),
    [dataKey]: d.value,
    forecast: undefined as number | undefined,
    upper: undefined as number | undefined,
    lower: undefined as number | undefined,
    isForecast: false,
  }));
  const forecast = buildForecast(series).map(f => ({
    date: f.date,
    [dataKey]: undefined as number | undefined,
    forecast: f.forecast,
    upper: f.upper,
    lower: f.lower,
    isForecast: true,
  }));
  return [...historical, ...forecast];
}

interface MetricChartProps {
  title: string;
  description: string;
  data: ReturnType<typeof buildChartData>;
  dataKey: string;
  color: string;
  bandColor: string;
  yFormatter?: (v: number) => string;
  tooltipFormatter?: (v: number) => string;
  sourceHref: string;
  sourceLabel: string;
}

function MetricChart({
  title, description, data, dataKey, color, bandColor,
  yFormatter, tooltipFormatter, sourceHref, sourceLabel
}: MetricChartProps) {
  const forecastStartDate = data.find(d => d.isForecast)?.date;
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-4 h-4" style={{ color }} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
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
              domain={['dataMin - 2%', 'dataMax + 2%']}
              tickFormatter={yFormatter}
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
                const formatted = tooltipFormatter && typeof value === "number"
                  ? tooltipFormatter(value)
                  : typeof value === "number" ? value.toFixed(3) : value;
                return [formatted, name];
              }}
            />
            <Legend />
            {/* Confidence band */}
            <Area type="monotone" dataKey="upper" stroke="none" fill={bandColor} fillOpacity={0.35} name="upper" legendType="none" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" fillOpacity={1} name="lower" legendType="none" />
            {/* Actual */}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, r: 3 }}
              activeDot={{ r: 6 }}
              name={dataKey}
              connectNulls={false}
            />
            {/* Forecast */}
            <Line
              type="monotone"
              dataKey="forecast"
              stroke={color}
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ fill: color, r: 3, fillOpacity: 0.5 }}
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
        <div className="mt-3">
          <a
            href={sourceHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {sourceLabel}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LogisticsDashboard() {
  const { data: allIndices, isLoading, error } = trpc.supplyChainIndices.getAll.useQuery();

  const sorted = useMemo(() =>
    (allIndices || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [allIndices]
  );

  const dieselSeries = useMemo(() =>
    sorted.filter(d => d.dieselPrice !== null).map(d => ({ date: d.date, value: parseFloat(d.dieselPrice || "0") })),
    [sorted]
  );
  const cassSeries = useMemo(() =>
    sorted.filter(d => d.cassExpenditure !== null).map(d => ({ date: d.date, value: parseFloat(d.cassExpenditure || "0") })),
    [sorted]
  );
  const wciSeries = useMemo(() =>
    sorted.filter(d => d.wciOcean !== null).map(d => ({ date: d.date, value: parseFloat(d.wciOcean || "0") })),
    [sorted]
  );

  const dieselChartData = useMemo(() => buildChartData(dieselSeries, "Diesel Price ($/gal)"), [dieselSeries]);
  const cassChartData = useMemo(() => buildChartData(cassSeries, "Cass Freight Index"), [cassSeries]);
  const wciChartData = useMemo(() => buildChartData(wciSeries, "WCI Ocean ($/FEU)"), [wciSeries]);

  // Stats helpers
  function seriesStats(series: { date: string; value: number }[]) {
    if (series.length === 0) return null;
    const values = series.map(d => d.value);
    const latest = values[values.length - 1];
    const prev = values[values.length - 2] ?? latest;
    const yearAgo = values[values.length - 13] ?? values[0];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const mom = prev > 0 ? ((latest - prev) / prev) * 100 : 0;
    const yoy = yearAgo > 0 ? ((latest - yearAgo) / yearAgo) * 100 : 0;
    const latestDate = series[series.length - 1].date;
    return { latest, prev, min, max, avg, mom, yoy, latestDate };
  }

  const diesel = useMemo(() => seriesStats(dieselSeries), [dieselSeries]);
  const cass = useMemo(() => seriesStats(cassSeries), [cassSeries]);
  const wci = useMemo(() => seriesStats(wciSeries), [wciSeries]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading logistics data...</p>
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
    if (change > 0.5) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (change < -0.5) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const changeText = (change: number) => {
    const color = change > 0 ? "text-red-600" : change < 0 ? "text-green-600" : "text-slate-500";
    return <span className={`font-semibold ${color}`}>{change > 0 ? "+" : ""}{change.toFixed(2)}%</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white py-12 shadow-2xl">
        <div className="container">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-emerald-200 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-5 h-5" />
              Back to Brief
            </button>
          </Link>
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-widest text-emerald-300 font-medium">
              Supply Chain Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Logistics Surcharges
            </h1>
            <p className="text-lg text-emerald-200">
              Diesel fuel costs, freight expenditures, and ocean shipping rates with 6-month forecasts
            </p>
          </div>
        </div>
      </header>

      <main className="container py-12">
        {/* Stats Cards — 3 metrics × 3 stats each */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Diesel */}
          {diesel && (
            <Card className="border-l-4 border-l-emerald-600">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5" /> Diesel Price
                </CardDescription>
                <CardTitle className="text-3xl">${diesel.latest.toFixed(3)}<span className="text-base font-normal text-muted-foreground">/gal</span></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-sm mb-1">
                  {trendIcon(diesel.mom)}
                  {changeText(diesel.mom)} MoM
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Activity className="w-3.5 h-3.5" />
                  YoY: {changeText(diesel.yoy)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {fmtDate(diesel.latestDate)} · Avg ${diesel.avg.toFixed(3)} · High ${diesel.max.toFixed(3)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cass */}
          {cass && (
            <Card className="border-l-4 border-l-teal-600">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" /> Cass Freight Index
                </CardDescription>
                <CardTitle className="text-3xl">{cass.latest.toFixed(2)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-sm mb-1">
                  {trendIcon(cass.mom)}
                  {changeText(cass.mom)} MoM
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Activity className="w-3.5 h-3.5" />
                  YoY: {changeText(cass.yoy)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {fmtDate(cass.latestDate)} · Avg {cass.avg.toFixed(2)} · High {cass.max.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* WCI */}
          {wci && (
            <Card className="border-l-4 border-l-cyan-600">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5" /> WCI Ocean Rate
                </CardDescription>
                <CardTitle className="text-3xl">${wci.latest.toFixed(0)}<span className="text-base font-normal text-muted-foreground">/FEU</span></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-sm mb-1">
                  {trendIcon(wci.mom)}
                  {changeText(wci.mom)} MoM
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Activity className="w-3.5 h-3.5" />
                  YoY: {changeText(wci.yoy)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {fmtDate(wci.latestDate)} · Avg ${wci.avg.toFixed(0)} · High ${wci.max.toFixed(0)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Diesel Chart */}
        <MetricChart
          title="Diesel Price — Historical & 6-Month Forecast"
          description="US National Average retail diesel price. Shaded area = 90% confidence band."
          data={dieselChartData}
          dataKey="Diesel Price ($/gal)"
          color="#059669"
          bandColor="#a7f3d0"
          yFormatter={v => `$${v.toFixed(2)}`}
          tooltipFormatter={v => `$${v.toFixed(3)}/gal`}
          sourceHref="https://www.eia.gov/petroleum/gasdiesel/"
          sourceLabel="Source: U.S. Energy Information Administration (EIA)"
        />

        {/* Cass Chart */}
        <MetricChart
          title="Cass Freight Index — Historical & 6-Month Forecast"
          description="Freight expenditure index (Base: 1990 = 1.00). Shaded area = 90% confidence band."
          data={cassChartData}
          dataKey="Cass Freight Index"
          color="#0d9488"
          bandColor="#99f6e4"
          yFormatter={v => v.toFixed(2)}
          tooltipFormatter={v => v.toFixed(3)}
          sourceHref="https://www.cassinfo.com/freight-audit-indexes"
          sourceLabel="Source: Cass Information Systems"
        />

        {/* WCI Chart */}
        <MetricChart
          title="WCI Ocean Container Rate — Historical & 6-Month Forecast"
          description="World Container Index composite rate (USD per 40-ft container). Shaded area = 90% confidence band."
          data={wciChartData}
          dataKey="WCI Ocean ($/FEU)"
          color="#0891b2"
          bandColor="#a5f3fc"
          yFormatter={v => `$${v.toLocaleString()}`}
          tooltipFormatter={v => `$${v.toLocaleString()}/FEU`}
          sourceHref="https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry"
          sourceLabel="Source: Drewry World Container Index"
        />

        {/* Interpretation Guide */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle className="text-lg">Interpretation Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              <strong className="text-foreground">Diesel Price</strong> is the most direct input to domestic freight costs. A $0.10/gal increase typically adds 0.5–1% to truckload rates and directly impacts just-in-time delivery economics.
            </p>
            <p>
              <strong className="text-foreground">Cass Freight Index</strong> measures total freight expenditures across all modes. Rising values signal tightening capacity or higher demand, which can delay inbound materials and increase expedite costs.
            </p>
            <p>
              <strong className="text-foreground">WCI Ocean Rate</strong> reflects spot container shipping costs. Elevated rates increase landed cost of imported components and raw materials, with a 4–8 week lag before impacting production costs.
            </p>
            <p className="pt-2 border-t border-border">
              <strong className="text-foreground">Forecast Note:</strong> All 6-month projections use linear trend extrapolation from recent data. The shaded confidence band widens over time to reflect increasing uncertainty. Use these as directional signals, not precise predictions.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
