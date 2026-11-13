import { useEffect, useRef, useState } from "react";
import {
  ASSUMPTION_BOUNDS,
  calculateRevenue,
  DEFAULT_ASSUMPTIONS,
  parseSavedScenarios,
  PRESET_SCENARIOS,
  sanitizeScenarioName,
  SCENARIO_STORAGE_KEY,
  validateAssumptions,
} from "../utils/pricingModel.js";

const CURRENCY = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const NUMBER = new Intl.NumberFormat("en-US");

const CONTROLS = [
  {
    key: "sandboxAccounts",
    label: "Tier 1 Sandbox accounts",
    min: 0,
    max: 200,
    step: 1,
  },
  {
    key: "conversionPercent",
    label: "Sandbox-to-paid conversion rate",
    min: 5,
    max: 50,
    step: 1,
    suffix: "%",
  },
  {
    key: "tier2Profiles",
    label: "Average monthly profiles per Tier 2 distributor",
    min: 100,
    max: 2000,
    step: 50,
  },
  {
    key: "enterpriseClients",
    label: "Tier 3 Enterprise clients",
    min: 0,
    max: 20,
    step: 1,
  },
  {
    key: "tier3Profiles",
    label: "Average monthly profiles per Tier 3 client",
    min: 500,
    max: 10000,
    step: 100,
  },
];

function formatCurrency(value) {
  return `$${CURRENCY.format(Math.round(value))} MXN`;
}

function KpiCard({ label, monthly, annual, percent = false }) {
  const display = (value) =>
    percent ? `${value.toFixed(2)}%` : formatCurrency(value);

  return (
    <article className="kpi-card">
      <h3>{label}</h3>
      <p className="kpi-value">{display(monthly)}</p>
      <p className="kpi-period">Monthly</p>
      <p className="kpi-annual">{percent ? "Annualized margin" : display(annual)}</p>
      <p className="kpi-period">Annual</p>
    </article>
  );
}

export default function PricingPage() {
  const [assumptions, setAssumptions] = useState({ ...DEFAULT_ASSUMPTIONS });
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioError, setScenarioError] = useState("");
  const [storageError, setStorageError] = useState("");
  const scenarioCounter = useRef(0);
  const revenue = calculateRevenue(assumptions);

  useEffect(() => {
    try {
      const serialized = window.localStorage.getItem(SCENARIO_STORAGE_KEY);
      if (serialized) {
        const parsed = parseSavedScenarios(serialized);
        setSavedScenarios(parsed.scenarios);
        if (parsed.rejectedCount > 0) {
          window.localStorage.setItem(
            SCENARIO_STORAGE_KEY,
            JSON.stringify(parsed.scenarios)
          );
          setStorageError(
            `${parsed.rejectedCount} invalid or identifying scenario(s) were removed from this browser.`
          );
        }
      }
    } catch (error) {
      try {
        window.localStorage.removeItem(SCENARIO_STORAGE_KEY);
        setSavedScenarios([]);
        setStorageError(
          `Invalid saved scenarios were cleared from this browser. ${
            error instanceof Error ? error.message : "The stored data was invalid."
          }`
        );
      } catch (cleanupError) {
        setStorageError(
          `Saved scenarios could not be validated or removed. ${
            cleanupError instanceof Error
              ? cleanupError.message
              : "Clear this app's local storage manually."
          }`
        );
      }
    }
  }, []);

  const updateAssumption = (key, value) => {
    const [min, max] = ASSUMPTION_BOUNDS[key];
    if (!Number.isFinite(value)) {
      return;
    }
    const boundedValue = Math.min(max, Math.max(min, Math.trunc(value)));
    setAssumptions((current) => ({ ...current, [key]: boundedValue }));
  };

  const storeScenarios = (nextScenarios) => {
    try {
      window.localStorage.setItem(
        SCENARIO_STORAGE_KEY,
        JSON.stringify(nextScenarios)
      );
      setSavedScenarios(nextScenarios);
      setStorageError("");
      return true;
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `Scenarios could not be saved: ${error.message}`
          : "Scenarios could not be saved in this browser."
      );
      return false;
    }
  };

  const saveScenario = (event) => {
    event.preventDefault();
    const safeName = sanitizeScenarioName(scenarioName);
    if (!safeName.name) {
      setScenarioError(safeName.error);
      return;
    }
    const validAssumptions = validateAssumptions(assumptions);
    if (!validAssumptions) {
      setScenarioError("Simulator values are invalid. Reset the sliders and retry.");
      return;
    }

    scenarioCounter.current += 1;
    const nextScenarios = [
      ...savedScenarios,
      {
        id: `saved-${Date.now()}-${scenarioCounter.current}`,
        name: safeName.name,
        assumptions: validAssumptions,
      },
    ];
    if (storeScenarios(nextScenarios)) {
      setScenarioName("");
      setScenarioError("");
    }
  };

  const loadScenario = (scenario) => {
    const validAssumptions = validateAssumptions(scenario.assumptions);
    if (!validAssumptions) {
      setStorageError("This scenario contains invalid values and cannot be loaded.");
      return;
    }
    setAssumptions(validAssumptions);
    setScenarioError("");
  };

  const deleteScenario = (scenarioId) => {
    storeScenarios(savedScenarios.filter((scenario) => scenario.id !== scenarioId));
  };

  const scenariosForComparison = [
    ...PRESET_SCENARIOS,
    ...savedScenarios,
  ].map((scenario) => ({
    ...scenario,
    revenue: calculateRevenue(scenario.assumptions),
  }));

  return (
    <main className="content-shell pricing-page">
      <section className="page-heading">
        <p className="eyebrow">Validator of the Trade · Pricing</p>
        <h1>Pricing: The Number That Tells the Truth</h1>
        <p className="intro">
          Two customer segments, three clear tiers, and a transparent model for
          the economics behind verified cash-flow profiles.
        </p>
      </section>

      <section aria-labelledby="plans-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Two customer segments · three tiers</p>
            <h2 id="plans-heading">Plans and pricing</h2>
          </div>
          <p className="free-paid-key"><span>FREE</span> sandbox · <span>PAID</span> commercial and enterprise</p>
        </div>
        <div className="tier-grid">
          <article className="tier-card">
            <p className="tier-label">Tier 1 · FREE</p>
            <h3>Developer Sandbox</h3>
            <p className="tier-price">$0 MXN <span>/ month</span></p>
            <p>Up to 10 test profiles/month using verified historical profiles from another region.</p>
            <ul>
              <li>Corporate RFC required.</li>
              <li>Route-overlap blocking.</li>
              <li>Anonymized JSON only.</li>
            </ul>
          </article>
          <article className="tier-card tier-card--featured">
            <p className="tier-label">Tier 2 · PAY PER PROFILE</p>
            <h3>Commercial Distributor</h3>
            <p className="tier-price">$30 MXN <span>/ validated profile</span></p>
            <p>For FMCG distributors and wholesale <em>fiado</em> operations.</p>
            <ul>
              <li>Live webhook bridge with ERP `Client #ID`.</li>
              <li>Dual-loop Llama-3.1-70B; stated 95% accuracy SLA.</li>
              <li>Automatic WhatsApp recovery after 90 seconds.</li>
              <li>Masked output: `approval_status`, `credit_cap_mxn`, `confidence_score`.</li>
            </ul>
          </article>
          <article className="tier-card">
            <p className="tier-label">Tier 3 · ENTERPRISE</p>
            <h3>Enterprise SLA</h3>
            <p className="tier-price">$15,000 MXN <span>/ month + $15 MXN/profile</span></p>
            <p>For micro-insurers and high-volume financial institutions.</p>
            <ul>
              <li>Unlimited volume and priority queue.</li>
              <li>LFPDPPP audit logs.</li>
              <li>Automatic purge of raw audio and telemetry after 24 hours.</li>
            </ul>
          </article>
        </div>
        <p className="disclaimer">
          Service levels and integrations describe the proposed offer; live ERP,
          WhatsApp, and model services are not implemented by this simulator.
        </p>
      </section>

      <section className="simulator-section" aria-labelledby="simulator-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Change an assumption and see the impact</p>
            <h2 id="simulator-heading">Revenue Simulator</h2>
          </div>
          <span className="simulation-badge">SIMULATED DATA</span>
        </div>

        <div className="simulator-layout">
          <div className="simulator-controls">
            {CONTROLS.map((control) => (
              <label className="slider-control" key={control.key}>
                <span className="slider-label">{control.label}</span>
                <span className="slider-value">
                  {NUMBER.format(assumptions[control.key])}
                  {control.suffix || ""}
                </span>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={assumptions[control.key]}
                  onChange={(event) =>
                    updateAssumption(control.key, Number(event.target.value))
                  }
                  aria-label={control.label}
                />
                <span className="slider-bounds">
                  <span>{NUMBER.format(control.min)}{control.suffix || ""}</span>
                  <span>{NUMBER.format(control.max)}{control.suffix || ""}</span>
                </span>
              </label>
            ))}

            <aside className="cogs-note">
              <h3>Transparent unit-cost assumptions</h3>
              <p>Base COGS: $2.50 MXN/profile</p>
              <ul>
                <li>$0.65 WhatsApp API</li>
                <li>$0.50 Whisper</li>
                <li>$1.10 Llama-3.1-70B</li>
                <li>$0.25 storage/webhooks</li>
              </ul>
              <p>
                Plus 15% for retries: $2.50 × 1.15 = <strong>$2.875 MXN combined COGS/profile</strong>.
              </p>
            </aside>
          </div>

          <div className="kpi-panel">
            <h3>Monthly and annual projection</h3>
            <p className="profile-total">
              {NUMBER.format(revenue.totalProfiles)} total profiles / month
            </p>
            <div className="kpi-grid">
              <KpiCard label="Gross revenue" monthly={revenue.monthlyRevenue} annual={revenue.annualRevenue} />
              <KpiCard label="COGS" monthly={revenue.monthlyCogs} annual={revenue.annualCogs} />
              <KpiCard label="Net gross profit" monthly={revenue.monthlyGrossProfit} annual={revenue.annualGrossProfit} />
              <KpiCard label="Gross margin" monthly={revenue.grossMarginPercent} annual={revenue.grossMarginPercent} percent />
            </div>
            <p className="calculation-note">
              Tier 1 sandbox profiles are free; converted accounts are modeled
              as Tier 2 customers. Gross profit is revenue minus modeled COGS.
            </p>
          </div>
        </div>
      </section>

      <section className="scenario-section" aria-labelledby="scenarios-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">This browser only · no accounts or personal data</p>
            <h2 id="scenarios-heading">Saved Scenarios</h2>
          </div>
          <span className="simulation-badge">SIMULATED DATA</span>
        </div>
        <p className="scenario-privacy">
          Scenarios contain only the five simulator assumptions and a generic
          scenario label. Personal names, contact details, account identifiers,
          and merchant data are rejected. Nothing is sent to a server.
        </p>
        <form className="scenario-form" onSubmit={saveScenario}>
          <label htmlFor="scenario-name">Scenario name (up to 40 characters)</label>
          <div className="scenario-form-row">
            <input
              id="scenario-name"
              type="text"
              maxLength={40}
              value={scenarioName}
              onChange={(event) => {
                setScenarioName(event.target.value);
                setScenarioError("");
              }}
              placeholder="e.g. Regional Scale"
              aria-describedby="scenario-name-help"
            />
            <button type="submit" className="primary-action">Save current assumptions</button>
          </div>
          <p id="scenario-name-help" className="field-help">
            Generic labels only: Scenario, Launch, Base, Month, Regional,
          Scale, Conservative, Demo, Forecast, Growth, Model, or Test
          (month numbers 1–12 only).
          HTML, special characters, and personal identifiers are not allowed.
          </p>
          {scenarioError && <p className="error-message" role="alert">{scenarioError}</p>}
          {storageError && <p className="error-message" role="alert">{storageError}</p>}
        </form>

        <div className="scenario-list">
          {PRESET_SCENARIOS.map((scenario) => (
            <article className="scenario-row" key={scenario.id}>
              <div>
                <strong>{scenario.name}</strong>
                <span className="simulation-badge">SIMULATED DATA</span>
              </div>
              <button type="button" className="secondary-action" onClick={() => loadScenario(scenario)}>
                Load
              </button>
            </article>
          ))}
          {savedScenarios.map((scenario) => (
            <article className="scenario-row" key={scenario.id}>
              <div>
                <strong>{scenario.name}</strong>
                <span className="simulation-badge">SIMULATED DATA</span>
              </div>
              <div className="scenario-actions">
                <button type="button" className="secondary-action" onClick={() => loadScenario(scenario)}>
                  Load
                </button>
                <button type="button" className="delete-action" onClick={() => deleteScenario(scenario.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="comparison-section">
          <h3>Side-by-side comparison</h3>
          <div className="comparison-scroll" role="region" aria-label="Scenario comparison table" tabIndex={0}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th scope="col">Scenario · simulated</th>
                  <th scope="col">Accounts / conversion</th>
                  <th scope="col">Tier 2 profiles</th>
                  <th scope="col">Enterprise / profiles</th>
                  <th scope="col">Profiles / month</th>
                  <th scope="col">Revenue / month</th>
                  <th scope="col">Gross profit / month</th>
                  <th scope="col">Margin</th>
                </tr>
              </thead>
              <tbody>
                {scenariosForComparison.map((scenario) => (
                  <tr key={scenario.id}>
                    <th scope="row">{scenario.name}</th>
                    <td>{scenario.assumptions.sandboxAccounts} / {scenario.assumptions.conversionPercent}%</td>
                    <td>{NUMBER.format(scenario.revenue.tier2Profiles)}</td>
                    <td>{scenario.assumptions.enterpriseClients} / {NUMBER.format(scenario.revenue.tier3Profiles)}</td>
                    <td>{NUMBER.format(scenario.revenue.totalProfiles)}</td>
                    <td>{formatCurrency(scenario.revenue.monthlyRevenue)}</td>
                    <td>{formatCurrency(scenario.revenue.monthlyGrossProfit)}</td>
                    <td>{scenario.revenue.grossMarginPercent.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
