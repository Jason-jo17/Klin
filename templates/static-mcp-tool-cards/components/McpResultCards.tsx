import type { ComponentType } from "react";
import { Card } from "@kiln/ui";
import { CircleAlert, CircleCheck, CircleDashed } from "lucide-react";

interface IssueListProps {
  issues: { id: string; title: string; assignee: string; priority: "high" | "medium" | "low" }[];
}

function IssueListCard({ issues }: IssueListProps) {
  const priorityColor = { high: "var(--kiln-error-500)", medium: "var(--kiln-warning-500)", low: "var(--kiln-text-tertiary)" };
  return (
    <Card>
      <h3 style={{ margin: "0 0 var(--kiln-space-4)" }}>Open issues</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--kiln-space-3)" }}>
        {issues.map((issue) => (
          <div key={issue.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--kiln-border)", paddingBottom: "var(--kiln-space-2)" }}>
            <div>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--kiln-text-tertiary)" }}>{issue.id}</p>
              <p style={{ margin: 0 }}>{issue.title}</p>
            </div>
            <span style={{ color: priorityColor[issue.priority], fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>
              {issue.priority}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface DeploymentStatusProps {
  service: string;
  state: string;
  version: string;
  deployedAt: string;
}

function DeploymentStatusCard({ service, state, version, deployedAt }: DeploymentStatusProps) {
  const StateIcon = state === "healthy" ? CircleCheck : state === "unknown" ? CircleDashed : CircleAlert;
  const stateColor = state === "healthy" ? "var(--kiln-success-500)" : state === "unknown" ? "var(--kiln-text-tertiary)" : "var(--kiln-error-500)";
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--kiln-space-3)" }}>
        <StateIcon size={20} color={stateColor} aria-hidden="true" />
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>{service}</p>
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--kiln-text-secondary)" }}>
            {version} · {state} · deployed {new Date(deployedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

const KIND_COMPONENTS: Record<string, ComponentType<any>> = {
  issue_list: IssueListCard,
  deployment_status: DeploymentStatusCard,
};

/** Maps an MCP tool's parsed JSON output (tagged with a `kind`) to a pre-built card. */
export function McpResultCard({ output }: { output: { kind: string } & Record<string, unknown> }) {
  const Component = KIND_COMPONENTS[output.kind];
  if (!Component) {
    return (
      <div role="alert" style={{ color: "var(--kiln-error-500)", fontSize: "0.8125rem" }}>
        No card registered for MCP result kind &quot;{output.kind}&quot;.
      </div>
    );
  }
  return <Component {...output} />;
}
