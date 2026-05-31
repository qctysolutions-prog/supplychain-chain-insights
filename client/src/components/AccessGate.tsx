/**
 * AccessGate - Email-based access control (no OAuth/login required)
 *
 * Flow:
 * 1. Check localStorage for a previously verified email
 * 2. If found, verify it's still authorized via API
 * 3. If not found, show email entry form
 * 4. If email is authorized → grant access (save to localStorage)
 * 5. If email is not authorized → show request access form
 * 6. Admin users (logged in via OAuth) always pass through
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Loader2, Clock, CheckCircle, TrendingUp, BarChart2, Globe, Mail } from "lucide-react";

const ACCESS_EMAIL_KEY = "scbrief_access_email";

interface AccessGateProps {
  children: React.ReactNode;
}

type GateState = "loading" | "checking" | "authorized" | "email_entry" | "requesting" | "pending" | "denied";

export function AccessGate({ children }: AccessGateProps) {
  const { user } = useAuth();
  const [gateState, setGateState] = useState<GateState>("loading");
  const [emailInput, setEmailInput] = useState("");
  const [form, setForm] = useState({ name: "", organization: "", reason: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const requestMutation = trpc.subscription.request.useMutation({
    onSuccess: () => setRequestSent(true),
    onError: (err: { message?: string }) => setErrorMsg(err.message || "Something went wrong."),
  });

  // On mount: check if admin is logged in, or if we have a saved email
  useEffect(() => {
    // Admin always gets through
    if (user?.role === "admin") {
      setGateState("authorized");
      return;
    }

    // Check saved email in localStorage
    const savedEmail = localStorage.getItem(ACCESS_EMAIL_KEY);
    if (savedEmail) {
      setEmailInput(savedEmail);
      setGateState("checking");
    } else {
      setGateState("email_entry");
    }
  }, [user]);

  // When gateState becomes "checking", trigger the access check
  const { data: accessData, isLoading: accessLoading } = trpc.subscription.checkAccess.useQuery(
    { email: emailInput },
    {
      enabled: gateState === "checking" && emailInput.length > 0,
      retry: false,
    }
  );

  // React to access check result
  useEffect(() => {
    if (gateState !== "checking" || accessLoading || !accessData) return;
    if (accessData.authorized) {
      localStorage.setItem(ACCESS_EMAIL_KEY, emailInput);
      setGateState("authorized");
    } else {
      localStorage.removeItem(ACCESS_EMAIL_KEY);
      setGateState("email_entry");
    }
  }, [accessData, accessLoading, gateState, emailInput]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg("");
    setGateState("checking");
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      setErrorMsg("Please enter your name.");
      return;
    }
    setErrorMsg("");
    requestMutation.mutate({
      email: emailInput,
      name: form.name,
      organization: form.organization,
      reason: form.reason,
    });
  };

  // Loading state
  if (gateState === "loading" || (gateState === "checking" && accessLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-400 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Authorized
  if (gateState === "authorized") {
    return <>{children}</>;
  }

  // Request sent confirmation
  if (requestSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700">
          <CardContent className="pt-10 pb-10 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Request Submitted</h2>
            <p className="text-slate-400 mb-2">
              Thank you, your request has been received.
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Once approved, return to this page and enter your email <span className="text-slate-300 font-medium">{emailInput}</span> to gain instant access.
            </p>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => { setRequestSent(false); setGateState("email_entry"); setEmailInput(""); }}
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email entry screen (initial gate)
  if (gateState === "email_entry" || gateState === "checking") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <header className="py-8 px-6 text-center">
          <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
            Mobility & Auto Supply Chain Brief
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Subscriber Access
          </h1>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Enter your authorized email address to access the briefing.
          </p>
        </header>

        <main className="flex-1 flex items-start justify-center px-4 pb-16">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Features */}
            <div className="space-y-4 pt-4">
              <div className="text-slate-300 text-sm uppercase tracking-wider font-semibold mb-2">
                What's inside
              </div>
              {[
                { icon: <TrendingUp className="w-5 h-5 text-blue-400" />, title: "Weekly Supply Chain Brief", desc: "Curated news across tariffs, logistics, materials, risk, supplier relations, and sustainability." },
                { icon: <BarChart2 className="w-5 h-5 text-emerald-400" />, title: "Economic Indices Dashboard", desc: "Live tracking of TPU, BLS, HRC Steel, LME Aluminum, CME Copper, diesel, and freight indices." },
                { icon: <Globe className="w-5 h-5 text-purple-400" />, title: "AI Supply Chain Assistant", desc: "Ask questions about tariffs, materials pricing, and logistics — powered by DeepSeek-V3." },
                { icon: <Lock className="w-5 h-5 text-amber-400" />, title: "Aluminum Pricing Index", desc: "Historical LME aluminum pricing with trend analysis and 6-month forecasting." },
              ].map((f, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="flex-shrink-0 mt-0.5">{f.icon}</div>
                  <div>
                    <div className="text-white font-semibold text-sm">{f.title}</div>
                    <div className="text-slate-400 text-sm mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Email form */}
            <div className="flex flex-col gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-400" />
                    Enter Your Email
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    If your email is on the authorized list, you'll get instant access.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300">Email Address</Label>
                      <Input
                        type="email"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                        placeholder="you@company.com"
                        value={emailInput}
                        onChange={e => { setEmailInput(e.target.value); setErrorMsg(""); }}
                        required
                        autoFocus
                      />
                    </div>
                    {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
                    {gateState === "checking" && !accessLoading && accessData && !accessData.authorized && (
                      <p className="text-amber-400 text-sm">
                        This email is not on the authorized list. You can request access below.
                      </p>
                    )}
                    <Button
                      type="submit"
                      disabled={gateState === "checking" && accessLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      {gateState === "checking" && accessLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Checking...</>
                      ) : "Access the Brief"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Request access card */}
              <Card className="bg-slate-800/60 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Don't have access yet?
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm">
                    Submit a request and you'll be notified once approved.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRequestSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">Full Name <span className="text-red-400">*</span></Label>
                      <Input
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 h-9 text-sm"
                        placeholder="Jane Smith"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">Email <span className="text-red-400">*</span></Label>
                      <Input
                        type="email"
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 h-9 text-sm"
                        placeholder="you@company.com"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">Organization</Label>
                      <Input
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 h-9 text-sm"
                        placeholder="Company or Institution"
                        value={form.organization}
                        onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-sm">Reason for access</Label>
                      <Textarea
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 resize-none text-sm"
                        placeholder="Briefly describe your role..."
                        rows={2}
                        value={form.reason}
                        onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                      />
                    </div>
                    {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
                    <Button
                      type="submit"
                      disabled={requestMutation.isPending || !form.name || !emailInput}
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-sm"
                    >
                      {requestMutation.isPending ? "Submitting..." : "Submit Access Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Fallback
  return <>{children}</>;
}
