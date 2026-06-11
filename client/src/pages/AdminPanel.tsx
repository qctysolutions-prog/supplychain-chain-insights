/**
 * Admin Panel - Subscription & Allowlist Management
 * Protected by admin password (stored in localStorage as a signed token)
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Trash2, Plus, Users, Shield, Clock, ArrowLeft, Loader2, Zap, Upload, FileText, AlertCircle, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

const ADMIN_TOKEN_KEY = "scbrief_admin_token";

type SubscriptionStatus = "pending" | "approved" | "denied";

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const config = {
    pending: { label: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" },
    approved: { label: "Approved", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    denied: { label: "Denied", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status] || config.pending;
  return <Badge className={`${className} text-xs font-medium`}>{label}</Badge>;
}

// ─── Password Login Screen ────────────────────────────────────────────────────
function AdminLoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const verifyMutation = trpc.adminAuth.verify.useMutation({
    onSuccess: (data) => {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      onLogin();
    },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError("Please enter the admin password."); return; }
    setError("");
    verifyMutation.mutate({ password });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm bg-slate-800 border-slate-700">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-white text-xl">Admin Panel</CardTitle>
          <p className="text-slate-400 text-sm mt-1">Enter the admin password to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/30 border border-red-800 rounded px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...</>
              ) : "Access Admin Panel"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
              onClick={() => navigate("/")}
            >
              ← Back to Brief
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking
  const [actionDialog, setActionDialog] = useState<{ type: "approve" | "deny"; id: number; name: string } | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [addEmail, setAddEmail] = useState({ email: "", name: "", notes: "" });
  const [addError, setAddError] = useState("");

  // CSV bulk import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<{ email: string; name: string; notes: string; valid: boolean; error?: string }[]>([]);
  const [csvImportResult, setCsvImportResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null);
  const [csvError, setCsvError] = useState("");

  const utils = trpc.useUtils();

  // Validate stored token on mount
  const storedToken = typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_KEY) || "" : "";
  const { data: tokenData, isLoading: tokenLoading } = trpc.adminAuth.validateToken.useQuery(
    { token: storedToken },
    { enabled: !!storedToken, retry: false }
  );

  useEffect(() => {
    if (!storedToken) {
      setIsAuthenticated(false);
      return;
    }
    if (tokenLoading) return;
    setIsAuthenticated(tokenData?.valid ?? false);
  }, [storedToken, tokenLoading, tokenData]);

  // Subscriptions
  const { data: subscriptions, isLoading: subsLoading } = trpc.subscription.getAll.useQuery(
    undefined,
    { enabled: isAuthenticated === true }
  );
  const approveMutation = trpc.subscription.approve.useMutation({
    onSuccess: () => { utils.subscription.getAll.invalidate(); setActionDialog(null); setActionNotes(""); },
  });
  const denyMutation = trpc.subscription.deny.useMutation({
    onSuccess: () => { utils.subscription.getAll.invalidate(); setActionDialog(null); setActionNotes(""); },
  });
  const deleteSubMutation = trpc.subscription.delete.useMutation({
    onSuccess: () => utils.subscription.getAll.invalidate(),
  });

  // Allowlist
  const { data: allowlist, isLoading: allowlistLoading } = trpc.allowlist.getAll.useQuery(
    undefined,
    { enabled: isAuthenticated === true }
  );
  const addAllowlistMutation = trpc.allowlist.add.useMutation({
    onSuccess: () => { utils.allowlist.getAll.invalidate(); setAddEmail({ email: "", name: "", notes: "" }); setAddError(""); },
    onError: (e) => setAddError(e.message),
  });
  const removeAllowlistMutation = trpc.allowlist.remove.useMutation({
    onSuccess: () => utils.allowlist.getAll.invalidate(),
  });
  const bulkImportMutation = trpc.allowlist.bulkImport.useMutation({
    onSuccess: (result) => {
      setCsvImportResult(result);
      setCsvFile(null);
      setCsvPreview([]);
      utils.allowlist.getAll.invalidate();
    },
    onError: (e) => setCsvError(e.message),
  });

  // Quick approve: approve subscription + add to allowlist in one click
  const quickApproveMutation = trpc.subscription.approve.useMutation({
    onSuccess: async (_data, variables) => {
      const sub = subscriptions?.find(s => s.id === variables.id);
      if (sub) {
        try {
          await addAllowlistMutation.mutateAsync({ email: sub.email, name: sub.name, notes: "Auto-added via Quick Approve" });
        } catch { /* allowlist add is best-effort */ }
      }
      utils.subscription.getAll.invalidate();
    },
  });

  // Automated updates (news / indices)
  const { data: updateHistory } = trpc.update.history.useQuery(undefined, {
    enabled: isAuthenticated === true,
    refetchInterval: 30000,
  });
  const [updateMessage, setUpdateMessage] = useState("");
  const runNewsMutation = trpc.update.runNews.useMutation({
    onSuccess: (r) => {
      setUpdateMessage(`News update complete: ${r.added} added, ${r.removed} removed.`);
      utils.update.history.invalidate();
    },
    onError: (e) => setUpdateMessage(`News update failed: ${e.message}`),
  });
  const runIndicesMutation = trpc.update.runIndices.useMutation({
    onSuccess: (r) => {
      setUpdateMessage(`Indices refreshed for ${r.date}. Fetched: ${r.fetched.length} series${r.missing.length ? `, missing: ${r.missing.join(", ")}` : ""}.`);
      utils.update.history.invalidate();
    },
    onError: (e) => setUpdateMessage(`Indices update failed: ${e.message}`),
  });

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAuthenticated(false);
  };

  // ── Loading / auth check ──────────────────────────────────────────────────
  if (isAuthenticated === null || (storedToken && tokenLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  // CSV parsing helper
  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return [];
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('email') || firstLine.includes('name');
    const dataLines = hasHeader ? lines.slice(1) : lines;
    return dataLines.filter(l => l.trim()).map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const email = cols[0] || '';
      const name = cols[1] || '';
      const notes = cols[2] || '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const valid = emailRegex.test(email);
      return { email, name, notes, valid, error: valid ? undefined : 'Invalid email format' };
    });
  };

  const handleCsvFile = (file: File) => {
    setCsvFile(file);
    setCsvImportResult(null);
    setCsvError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setCsvPreview(parsed);
    };
    reader.readAsText(file);
  };

  const pending = subscriptions?.filter(s => s.status === "pending") || [];
  const approved = subscriptions?.filter(s => s.status === "approved") || [];
  const denied = subscriptions?.filter(s => s.status === "denied") || [];

  const handleAction = () => {
    if (!actionDialog) return;
    if (actionDialog.type === "approve") {
      approveMutation.mutate({ id: actionDialog.id, notes: actionNotes });
    } else {
      denyMutation.mutate({ id: actionDialog.id, notes: actionNotes });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Brief
          </button>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex-1">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-slate-400 text-sm">Subscription & Access Management</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Pending Requests", value: pending.length, icon: <Clock className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50 border-amber-200" },
            { label: "Approved", value: approved.length, icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-50 border-emerald-200" },
            { label: "Denied", value: denied.length, icon: <XCircle className="w-5 h-5 text-red-500" />, bg: "bg-red-50 border-red-200" },
            { label: "Allowlist", value: allowlist?.length || 0, icon: <Shield className="w-5 h-5 text-blue-500" />, bg: "bg-blue-50 border-blue-200" },
          ].map((stat, i) => (
            <Card key={i} className={`border ${stat.bg}`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                  </div>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="mb-6">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Subscription Requests
              {pending.length > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pending.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="allowlist" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Email Allowlist
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Automation
            </TabsTrigger>
          </TabsList>

          {/* Subscription Requests Tab */}
          <TabsContent value="requests">
            {subsLoading ? (
              <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" /></div>
            ) : subscriptions?.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-slate-500">
                  No subscription requests yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {subscriptions?.map(sub => (
                  <Card key={sub.id} className="border border-slate-200">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800">{sub.name}</span>
                            <StatusBadge status={sub.status as SubscriptionStatus} />
                          </div>
                          <div className="text-sm text-slate-500 mt-0.5">{sub.email}</div>
                          {sub.organization && (
                            <div className="text-xs text-slate-400">{sub.organization}</div>
                          )}
                          {sub.reason && (
                            <div className="text-xs text-slate-400 mt-1 italic">"{sub.reason}"</div>
                          )}
                          <div className="text-xs text-slate-400 mt-1">
                            Requested: {new Date(sub.createdAt).toLocaleDateString()}
                            {sub.notes && ` · ${sub.notes}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {sub.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3"
                                onClick={() => quickApproveMutation.mutate({ id: sub.id, notes: "Quick approved" })}
                                disabled={quickApproveMutation.isPending}
                              >
                                <Zap className="w-3.5 h-3.5 mr-1" />
                                Quick Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-3"
                                onClick={() => setActionDialog({ type: "deny", id: sub.id, name: sub.name })}
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Deny
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs px-3"
                                onClick={() => setActionDialog({ type: "approve", id: sub.id, name: sub.name })}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Approve
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => deleteSubMutation.mutate({ id: sub.id })}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Allowlist Tab */}
          <TabsContent value="allowlist">
            {/* Add to allowlist form */}
            <Card className="mb-6 border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Email to Allowlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Email <span className="text-red-400">*</span></Label>
                    <Input
                      type="email"
                      placeholder="user@company.com"
                      value={addEmail.email}
                      onChange={e => setAddEmail(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Name</Label>
                    <Input
                      placeholder="Full name"
                      value={addEmail.name}
                      onChange={e => setAddEmail(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Notes</Label>
                    <Input
                      placeholder="Optional note"
                      value={addEmail.notes}
                      onChange={e => setAddEmail(f => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                </div>
                {addError && <p className="text-red-500 text-xs mt-2">{addError}</p>}
                <Button
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!addEmail.email || addAllowlistMutation.isPending}
                  onClick={() => addAllowlistMutation.mutate(addEmail)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {addAllowlistMutation.isPending ? "Adding..." : "Add to Allowlist"}
                </Button>
              </CardContent>
            </Card>

            {/* CSV Bulk Import */}
            <Card className="mb-6 border border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Bulk Import via CSV
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Upload a CSV file with columns: <code className="bg-slate-100 px-1 rounded">email, name (optional), notes (optional)</code>. First row can be a header.
                </p>
              </CardHeader>
              <CardContent>
                {/* File drop zone */}
                <label
                  className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleCsvFile(f); }}
                >
                  <FileText className="w-7 h-7 text-slate-400 mb-1" />
                  <span className="text-sm text-slate-500">{csvFile ? csvFile.name : 'Click or drag & drop a CSV file'}</span>
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); }} />
                </label>

                {/* Preview table */}
                {csvPreview.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        Preview: {csvPreview.length} rows ({csvPreview.filter(r => r.valid).length} valid, {csvPreview.filter(r => !r.valid).length} invalid)
                      </span>
                    </div>
                    <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="text-left px-3 py-2 text-slate-600 font-medium">Email</th>
                            <th className="text-left px-3 py-2 text-slate-600 font-medium">Name</th>
                            <th className="text-left px-3 py-2 text-slate-600 font-medium">Notes</th>
                            <th className="text-left px-3 py-2 text-slate-600 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.map((row, i) => (
                            <tr key={i} className={`border-t ${row.valid ? '' : 'bg-red-50'}`}>
                              <td className="px-3 py-1.5 text-slate-800">{row.email}</td>
                              <td className="px-3 py-1.5 text-slate-500">{row.name || '—'}</td>
                              <td className="px-3 py-1.5 text-slate-500">{row.notes || '—'}</td>
                              <td className="px-3 py-1.5">
                                {row.valid
                                  ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Valid</span>
                                  : <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {row.error}</span>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {csvError && <p className="text-red-500 text-xs mt-2">{csvError}</p>}
                    <Button
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={csvPreview.filter(r => r.valid).length === 0 || bulkImportMutation.isPending}
                      onClick={() => {
                        const validEntries = csvPreview.filter(r => r.valid);
                        bulkImportMutation.mutate({ entries: validEntries });
                      }}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      {bulkImportMutation.isPending ? 'Importing...' : `Import ${csvPreview.filter(r => r.valid).length} Valid Emails`}
                    </Button>
                  </div>
                )}

                {/* Import result summary */}
                {csvImportResult && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">Import Complete</span>
                    </div>
                    <p className="text-xs text-emerald-700">
                      {csvImportResult.added} email{csvImportResult.added !== 1 ? 's' : ''} added · {csvImportResult.skipped} duplicate{csvImportResult.skipped !== 1 ? 's' : ''} skipped
                    </p>
                    {csvImportResult.errors.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-red-600 font-medium">Errors:</p>
                        {csvImportResult.errors.map((e, i) => <p key={i} className="text-xs text-red-500">{e}</p>)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Allowlist */}
            {allowlistLoading ? (
              <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" /></div>
            ) : allowlist?.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center text-slate-500">
                  No emails in the allowlist yet. Add emails above to grant direct access.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {allowlist?.map(entry => (
                  <Card key={entry.id} className="border border-slate-200">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800 text-sm">{entry.email}</span>
                            {entry.name && <span className="text-slate-500 text-sm">({entry.name})</span>}
                          </div>
                          <div className="text-xs text-slate-400">
                            Added by {entry.addedBy} · {new Date(entry.createdAt).toLocaleDateString()}
                            {entry.notes && ` · ${entry.notes}`}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-red-500"
                          onClick={() => removeAllowlistMutation.mutate({ id: entry.id })}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation">
            <Card className="mb-6 border-violet-200 bg-violet-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Automated Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-4">
                  News runs automatically every Monday 06:00 UTC; indices refresh daily 07:00 UTC.
                  Use these buttons to trigger an update now.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => { setUpdateMessage(""); runNewsMutation.mutate({ token: storedToken }); }}
                    disabled={runNewsMutation.isPending || runIndicesMutation.isPending}
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {runNewsMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating news (1-3 min)...</>
                    ) : (
                      <>Run News Update</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setUpdateMessage(""); runIndicesMutation.mutate({ token: storedToken }); }}
                    disabled={runNewsMutation.isPending || runIndicesMutation.isPending}
                  >
                    {runIndicesMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Refreshing indices...</>
                    ) : (
                      <>Refresh Indices</>
                    )}
                  </Button>
                </div>
                {updateMessage && (
                  <div className="mt-4 text-sm text-slate-700 bg-white border border-slate-200 rounded-md p-3">
                    {updateMessage}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Runs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!updateHistory || updateHistory.length === 0 ? (
                  <p className="text-sm text-slate-500">No automated runs recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {updateHistory.map(log => (
                      <div key={log.id} className="flex items-center gap-3 text-sm border-b border-slate-100 pb-2">
                        <Badge className={
                          log.status === "success"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : log.status === "partial"
                              ? "bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-red-100 text-red-800 border-red-200"
                        }>
                          {log.status}
                        </Badge>
                        <span className="font-medium text-slate-700 capitalize">{log.jobType}</span>
                        <span className="text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Approve/Deny Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setActionNotes(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === "approve" ? "Approve" : "Deny"} Request
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === "approve"
                ? `Grant access to ${actionDialog?.name}?`
                : `Deny access request from ${actionDialog?.name}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Add a note for your records..."
              value={actionNotes}
              onChange={e => setActionNotes(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionDialog(null); setActionNotes(""); }}>
              Cancel
            </Button>
            <Button
              className={actionDialog?.type === "approve" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              onClick={handleAction}
              disabled={approveMutation.isPending || denyMutation.isPending}
            >
              {actionDialog?.type === "approve" ? "Approve Access" : "Deny Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
