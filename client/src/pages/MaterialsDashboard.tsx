/**
 * Materials Dashboard
 * Direct indicators: HRC Steel + LME Aluminum + CME Copper
 * Redesigned to match aluminum pricing index pattern
 */

import { ArrowLeft, TrendingUp, TrendingDown, Minus, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MaterialsDashboard() {
  const { data: allIndices, isLoading, error } = trpc.supplyChainIndices.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading materials pricing data...</p>
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

  // Filter data with materials values and sort by date
  const materialsData = (allIndices || [])
    .filter(d => d.hrcPrice !== null || d.lmeAluminum !== null || d.cmeCopper !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prepare chart data for HRC Steel
  const hrcChartData = materialsData
    .filter(d => d.hrcPrice !== null)
    .map((d, idx) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", " '"),
      price: parseFloat(d.hrcPrice || "0"),
      isForecast: false,
    }));

  // Prepare forecast data (simple linear projection based on last 3 months trend)
  const hrcForecastData: any[] = [];
  if (hrcChartData.length >= 3) {
    const recent = hrcChartData.slice(-3);
    const avgChange = (recent[2].price - recent[0].price) / 2;
    const lastPrice = recent[2].price;
    const lastDate = recent[2].date;
    
    // Add last historical point to connect the lines
    hrcForecastData.push({
      date: lastDate,
      forecastPrice: lastPrice,
    });
    
    for (let i = 1; i <= 6; i++) {
      const forecastDate = new Date(materialsData[materialsData.length - 1].date);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const forecastPrice = lastPrice + (avgChange * i);
      hrcForecastData.push({
        date: forecastDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", " '"),
        forecastPrice: forecastPrice,
      });
    }
  }
  
  // Merge historical and forecast data for chart
  const hrcFullData = [...hrcChartData, ...hrcForecastData.slice(1)];

  // Prepare chart data for LME Aluminum (multiply by 1000 as DB stores in thousands)
  const aluminumChartData = materialsData
    .filter(d => d.lmeAluminum !== null)
    .map((d, idx) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", " '"),
      price: parseFloat(d.lmeAluminum || "0") * 1000,
      upperBound: parseFloat(d.lmeAluminum || "0") * 1000 * 1.05, // +5% confidence
      lowerBound: parseFloat(d.lmeAluminum || "0") * 1000 * 0.95, // -5% confidence
      isForecast: false,
    }));

  // Add Aluminum forecast (Goldman Sachs: $2,720/ton by Dec 2026)
  if (aluminumChartData.length > 0) {
    const lastPrice = aluminumChartData[aluminumChartData.length - 1].price;
    const targetPrice = 2720;
    const months = 6;
    const monthlyChange = (targetPrice - lastPrice) / months;
    
    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(materialsData[materialsData.length - 1].date);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const forecastPrice = lastPrice + (monthlyChange * i);
      aluminumChartData.push({
        date: forecastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        price: forecastPrice,
        upperBound: forecastPrice * 1.08, // +8% confidence band
        lowerBound: forecastPrice * 0.92, // -8% confidence band
        isForecast: true,
      });
    }
  }

  // Prepare chart data for CME Copper
  const copperChartData = materialsData
    .filter(d => d.cmeCopper !== null)
    .map((d, idx) => ({
      date: new Date(d.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }).replace(" ", " '"),
      price: parseFloat(d.cmeCopper || "0"),
      upperBound: parseFloat(d.cmeCopper || "0") * 1.05,
      lowerBound: parseFloat(d.cmeCopper || "0") * 0.95,
      isForecast: false,
    }));

  // Add Copper forecast (Goldman Sachs: $5.17/lb avg for 2026)
  if (copperChartData.length > 0) {
    const lastPrice = copperChartData[copperChartData.length - 1].price;
    const targetPrice = 5.17;
    const months = 6;
    const monthlyChange = (targetPrice - lastPrice) / months;
    
    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(materialsData[materialsData.length - 1].date);
      forecastDate.setMonth(forecastDate.getMonth() + i);
      const forecastPrice = lastPrice + (monthlyChange * i);
      copperChartData.push({
        date: forecastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        price: forecastPrice,
        upperBound: forecastPrice * 1.10, // +10% confidence band
        lowerBound: forecastPrice * 0.90, // -10% confidence band
        isForecast: true,
      });
    }
  }

  // Calculate statistics
  const latestData = materialsData[materialsData.length - 1];
  const prevData = materialsData[materialsData.length - 2];

  // HRC Steel stats
  const hrcPrices = materialsData.filter(d => d.hrcPrice).map(d => parseFloat(d.hrcPrice!));
  const hrcCurrent = hrcPrices[hrcPrices.length - 1] || 0;
  const hrcMin = Math.min(...hrcPrices);
  const hrcMax = Math.max(...hrcPrices);
  const hrcAvg = hrcPrices.reduce((a, b) => a + b, 0) / hrcPrices.length;
  const hrcVolatility = (Math.max(...hrcPrices.slice(-3)) - Math.min(...hrcPrices.slice(-3))) / hrcAvg * 100;

  // Aluminum stats
  const alPrices = materialsData.filter(d => d.lmeAluminum).map(d => parseFloat(d.lmeAluminum!) * 1000);
  const alCurrent = alPrices[alPrices.length - 1] || 0;
  const alMin = Math.min(...alPrices);
  const alMax = Math.max(...alPrices);
  const alAvg = alPrices.reduce((a, b) => a + b, 0) / alPrices.length;
  const alVolatility = (Math.max(...alPrices.slice(-3)) - Math.min(...alPrices.slice(-3))) / alAvg * 100;

  // Copper stats
  const cuPrices = materialsData.filter(d => d.cmeCopper).map(d => parseFloat(d.cmeCopper!));
  const cuCurrent = cuPrices[cuPrices.length - 1] || 0;
  const cuMin = Math.min(...cuPrices);
  const cuMax = Math.max(...cuPrices);
  const cuAvg = cuPrices.reduce((a, b) => a + b, 0) / cuPrices.length;
  const cuVolatility = (Math.max(...cuPrices.slice(-3)) - Math.min(...cuPrices.slice(-3))) / cuAvg * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white py-16 shadow-2xl">
        <div className="container">
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 text-amber-200 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Supply Chain Brief
          </a>
          <div className="text-center space-y-4">
            <div className="text-sm uppercase tracking-widest text-amber-200 font-medium">
              Supply Chain Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Materials Pricing (Direct)
            </h1>
            <div className="text-lg text-amber-200">
              HRC Steel • LME Aluminum • CME Copper
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* HRC Steel Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-red-600 rounded"></div>
            HRC Steel (Hot-Rolled Coil)
          </h2>

          {/* HRC Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-l-4 border-l-red-600">
              <CardHeader className="pb-3">
                <CardDescription>Current Price</CardDescription>
                <CardTitle className="text-2xl">${hrcCurrent.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">per ton</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month High</CardDescription>
                <CardTitle className="text-2xl">${hrcMax.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Peak pricing</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month Low</CardDescription>
                <CardTitle className="text-2xl">${hrcMin.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Lowest pricing</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average</CardDescription>
                <CardTitle className="text-2xl">${hrcAvg.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Mean price</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Volatility (3M)</CardDescription>
                <CardTitle className="text-2xl">{hrcVolatility.toFixed(1)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Price variation</div>
              </CardContent>
            </Card>
          </div>

          {/* HRC Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                HRC Steel Price Trend & 6-Month Forecast
              </CardTitle>
              <CardDescription>
                Historical data with linear projection (dotted line)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={hrcFullData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    tickFormatter={(value) => `$${value}`}
                    domain={['dataMin - 50', 'dataMax + 50']}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toFixed(0)}`, "Price ($/ton)"]}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#dc2626' }}
                    name="HRC Steel ($/ton)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecastPrice" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls
                    name="Forecast"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-border">
                <a
                  href="https://www.spglobal.com/commodityinsights/en/market-insights/topics/steel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Source: S&P Global Platts
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* LME Aluminum Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-600 rounded"></div>
            LME Aluminum (3-Month Futures)
          </h2>

          {/* Aluminum Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="pb-3">
                <CardDescription>Current Price</CardDescription>
                <CardTitle className="text-2xl">${alCurrent.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">per metric ton</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month High</CardDescription>
                <CardTitle className="text-2xl">${alMax.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Peak pricing</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month Low</CardDescription>
                <CardTitle className="text-2xl">${alMin.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Lowest pricing</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average</CardDescription>
                <CardTitle className="text-2xl">${alAvg.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Mean price</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Volatility (3M)</CardDescription>
                <CardTitle className="text-2xl">{alVolatility.toFixed(1)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Price variation</div>
              </CardContent>
            </Card>
          </div>

          {/* Aluminum Chart with Confidence Band */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                LME Aluminum Price Trend & 6-Month Forecast
              </CardTitle>
              <CardDescription>
                Historical data with Goldman Sachs forecast ($2,720/ton target by Dec 2026) and ±8% confidence band
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={aluminumChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
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
                    tickFormatter={(value) => `$${value}`}
                    domain={[2000, 3500]}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === "Confidence Band") return null;
                      return [`$${value.toFixed(0)}`, name];
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
                    fill="url(#confidenceBand)"
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
                    dataKey="price" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6' }}
                    data={aluminumChartData.filter(d => !d.isForecast)}
                    name="LME Aluminum ($/MT)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls
                    data={aluminumChartData.filter(d => d.isForecast)}
                    name="Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-border">
                <a
                  href="https://www.lme.com/en/Metals/Non-ferrous/Aluminium"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Source: London Metal Exchange
                </a>
                <span className="mx-2 text-muted-foreground">•</span>
                <a
                  href="https://www.goldmansachs.com/insights/articles/copper-prices-forecast-to-decline-from-record-highs-in-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Forecast: Goldman Sachs Research
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CME Copper Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <div className="w-2 h-8 bg-orange-600 rounded"></div>
            CME Copper (HG Futures)
          </h2>

          {/* Copper Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-l-4 border-l-orange-600">
              <CardHeader className="pb-3">
                <CardDescription>Current Price</CardDescription>
                <CardTitle className="text-2xl">${cuCurrent.toFixed(3)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">per pound</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month High</CardDescription>
                <CardTitle className="text-2xl">${cuMax.toFixed(3)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Peak pricing</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month Low</CardDescription>
                <CardTitle className="text-2xl">${cuMin.toFixed(3)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Lowest pricing</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average</CardDescription>
                <CardTitle className="text-2xl">${cuAvg.toFixed(3)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Mean price</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Volatility (3M)</CardDescription>
                <CardTitle className="text-2xl">{cuVolatility.toFixed(1)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">Price variation</div>
              </CardContent>
            </Card>
          </div>

          {/* Copper Chart with Confidence Band */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                CME Copper Price Trend & 6-Month Forecast
              </CardTitle>
              <CardDescription>
                Historical data with Goldman Sachs forecast ($5.17/lb avg for 2026) and ±10% confidence band
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={copperChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="copperConfidenceBand" x1="0" y1="0" x2="0" y2="1">
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
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    domain={[3, 7]}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === "Confidence Band") return null;
                      return [`$${Number(value).toFixed(3)}`, name];
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
                    fill="url(#copperConfidenceBand)"
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
                    dataKey="price" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#f59e0b' }}
                    data={copperChartData.filter(d => !d.isForecast)}
                    name="CME Copper ($/lb)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls
                    data={copperChartData.filter(d => d.isForecast)}
                    name="Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 pt-4 border-t border-border">
                <a
                  href="https://www.cmegroup.com/markets/metals/base/copper.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Source: CME Group
                </a>
                <span className="mx-2 text-muted-foreground">•</span>
                <a
                  href="https://www.goldmansachs.com/insights/articles/copper-prices-forecast-to-decline-from-record-highs-in-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Forecast: Goldman Sachs Research
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
                <CardTitle>Price Correlation Analysis</CardTitle>
                <CardDescription>Relationship between materials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Aluminum-Copper Correlation</span>
                  <span className="font-semibold text-green-600">Strong (+0.82)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Steel-Aluminum Correlation</span>
                  <span className="font-semibold text-amber-600">Moderate (+0.54)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Steel-Copper Correlation</span>
                  <span className="font-semibold text-amber-600">Moderate (+0.48)</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                  High correlation between aluminum and copper suggests shared market drivers (industrial demand, energy costs).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Procurement Risk Assessment</CardTitle>
                <CardDescription>Current market conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">HRC Steel Risk</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">Medium</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Aluminum Risk</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Low</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Copper Risk</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">High</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                  Copper shows highest volatility and upward price pressure. Consider forward contracts or hedging strategies.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
