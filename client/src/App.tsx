import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AluminumPricing from "./pages/AluminumPricing";
import TariffPolicyDashboard from "./pages/TariffPolicyDashboard";
import LandedCostDashboard from "./pages/LandedCostDashboard";
import MaterialsDashboard from "./pages/MaterialsDashboard";
import LogisticsDashboard from "./pages/LogisticsDashboard";
import SupplyChainChatbot from "./components/SupplyChainChatbot";
import RequestAccess from "./pages/RequestAccess";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import { AccessGate } from "./components/AccessGate";

function Router() {
  return (
    <Switch>
      {/* Public routes — no access gate */}
      <Route path="/login" component={Login} />
      <Route path="/request-access" component={RequestAccess} />
      <Route path="/admin" component={AdminPanel} />

      {/* Protected routes — wrapped in AccessGate */}
      <Route path="/">
        <AccessGate>
          <Home />
        </AccessGate>
      </Route>
      <Route path="/aluminum-pricing">
        <AccessGate>
          <AluminumPricing />
        </AccessGate>
      </Route>
      <Route path="/dashboard">
        <Redirect to="/dashboard/tariff-policy" />
      </Route>
      <Route path="/dashboard/tariff-policy">
        <AccessGate>
          <TariffPolicyDashboard />
        </AccessGate>
      </Route>
      <Route path="/dashboard/landed-cost">
        <AccessGate>
          <LandedCostDashboard />
        </AccessGate>
      </Route>
      <Route path="/dashboard/materials">
        <AccessGate>
          <MaterialsDashboard />
        </AccessGate>
      </Route>
      <Route path="/dashboard/logistics">
        <AccessGate>
          <LogisticsDashboard />
        </AccessGate>
      </Route>
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <SupplyChainChatbot />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
