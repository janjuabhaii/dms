import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const UnauthorizedPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center gap-5"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <p className="font-display text-5xl font-bold tracking-tight text-foreground">403</p>
          <h1 className="mt-2 font-display text-lg font-semibold text-foreground">Access restricted</h1>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Your account doesn't have permission to view this page. If you think this is a
            mistake, contact your admin.
          </p>
        </div>
        <Button asChild>
          <Link to="/">
            <Home className="h-4 w-4" />
            Back home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
