// Design system reminder: Shared Satisium UI grammar — neutral structural surfaces, primary orange, rounded modules and explicit navigation routes. Route content loads progressively without changing its readable structure.

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const Showcase = lazy(() => import("@/pages/Showcase"));
const Services = lazy(() => import("@/pages/Services"));
const Journal = lazy(() => import("@/pages/Journal"));
const Contact = lazy(() => import("@/pages/Contact"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageFallback() {
  return (
    <main aria-live="polite" className="min-h-screen bg-muted p-3 sm:p-5">
      <div className="h-[70vh] rounded-[1.4rem] bg-background" />
    </main>
  );
}

const routerBase =
  import.meta.env.BASE_URL === "/"
    ? ""
    : import.meta.env.BASE_URL.replace(/\/$/, "");

function LumenRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/showcase" component={Showcase} />
        <Route path="/work" component={Showcase} />
        <Route path="/services" component={Services} />
        <Route path="/journal" component={Journal} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router base={routerBase}>
            <LumenRoutes />
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
