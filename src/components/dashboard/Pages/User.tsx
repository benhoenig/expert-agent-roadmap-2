
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function UserDashboard() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your account.
            </p>
          </div>
          <Button className="bg-gold-500 hover:bg-gold-600 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
