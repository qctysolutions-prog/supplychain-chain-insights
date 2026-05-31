/**
 * Tariff/Policy Risk Dashboard
 * Leading indicators: TPU + US Trade TPU
 * Redesigned to match aluminum pricing index pattern
 */

import { ArrowLeft, TrendingUp, TrendingDown, Minus, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TariffPolicyDashboard() {
  const { data: allIndices, isLoading, error } = trpc.supplyChainIndices.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading tariff & policy data...</p>
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

  // Filter data with tariff values and sort by date
  const tariffData = (allIndices || [])
    .filter(d => d.tpuIndex !== null || d.usTradeTpu !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prepare chart data for TPU Index
  const tpuChartData = tariffData
    .filter(d => d.tpuIndex !== null)
    .map((d, idx) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", " '"),
      value: parseFloat(d.tpuIndex || "0"),
      upperBound: parseFloat(d.tpuIndex || "0") * 1.10,
      lowerBound: parseFloat(d.tpuIndex || "0") * 0.90,
      isForecast: false,
    }));

  // Add TPU forecast (assuming moderate increase trend)
  if (tpuChartData.length >= 3) {
    const recent = tpuChartData.slice(-3);
    const avgChange = (recent[2].value - recent[0].value) / 2;
    const lastValue = recent[2].value;
    
    for (let i = 1; i <= 6; i++) {
      const forecastDate = new Date(tariffData[tariffData.length - 1].date);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const forecastValue = lastValue + (avgChange * i);
      tpuChartData.push({
        date: forecastDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", " '"),
        value: forecastValue,
        upperBound: forecastValue * 1.15, // +15% confidence band
        lowerBound: forecastValue * 0.85, // -15% confidence band
        isForecast: true,
      });
    }
  }

  // Prepare chart data for US Trade TPU
  const usTpuChartData = tariffData
    .filter(d => d.usTradeTpu !== null)
    .map((d, idx) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", " '"),
      value: parseFloat(d.usTradeTpu || "0"),
      upperBound: parseFloat(d.usTradeTpu || "0") * 1.10,
      lowerBound: parseFloat(d.usTradeTpu || "0") * 0.90,
      isForecast: false,
    }));

  // Add US TPU forecast
  if (usTpuChartData.length >= 3) {
    const recent = usTpuChartData.slice(-3);
    const avgChange = (recent[2].value - recent[0].value) / 2;
    const lastValue = recent[2].value;
    
    for (let i = 1; i <= 6; i++) {
      const forecastDate = new Date(tariffData[tariffData.length - 1].date);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const forecastValue = lastValue + (avgChange * i);
      usTpuChartData.push({
        date: forecastDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", " '"),
        value: forecastValue,
        upperBound: forecastValue * 1.15,
        lowerBound: forecastValue * 0.85,
        isForecast: true,
      });
    }
  }

  // Calculate statistics for TPU
  const tpuValues = tariffData.filter(d => d.tpuIndex).map(d => parseFloat(d.tpuIndex!));
  const tpuCurrent = tpuValues[tpuValues.length - 1] || 0;
  const tpuMin = Math.min(...tpuValues);
  const tpuMax = Math.max(...tpuValues);
  const tpuAvg = tpuValues.reduce((a, b) => a + b, 0) / tpuValues.length;
  const tpuVolatility = (Math.max(...tpuValues.slice(-3)) - Math.min(...tpuValues.slice(-3))) / tpuAvg * 100;
  const tpu3MonthChange = tpuValues.length >= 4 ? ((tpuCurrent - tpuValues[tpuValues.length - 4]) / tpuValues[tpuValues.length - 4] * 100) : 0;

  // Calculate statistics for US Trade TPU
  const usTpuValues = tariffData.filter(d => d.usTradeTpu).map(d => parseFloat(d.usTradeTpu!));
  const usTpuCurrent = usTpuValues[usTpuValues.length - 1] || 0;
  const usTpuMin = Math.min(...usTpuValues);
  const usTpuMax = Math.max(...usTpuValues);
  const usTpuAvg = usTpuValues.reduce((a, b) => a + b, 0) / usTpuValues.length;
  const usTpuVolatility = (Math.max(...usTpuValues.slice(-3)) - Math.min(...usTpuValues.slice(-3))) / usTpuAvg * 100;
  const usTpu3MonthChange = usTpuValues.length >= 4 ? ((usTpuCurrent - usTpuValues[usTpuValues.length - 4]) / usTpuValues[usTpuValues.length - 4] * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white py-16 shadow-2xl">
        <div className="container">
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 text-red-200 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Supply Chain Brief
          </a>
          <div className="text-center space-y-4">
            <div className="text-sm uppercase tracking-widest text-red-200 font-medium">
              Supply Chain Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Tariff/Policy Risk (Leading)
            </h1>
            <div className="text-lg text-red-200">
              TPU Index • US Trade TPU • Trend & 3-Month Change
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* TPU Index Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-purple-600 rounded"></div>
            TPU Index (Trade Policy Uncertainty)
          </h2>

          {/* TPU Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-l-4 border-l-purple-600">
              <CardHeader className="pb-3">
                <CardDescription>Current Index</CardDescription>
                <CardTitle className="text-2xl">{tpuCurrent.toFixed(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Index value</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month High</CardDescription>
                <CardTitle className="text-2xl">{tpuMax.toFixed(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Peak uncertainty</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month Low</CardDescription>
                <CardTitle className="text-2xl">{tpuMin.toFixed(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Lowest uncertainty</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>3-Month Change</CardDescription>
                <CardTitle className={`text-2xl ${tpu3MonthChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {tpu3MonthChange > 0 ? '+' : ''}{tpu3MonthChange.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Quarterly trend</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Volatility (3M)</CardDescription>
                <CardTitle className="text-2xl">{tpuVolatility.toFixed(1)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Index variation</div>
              </CardContent>
            </Card>
          </div>

          {/* TPU Chart with Confidence Band */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                TPU Index Trend & 6-Month Forecast
              </CardTitle>
              <CardDescription>
                Historical trade policy uncertainty with trend projection and ±15% confidence band
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={tpuChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="tpuConfidenceBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === "Confidence Band") return null;
                      return [Number(value).toFixed(1), name];
                    }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="none"
                    fill="url(#tpuConfidenceBand)"
                    fillOpacity={1}
                    name="Confidence Band"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="none"
                    fill="#ffffff"
                    fillOpacity={1}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#9333ea" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#9333ea' }}
                    data={tpuChartData.filter(d => !d.isForecast)}
                    name="TPU Index"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#9333ea" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls
                    data={tpuChartData.filter(d => d.isForecast)}
                    name="Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-border">
                <a
                  href="https://www.policyuncertainty.com/trade_uncertainty.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Source: Economic Policy Uncertainty
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* US Trade TPU Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-indigo-600 rounded"></div>
            US Trade TPU (US-Specific Trade Policy Uncertainty)
          </h2>

          {/* US TPU Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-l-4 border-l-indigo-600">
              <CardHeader className="pb-3">
                <CardDescription>Current Index</CardDescription>
                <CardTitle className="text-2xl">{usTpuCurrent.toFixed(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Index value</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month High</CardDescription>
                <CardTitle className="text-2xl">{usTpuMax.toFixed(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Peak uncertainty</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month Low</CardDescription>
                <CardTitle className="text-2xl">{usTpuMin.toFixed(1)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Lowest uncertainty</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>3-Month Change</CardDescription>
                <CardTitle className={`text-2xl ${usTpu3MonthChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {usTpu3MonthChange > 0 ? '+' : ''}{usTpu3MonthChange.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Quarterly trend</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Volatility (3M)</CardDescription>
                <CardTitle className="text-2xl">{usTpuVolatility.toFixed(1)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Index variation</div>
              </CardContent>
            </Card>
          </div>

          {/* US TPU Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                US Trade TPU Trend & 6-Month Forecast
              </CardTitle>
              <CardDescription>
                US-specific trade policy uncertainty with trend projection and ±15% confidence band
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={usTpuChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="usTpuConfidenceBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === "Confidence Band") return null;
                      return [Number(value).toFixed(1), name];
                    }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="none"
                    fill="url(#usTpuConfidenceBand)"
                    fillOpacity={1}
                    name="Confidence Band"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="none"
                    fill="#ffffff"
                    fillOpacity={1}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#4f46e5' }}
                    data={usTpuChartData.filter(d => !d.isForecast)}
                    name="US Trade TPU"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls
                    data={usTpuChartData.filter(d => d.isForecast)}
                    name="Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-border">
                <a
                  href="https://www.policyuncertainty.com/us_trade.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Source: Economic Policy Uncertainty (US Trade)
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Insights Section */}
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-6">Key Insights & Risk Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Risk Assessment</CardTitle>
                <CardDescription>Current uncertainty levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Global TPU Risk Level</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    tpuCurrent > 200 ? 'bg-red-100 text-red-800' : 
                    tpuCurrent > 150 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {tpuCurrent > 200 ? 'High' : tpuCurrent > 150 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">US Trade TPU Risk Level</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    usTpuCurrent > 200 ? 'bg-red-100 text-red-800' : 
                    usTpuCurrent > 150 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {usTpuCurrent > 200 ? 'High' : usTpuCurrent > 150 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">3-Month Trend</span>
                  <span className={`font-semibold ${tpu3MonthChange > 5 ? 'text-red-600' : tpu3MonthChange < -5 ? 'text-green-600' : 'text-amber-600'}`}>
                    {tpu3MonthChange > 5 ? 'Rising' : tpu3MonthChange < -5 ? 'Declining' : 'Stable'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                  Leading indicator: Rising TPU typically precedes supply chain disruptions by 2-3 months.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strategic Recommendations</CardTitle>
                <CardDescription>Based on current trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5"></div>
                    <p className="text-sm">
                      {tpu3MonthChange > 5 
                        ? "Consider increasing safety stock levels due to rising policy uncertainty" 
                        : "Monitor for potential policy changes that could affect supply chains"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5"></div>
                    <p className="text-sm">
                      {usTpu3MonthChange > 5 
                        ? "Evaluate alternative sourcing options outside high-risk trade corridors" 
                        : "Current US trade policy environment is relatively stable"}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-slate-600 rounded-full mt-1.5"></div>
                    <p className="text-sm">
                      Review contract terms for force majeure clauses related to tariff changes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
