/**
 * Supply Chain Dashboard Page
 * Displays comprehensive economic indices for supply chain risk assessment
 */

import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, Loader2, DollarSign, Truck, Factory, Globe } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SupplyChainDashboard() {
  const { data: indices, isLoading, error } = trpc.supplyChainIndices.getAll.useQuery();
  const { data: latestData } = trpc.supplyChainIndices.getLatest.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
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

  // Reverse data for chronological order in charts
  const chartData = [...(indices || [])].reverse();

  // Helper function to format change values
  const formatChange = (value: string | null | undefined) => {
    if (!value) return "N/A";
    const isPositive = value.startsWith("+");
    const isNegative = value.startsWith("-");
    return (
      <span className={isPositive ? "text-red-600" : isNegative ? "text-green-600" : "text-muted-foreground"}>
        {value}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 shadow-2xl">
        <div className="container">
          <Link href="/">
            <button className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-5 h-5" />
              Back to Brief
            </button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Supply Chain Dashboard
          </h1>
          <p className="text-lg text-slate-300">
            Economic Indices for Supply Chain Risk Assessment
          </p>
          {latestData && (
            <p className="text-sm text-slate-400 mt-2">
              Latest data: {latestData.date}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Tariff/Policy Risk Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-foreground">
              Tariff/Policy Risk (Leading Indicator)
            </h2>
          </div>

          {latestData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="glass-card rounded-xl p-6 border-l-4 border-l-red-500">
                <div className="text-sm text-muted-foreground mb-1">TPU Index</div>
                <div className="text-3xl font-bold text-foreground mb-1">{latestData.tpuIndex}</div>
                <div className="text-sm">3-month change: {formatChange(latestData.tpuChange3m)}</div>
              </div>
              <div className="glass-card rounded-xl p-6 border-l-4 border-l-red-500">
                <div className="text-sm text-muted-foreground mb-1">US Trade TPU</div>
                <div className="text-3xl font-bold text-foreground mb-1">{latestData.usTradeTpu}</div>
                <div className="text-sm">Trade-specific uncertainty</div>
              </div>
              <div className="glass-card rounded-xl p-6 border-l-4 border-l-amber-500">
                <div className="text-sm text-muted-foreground mb-1">BLS Import Price Index</div>
                <div className="text-3xl font-bold text-foreground mb-1">{latestData.blsImportPrice}</div>
                <div className="text-sm">Change: {formatChange(latestData.blsChange)}</div>
              </div>
            </div>
          )}

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">TPU Trend (12-Month)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tpuIndex" stroke="#dc2626" name="TPU Index" strokeWidth={2} />
                <Line type="monotone" dataKey="usTradeTpu" stroke="#f59e0b" name="US Trade TPU" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Materials Pricing Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Factory className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-foreground">
              Materials Pricing (Direct Impact)
            </h2>
          </div>

          {latestData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="glass-card rounded-xl p-6 border-l-4 border-l-blue-500">
                <div className="text-sm text-muted-foreground mb-1">HRC Steel ($/ton)</div>
                <div className="text-3xl font-bold text-foreground mb-1">${latestData.hrcPrice}</div>
                <div className="text-xs space-y-1">
                  <div>MoM: {formatChange(latestData.hrcMom)}</div>
                  <div>YoY: {formatChange(latestData.hrcYoy)}</div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-6 border-l-4 border-l-blue-500">
                <div className="text-sm text-muted-foreground mb-1">LME Aluminum ($/MT)</div>
                <div className="text-3xl font-bold text-foreground mb-1">${latestData.lmeAluminum}</div>
                <div className="text-xs space-y-1">
                  <div>MoM: {formatChange(latestData.lmeAlMom)}</div>
                  <div>YoY: {formatChange(latestData.lmeAlYoy)}</div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-6 border-l-4 border-l-blue-500">
                <div className="text-sm text-muted-foreground mb-1">CME Copper ($/lb)</div>
                <div className="text-3xl font-bold text-foreground mb-1">${latestData.cmeCopper}</div>
                <div className="text-xs space-y-1">
                  <div>MoM: {formatChange(latestData.cmeCuMom)}</div>
                  <div>YoY: {formatChange(latestData.cmeCuYoy)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Materials Price Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="hrcPrice" stroke="#2563eb" name="HRC Steel" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="lmeAluminum" stroke="#0ea5e9" name="LME Aluminum" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Logistics Costs Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-foreground">
              Logistics Costs (Surcharges & Freight)
            </h2>
          </div>

          {latestData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="glass-card rounded-xl p-6 border-l-4 border-l-emerald-500">
                <div className="text-sm text-muted-foreground mb-1">Diesel Price ($/gal)</div>
                <div className="text-3xl font-bold text-foreground mb-1">${latestData.dieselPrice}</div>
                <div className="text-sm">Change: {formatChange(latestData.dieselChange)}</div>
              </div>
              <div className="glass-card rounded-xl p-6 border-l-4 border-l-emerald-500">
                <div className="text-sm text-muted-foreground mb-1">Cass Freight Index</div>
                <div className="text-3xl font-bold text-foreground mb-1">{latestData.cassExpenditure}</div>
                <div className="text-sm">Change: {formatChange(latestData.cassChange)}</div>
              </div>
              <div className="glass-card rounded-xl p-6 border-l-4 border-l-emerald-500">
                <div className="text-sm text-muted-foreground mb-1">WCI Ocean Freight ($/FEU)</div>
                <div className="text-3xl font-bold text-foreground mb-1">${latestData.wciOcean}</div>
                <div className="text-sm">Change: {formatChange(latestData.wciChange)}</div>
              </div>
            </div>
          )}

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Logistics Cost Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="dieselPrice" stroke="#10b981" name="Diesel ($/gal)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="wciOcean" stroke="#059669" name="WCI Ocean ($/FEU)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Data Sources */}
        {latestData && (
          <div className="glass-card rounded-xl p-6 border-l-4 border-l-slate-500">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-2">
              Data Sources
            </h3>
            <p className="text-sm text-muted-foreground">{latestData.source}</p>
            {latestData.notes && (
              <>
                <h4 className="text-sm font-semibold text-foreground mt-4 mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{latestData.notes}</p>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
