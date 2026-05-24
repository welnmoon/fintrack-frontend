import PriceChart from "@/widgets/dashboard/forex-chart/ui/forex-chart";

export function ForexPage() {
  return (
    <div
      className="-mx-4 -my-6 overflow-hidden sm:-mx-6 lg:-mx-8 lg:-my-8"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <PriceChart
        variant="page"
        showChartTypeControl
        showExtendedMeta
      />
    </div>
  );
}
