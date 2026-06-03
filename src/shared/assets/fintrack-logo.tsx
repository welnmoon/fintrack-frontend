export function FintrackLogo({
  isMobileSidebarOpen,
}: {
  isMobileSidebarOpen: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      {/* <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent"> */}
      {!isMobileSidebarOpen && <img src="/logo.png" className="w-1/2" />}
      {isMobileSidebarOpen && <img src="/logo-icon.png" className="w-1/2" />}
      {/* </span> */}
      {/* <div className="leading-tight">
        <p className="text-sm font-semibold tracking-wide">{APP_NAME}</p>
        <p className="text-xs text-muted-foreground">Personal finance</p>
      </div> */}
    </div>
  );
}
