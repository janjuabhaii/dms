import { Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import ComingSoonState from "@/components/common/ComingSoonState";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/common/ThemeToggle";

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Settings" subtitle="Your account details and preferences." />

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Read-only for now — editing lands in a later phase.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={user?.name || ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value={user?.role || ""} readOnly className="capitalize" />
          </div>
          <div className="space-y-2">
            <Label>Appearance</Label>
            <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
              <ThemeToggle />
              Toggle dark / light mode
            </div>
          </div>
        </CardContent>
      </Card>

      <ComingSoonState icon={SettingsIcon} phase="a later phase" description="Business settings, users & permissions" />
    </div>
  );
};

export default SettingsPage;
