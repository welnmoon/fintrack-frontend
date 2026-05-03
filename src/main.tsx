import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouterProvider } from "@/app/providers/router-provider";
import "@/app/styles/globals.css";
import "@/app/styles/account-backgrounds.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { initializeTheme, queryClient, ThemeProvider } from "./app/providers";
import { fintrackDb } from "./shared/lib/db/fintrack-db";

initializeTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouterProvider />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);

fintrackDb
  .open()
  .then(async () => {
    console.log("IndexedDB fintrack-db opened");
  })
  .catch((error) => {
    console.error("Failed to open IndexedDB fintrack-db", error);
  });
