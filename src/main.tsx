import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouterProvider } from "@/app/providers/router-provider";
import "@/app/styles/globals.css";
import "@/app/styles/account-backgrounds.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { initializeTheme, queryClient, ThemeProvider } from "./app/providers";

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
