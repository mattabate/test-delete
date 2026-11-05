import { createRoot } from "react-dom/client";
import { Section } from "./components/section.jsx";
import { WarehouseKpis } from "./components/warehouse-kpis.jsx";
import { UsageTrend } from "./components/usage-trend.jsx";
import { LiveUsage } from "./components/live-usage.jsx";
import { VisitsPanel } from "./components/visits-panel.jsx";

function App() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <div className="ana-kicker">[ qa persistent app ]</div>
        <h1 className="mt-2 text-lg font-semibold text-gray-900">Warehouse and usage health</h1>
        <p className="text-sm text-gray-500">Warehouse categories, platform usage, and this app's own visit log.</p>
      </header>
      <Section>
        <div className="ana-kicker">[ ch.01 · warehouse ]</div>
        <div className="mt-4">
          <WarehouseKpis />
        </div>
      </Section>
      <div className="ana-gutter" />
      <Section>
        <div className="ana-kicker">[ ch.02 · usage ]</div>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageTrend />
          <LiveUsage />
        </div>
      </Section>
      <div className="ana-gutter" />
      <Section>
        <div className="ana-kicker">[ ch.03 · visit log ]</div>
        <div className="mt-4">
          <VisitsPanel />
        </div>
      </Section>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
