import { motion } from "framer-motion";

/**
 * Consistent placeholder for a page whose real content lands in a later
 * phase, so navigating the sidebar always shows something intentional
 * rather than a blank screen.
 */
const ComingSoonState = ({ icon: Icon, phase, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center"
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <p className="mt-4 text-sm font-medium text-foreground">{description}</p>
    <p className="mt-1 text-xs text-muted-foreground">Built in {phase}</p>
  </motion.div>
);

export default ComingSoonState;
