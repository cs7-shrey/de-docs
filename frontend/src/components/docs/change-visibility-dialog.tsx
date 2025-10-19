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
import { Cross, Globe, Lock } from "lucide-react";
import { Visibility } from "@/types";

interface ChangeVisibilityDialogProps {
  visibility: Visibility;
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

  console.log(visibility);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-2 text-black bg-[#c2cad0] hover:bg-[#253557] hover:text-white"
        >
          {visibility === "public" ? (
            <div className="flex">
              <Cross /> Stop Share
            </div>
          ) : (
            <div className="flex">
              <Lock /> Share
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
