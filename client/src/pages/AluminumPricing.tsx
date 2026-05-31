/**
 * Aluminum Pricing Index Tracker Page
 * Displays historical aluminum pricing data with trend chart and tabular format
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, DollarSign, ArrowUp, ArrowDown, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AluminumPricing() {
  const { data: pricingData, isLoading, error } = trpc.aluminumPricing.getAll.useQuery();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<"chart" | "table" | "both">("both");

  // Sort data by date
  const sortedData = useMemo(() => {
    if (!pricingData) return [];
    return [...pricingData].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [pricingData, sortOrder]);

  // Prepare chart data (ascending order for timeline)
  const chartData = useMemo(() => {
    if (!pricingData) return [];
    return [...pricingData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        date: item.date,
        price: parseFloat(item.price.replace(/,/g, "")),
        displayPrice: item.price,
      }));
  }, [pricingData]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!pricingData || pricingData.length === 0) return null;
    
    const prices = pricingData.map((p) => parseFloat(p.price.replace(/,/g, "")));
    const current = prices[0];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    return {
      current: pricingData[0],
      min,
      max,
      avg,
      range: max - min,
    };
  }, [pricingData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 py-12">
        <div className="container">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-slate-600">Loading aluminum pricing data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 py-12">
        <div className="container">
          <div className="text-center text-red-600">
            <p>Error loading pricing data: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16 shadow-2xl">
        <div className="container">
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Supply Chain Brief
            </button>
          </Link>
          <div className="text-center space-y-4">
            <div className="text-sm uppercase tracking-widest text-slate-300 font-medium">
              Materials Pricing Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Aluminum Pricing Index
            </h1>
            <div className="text-lg text-slate-300 flex items-center justify-center gap-2">
              <DollarSign className="w-5 h-5" />
              <span>LME Aluminum Prices (USD per Metric Ton)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardDescription>Current Price</CardDescription>
                <CardTitle className="text-3xl">${stats.current.price}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {stats.current.changePercent && stats.current.changePercent.startsWith("+") ? (
                    <ArrowUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={stats.current.changePercent?.startsWith("+") ? "text-green-600" : "text-red-600"}>
                    {stats.current.change} ({stats.current.changePercent})
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {stats.current.date}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month High</CardDescription>
                <CardTitle className="text-3xl">${stats.max.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Peak pricing in period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month Low</CardDescription>
                <CardTitle className="text-3xl">${stats.min.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Lowest pricing in period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>12-Month Average</CardDescription>
                <CardTitle className="text-3xl">${stats.avg.toFixed(0).toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Mean price over period
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={view === "chart" ? "default" : "outline"}
            onClick={() => setView("chart")}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Chart View
          </Button>
          <Button
            variant={view === "table" ? "default" : "outline"}
            onClick={() => setView("table")}
          >
            Table View
          </Button>
          <Button
            variant={view === "both" ? "default" : "outline"}
            onClick={() => setView("both")}
          >
            Both
          </Button>
        </div>

        {/* Trend Chart */}
        {(view === "chart" || view === "both") && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Price Trend (12 Months)
              </CardTitle>
              <CardDescription>
                Historical aluminum pricing from {chartData[0]?.date} to {chartData[chartData.length - 1]?.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toLocaleString()}`, "Price (USD/MT)"]}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Aluminum Price (USD/MT)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        {(view === "table" || view === "both") && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Historical Pricing Data</CardTitle>
                  <CardDescription>
                    Detailed aluminum pricing records with change indicators
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  Sort: {sortOrder === "asc" ? "Oldest First" : "Newest First"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Price (USD/MT)</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-right">Change %</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.date}</TableCell>
                        <TableCell className="text-right font-semibold">${item.price}</TableCell>
                        <TableCell className={`text-right ${item.change?.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                          {item.change || "—"}
                        </TableCell>
                        <TableCell className={`text-right ${item.changePercent?.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                          {item.changePercent || "—"}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                            {item.source}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs">
                          {item.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="mt-12 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">About This Data</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Source:</strong> London Metal Exchange (LME) - The world's premier marketplace for industrial metals trading.
            </p>
            <p>
              <strong>Pricing Unit:</strong> USD per Metric Ton (MT) - Standard unit for aluminum commodity pricing.
            </p>
            <p>
              <strong>Update Frequency:</strong> Weekly snapshots capturing key market movements and price trends.
            </p>
            <p>
              <strong>Relevance:</strong> Aluminum is a critical material for automotive manufacturing, particularly for electric vehicles where weight reduction is essential for range optimization.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
