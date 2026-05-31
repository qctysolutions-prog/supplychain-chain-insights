/**
 * Request Access Page
 * Public page where users can request access to the Supply Chain Brief
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Lock, TrendingUp, BarChart2, Globe } from "lucide-react";

type RequestStatus = "idle" | "submitting" | "submitted" | "already_pending" | "already_approved" | "resubmitted" | "error";

export default function RequestAccess() {
  const [form, setForm] = useState({ email: "", name: "", organization: "", reason: "" });
  const [status, setStatus] = useState<RequestStatus>("idle");
  const [message, setMessage] = useState("");

  const requestMutation = trpc.subscription.request.useMutation({
    onSuccess: (data) => {
      setStatus(data.status as RequestStatus);
      setMessage(data.message);
    },
    onError: (err) => {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name) return;
    setStatus("submitting");
    requestMutation.mutate(form);
  };

  const isSuccess = ["submitted", "already_pending", "already_approved", "resubmitted"].includes(status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="py-8 px-6 text-center">
        <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
          Mobility & Auto Supply Chain Brief
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Request Access
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          This briefing is available to authorized subscribers only. Submit your request below and we'll review it promptly.
        </p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: Features */}
          <div className="space-y-6 pt-4">
            <div className="text-slate-300 text-sm uppercase tracking-wider font-semibold mb-4">
              What you'll get access to
            </div>
            {[
              {
                icon: <TrendingUp className="w-5 h-5 text-blue-400" />,
                title: "Weekly Supply Chain Brief",
                desc: "Curated news across 6 categories: tariffs, logistics, materials, risk, supplier relations, and sustainability.",
              },
              {
                icon: <BarChart2 className="w-5 h-5 text-emerald-400" />,
                title: "Economic Indices Dashboard",
                desc: "Live tracking of TPU, BLS Import Price Index, HRC Steel, LME Aluminum, CME Copper, diesel, and freight indices.",
              },
              {
                icon: <Globe className="w-5 h-5 text-purple-400" />,
                title: "AI Supply Chain Assistant",
                desc: "Ask questions about tariffs, materials pricing, logistics trends, and more — powered by DeepSeek-V3.",
              },
              {
                icon: <Lock className="w-5 h-5 text-amber-400" />,
                title: "Aluminum Pricing Index",
                desc: "Historical LME aluminum pricing with trend analysis and 6-month forecasting.",
              },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex-shrink-0 mt-0.5">{feature.icon}</div>
                <div>
                  <div className="text-white font-semibold text-sm">{feature.title}</div>
                  <div className="text-slate-400 text-sm mt-1">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Form */}
          <div>
            {isSuccess ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-10 pb-10 text-center">
                  {status === "already_approved" ? (
                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  ) : (
                    <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  )}
                  <h2 className="text-xl font-bold text-white mb-2">
                    {status === "already_approved" ? "You already have access!" : "Request Received"}
                  </h2>
                  <p className="text-slate-400 mb-6">{message}</p>
                  {status === "already_approved" && (
                    <Button
                      className="bg-slate-700 hover:bg-slate-600 text-white"
                      onClick={() => window.location.href = "/"}
                    >
                      Go to the Brief
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Request Access</CardTitle>
                  <CardDescription className="text-slate-400">
                    Fill in your details below. Access requests are typically reviewed within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">Full Name <span className="text-red-400">*</span></Label>
                      <Input
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                        placeholder="Jane Smith"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">Email Address <span className="text-red-400">*</span></Label>
                      <Input
                        type="email"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                        placeholder="jane@company.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">Organization</Label>
                      <Input
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                        placeholder="Company or Institution"
                        value={form.organization}
                        onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">Why do you need access?</Label>
                      <Textarea
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                        placeholder="Briefly describe your role and how you'll use this briefing..."
                        rows={3}
                        value={form.reason}
                        onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                      />
                    </div>

                    {status === "error" && (
                      <p className="text-red-400 text-sm">{message}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={status === "submitting" || !form.email || !form.name}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      {status === "submitting" ? "Submitting..." : "Submit Request"}
                    </Button>

                    <p className="text-slate-500 text-xs text-center">
                      Already have access?{" "}
                      <a href="/" className="text-blue-400 hover:underline">
                        Sign in here
                      </a>
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
