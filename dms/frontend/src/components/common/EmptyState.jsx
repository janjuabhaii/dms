import { motion } from "framer-motion";

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center"
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
    {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);

export default EmptyState;
