import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Capsule } from "./backend";
import { BackendHealthBanner } from "./components/BackendHealthBanner";
import { DomainVerification } from "./components/DomainVerification";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { useBackendHealth } from "./hooks/useQueries";
import { performHealthCheck } from "./lib/healthCheck";
import { checkAndNotifyReminders } from "./lib/reminders";
import { CapsuleViewPage } from "./pages/CapsuleViewPage";
import { ClaimCodeReceiptPage } from "./pages/ClaimCodeReceiptPage";
import { CreateCapsulePage } from "./pages/CreateCapsulePage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { HomePage } from "./pages/HomePage";
import { MyCapsules } from "./pages/MyCapsules";
import { OpenCapsulePage } from "./pages/OpenCapsulePage";
import { SafetyPrivacyPage } from "./pages/SafetyPrivacyPage";
import { SecurityPage } from "./pages/SecurityPage";
import { VerifyCapsulePage } from "./pages/VerifyCapsulePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export type Page =
  | { type: "home" }
  | { type: "create"; capsuleType?: "love" | "prediction" }
  | { type: "receipt"; capsule: Capsule }
  | { type: "open" }
  | { type: "view"; capsule: Capsule }
  | { type: "my-capsules" }
  | { type: "safety-privacy" }
  | { type: "security" }
  | { type: "verify" }
  | { type: "feedback" };

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>({ type: "home" });
  const { data: isHealthy, isLoading: isHealthCheckLoading } =
    useBackendHealth();

  useEffect(() => {
    console.log("[DIAGNOSTIC] App mounted, running initial health check...");
    performHealthCheck().then((result) => {
      console.log("[DIAGNOSTIC] Initial health check results:", result);
      if (result.errors.length > 0) {
        console.error(
          "[DIAGNOSTIC] Health check errors detected:",
          result.errors,
        );
      }
    });

    checkAndNotifyReminders();
    const interval = setInterval(checkAndNotifyReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (currentPage.type) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "create":
        return (
          <CreateCapsulePage
            onNavigate={setCurrentPage}
            initialType={currentPage.capsuleType}
          />
        );
      case "receipt":
        return (
          <ClaimCodeReceiptPage
            capsule={currentPage.capsule}
            onNavigate={setCurrentPage}
          />
        );
      case "open":
        return <OpenCapsulePage onNavigate={setCurrentPage} />;
      case "view":
        return (
          <CapsuleViewPage
            capsule={currentPage.capsule}
            onNavigate={setCurrentPage}
          />
        );
      case "my-capsules":
        return <MyCapsules onNavigate={setCurrentPage} />;
      case "safety-privacy":
        return <SafetyPrivacyPage onNavigate={setCurrentPage} />;
      case "security":
        return <SecurityPage onNavigate={setCurrentPage} />;
      case "verify":
        return <VerifyCapsulePage onNavigate={setCurrentPage} />;
      case "feedback":
        return <FeedbackPage onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DomainVerification />
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      <BackendHealthBanner
        isHealthy={isHealthy}
        isLoading={isHealthCheckLoading}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={setCurrentPage} />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
