import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Storefront from "./pages/Storefront";
import VehicleDetails from "./pages/VehicleDetails";
import ProjectPresentation from "./pages/ProjectPresentation";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import AdminDashboard from "./pages/admin/Dashboard";
import VehiclesCRUDPage from "./pages/admin/VehiclesCRUD";
import StoreSettingsPage from "./pages/admin/StoreSettings";
import DealershipDashboard from "./pages/admin/DealershipDashboard";
import SaaSAdmin from "./pages/admin/SaaSAdmin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
    <Route path="/auth/signin" component={SignIn} />
    <Route path="/auth/signup" component={SignUp} />
    <Route path="/auth/reset" component={ResetPassword} />
    <Route path="/auth/verify" component={VerifyEmail} />
      <Route path="/" component={Storefront} />
      <Route path="/vehicle/:id" component={VehicleDetails} />
      <Route path="/presentation" component={ProjectPresentation} />
      <Route path="/admin" component={DealershipDashboard} />
      <Route path="/admin/vehicles" component={VehiclesCRUDPage} />
      <Route path="/admin/store" component={StoreSettingsPage} />
      <Route path="/admin/saas" component={SaaSAdmin} />
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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
