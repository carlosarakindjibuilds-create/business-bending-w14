export const DEFAULT_ASSUMPTIONS = Object.freeze({
  sandboxAccounts: 40,
  conversionPercent: 20,
  tier2Profiles: 600,
  enterpriseClients: 2,
  tier3Profiles: 2500,
});

export const SCENARIO_STORAGE_KEY = "validator-trade-pricing-scenarios-v1";

export const PRESET_SCENARIOS = Object.freeze([
  {
    id: "preset-conservative",
    name: "Conservative Launch",
    simulated: true,
    assumptions: {
      sandboxAccounts: 20,
      conversionPercent: 10,
      tier2Profiles: 300,
      enterpriseClients: 1,
      tier3Profiles: 1500,
    },
  },
  {
    id: "preset-month-six",
    name: "Month 6 Base ($249k MXN)",
    simulated: true,
    assumptions: { ...DEFAULT_ASSUMPTIONS },
  },
  {
    id: "preset-regional",
    name: "Regional Scale",
    simulated: true,
    assumptions: {
      sandboxAccounts: 120,
      conversionPercent: 25,
      tier2Profiles: 1000,
      enterpriseClients: 5,
      tier3Profiles: 4000,
    },
  },
]);

export const ASSUMPTION_BOUNDS = Object.freeze({
  sandboxAccounts: [0, 200],
  conversionPercent: [5, 50],
  tier2Profiles: [100, 2000],
  enterpriseClients: [0, 20],
  tier3Profiles: [500, 10000],
});

const SAFE_SCENARIO_WORDS = new Set([
  "base",
  "conservative",
  "demo",
  "forecast",
  "growth",
  "launch",
  "model",
  "month",
  "regional",
  "scale",
  "scenario",
  "test",
]);

export function sanitizeScenarioName(value) {
  if (typeof value !== "string") {
    return { error: "Enter a scenario name using generic scenario terms." };
  }

  const cleaned = value
    .replace(/<[^>]*>/g, " ")
    .replace(/[^A-Za-z0-9\s_-]/g, " ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length > 40) {
    return { error: "Scenario names must contain 1–40 permitted characters." };
  }

  const words = cleaned.toLowerCase().split(" ");
  if (words.some((word) => !SAFE_SCENARIO_WORDS.has(word) && !/^\d+$/.test(word))) {
    return {
      error:
        "Use generic terms only (for example: Launch, Month 6 Base, or Regional Scale). Personal names and identifying details are not allowed.",
    };
  }

  return { name: cleaned };
}

export function validateAssumptions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const normalized = {};
  for (const [key, [min, max]] of Object.entries(ASSUMPTION_BOUNDS)) {
    const number = value[key];
    if (!Number.isInteger(number) || number < min || number > max) {
      return null;
    }
    normalized[key] = number;
  }
  return normalized;
}

export function calculateRevenue(assumptions) {
  const valid = validateAssumptions(assumptions);
  if (!valid) {
    throw new Error("Revenue assumptions are outside the allowed ranges.");
  }

  const convertedTier2Accounts = Math.floor(
    (valid.sandboxAccounts * valid.conversionPercent) / 100
  );
  const sandboxProfiles = valid.sandboxAccounts * 10;
  const tier2Profiles = convertedTier2Accounts * valid.tier2Profiles;
  const tier3Profiles = valid.enterpriseClients * valid.tier3Profiles;
  const totalProfiles = sandboxProfiles + tier2Profiles + tier3Profiles;
  const monthlyRevenue =
    tier2Profiles * 30 +
    valid.enterpriseClients * 15000 +
    tier3Profiles * 15;
  const monthlyCogs = totalProfiles * 2.875;
  const monthlyGrossProfit = monthlyRevenue - monthlyCogs;
  const grossMarginPercent =
    monthlyRevenue === 0 ? 0 : (monthlyGrossProfit / monthlyRevenue) * 100;

  return {
    convertedTier2Accounts,
    sandboxProfiles,
    tier2Profiles,
    tier3Profiles,
    totalProfiles,
    monthlyRevenue,
    monthlyCogs,
    monthlyGrossProfit,
    grossMarginPercent,
    annualProfiles: totalProfiles * 12,
    annualRevenue: monthlyRevenue * 12,
    annualCogs: monthlyCogs * 12,
    annualGrossProfit: monthlyGrossProfit * 12,
  };
}

export function parseSavedScenarios(serialized) {
  const parsed = JSON.parse(serialized);
  if (!Array.isArray(parsed)) {
    throw new Error("Saved scenarios have an invalid format.");
  }

  return parsed.map((scenario) => {
    const safeName = sanitizeScenarioName(scenario?.name);
    const assumptions = validateAssumptions(scenario?.assumptions);
    if (!safeName.name || !assumptions || typeof scenario.id !== "string") {
      throw new Error("A saved scenario is invalid; clear or repair local storage.");
    }
    return { id: scenario.id, name: safeName.name, assumptions };
  });
}
