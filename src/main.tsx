import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouterProvider } from "@/app/providers/router-provider";
import "@/app/styles/globals.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouterProvider />
    </QueryClientProvider>
  </StrictMode>,
);
