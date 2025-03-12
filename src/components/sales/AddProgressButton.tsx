import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddProgressModal } from "./AddProgressModal";

export function AddProgressButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gold-500 hover:bg-gold-600 text-white shadow-lg z-50"
        onClick={() => setIsModalOpen(true)}
        aria-label="Add Progress"
      >
        <Plus size={24} />
      </Button>
      
      <AddProgressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
} 