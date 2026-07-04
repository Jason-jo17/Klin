import { Tabs, TabList, Tab } from "@kiln/ui";
import { STRATEGY_META, type Strategy } from "@kiln/schema";

export type StrategyFilter = Strategy | "all";

export function StrategyFilterTabs({ value, onChange }: { value: StrategyFilter; onChange: (v: StrategyFilter) => void }) {
  return (
    <Tabs value={value} onChange={(v) => onChange(v as StrategyFilter)}>
      <TabList>
        <Tab value="all">All</Tab>
        {(Object.keys(STRATEGY_META) as Strategy[]).map((strategy) => (
          <Tab key={strategy} value={strategy}>
            {STRATEGY_META[strategy].label}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
}
