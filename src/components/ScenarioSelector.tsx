"use client";

import { SCENARIOS, Scenario } from "@/lib/types";

interface ScenarioSelectorProps {
  selected: Scenario;
  onSelect: (scenario: Scenario) => void;
}

export function ScenarioSelector({
  selected,
  onSelect,
}: ScenarioSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {SCENARIOS.map((scenario) => (
        <button
          key={scenario.id}
          onClick={() => onSelect(scenario)}
          className={`p-3 rounded-xl border-2 transition-all text-left ${
            selected.id === scenario.id
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
          }`}
        >
          <span className="text-2xl">{scenario.icon}</span>
          <p className="font-medium text-sm mt-1 text-gray-900 dark:text-white">
            {scenario.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {scenario.description}
          </p>
        </button>
      ))}
    </div>
  );
}
