import Card, { CardHeader } from "../components/ui/Card.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader title="Settings" description="Placeholder for account and quiz configuration." />
      <div className="p-5">
        <EmptyState
          title="Settings are intentionally minimal"
          description="This screen exists to complete the navigation pattern without adding fake complexity."
        />
      </div>
    </Card>
  );
}
