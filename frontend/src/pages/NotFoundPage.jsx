import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center gap-5"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Compass className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="font-display text-5xl font-bold tracking-tight text-foreground">404</p>
          <h1 className="mt-2 font-display text-lg font-semibold text-foreground">Page not found</h1>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4" />
              Back home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
