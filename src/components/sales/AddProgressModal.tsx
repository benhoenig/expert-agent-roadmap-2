import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KPIForm } from "./forms/KPIForm";
import { RequirementForm } from "./forms/RequirementForm";
import { Award, BookOpen } from "lucide-react";

type ProgressType = "kpi" | "requirement" | null;

interface AddProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProgressModal({ isOpen, onClose }: AddProgressModalProps) {
  const [progressType, setProgressType] = useState<ProgressType>(null);

  const handleClose = () => {
    setProgressType(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {progressType === null 
              ? "Add Progress" 
              : progressType === "kpi" 
                ? "Add KPI Progress" 
                : "Add Requirement Progress"}
          </DialogTitle>
        </DialogHeader>

        {progressType === null ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 border-2 hover:border-gold-500 hover:bg-gold-50"
              onClick={() => setProgressType("kpi")}
            >
              <Award size={36} className="mb-2 text-gold-500" />
              <span className="text-lg font-medium">KPI</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-32 border-2 hover:border-gold-500 hover:bg-gold-50"
              onClick={() => setProgressType("requirement")}
            >
              <BookOpen size={36} className="mb-2 text-gold-500" />
              <span className="text-lg font-medium">Requirement</span>
            </Button>
          </div>
        ) : progressType === "kpi" ? (
          <KPIForm onCancel={() => setProgressType(null)} onSubmit={handleClose} />
        ) : (
          <RequirementForm onCancel={() => setProgressType(null)} onSubmit={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
} 