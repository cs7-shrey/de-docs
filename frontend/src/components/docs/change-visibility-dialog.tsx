"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Visibility } from "@/types";

interface ChangeVisibilityDialogProps {
  visibility: Visibility | undefined;
  changeVisibility: (visibility: Visibility) => Promise<void>;
}

export function ChangeVisibilityDialog({
  visibility,
  changeVisibility,
}: ChangeVisibilityDialogProps) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleConfirm = async () => {
    try {
      setUpdating(true);
      await changeVisibility(visibility === "public" ? "private" : "public");
      setOpen(false);
    } catch (error) {
      console.error("Error updating visibility", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          // size="sm"
          className="text-white bg-[#1e293b] rounded-full text-sm px-5 py-2.5hover:bg-[#334155] border border-[#3b4a63] shadow-sm hover:shadow-md transition-all duration-200"
        >
          {visibility === "public" ? (
            <div className="flex">
              Stop Share
            </div>
          ) : (
            <div className="flex">
              Share
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>
            {visibility === "public" ? "Stop" : "Start"} sharing the document?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={updating}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
