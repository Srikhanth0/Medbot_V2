import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EventModal({ isOpen, onClose }: EventModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add Reminder" description="Schedule a new health reminder.">
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#11222C]">Event Title</label>
          <Input placeholder="E.g. Take Medication" className="bg-white text-black border-gray-300" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#11222C]">Date</label>
            <Input type="date" className="bg-white text-black border-gray-300" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#11222C]">Time</label>
            <Input type="time" className="bg-white text-black border-gray-300" />
          </div>
        </div>
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} className="bg-white border">Cancel</Button>
          <Button variant="primary">Save Event</Button>
        </div>
      </div>
    </Dialog>
  );
}
