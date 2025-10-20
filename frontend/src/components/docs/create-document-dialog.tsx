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
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { AxiosError, isAxiosError } from "axios";
import CreateButton from "./create-button";

interface CreateDocumentDialogProps {
  onCreateDocument: (name: string) => Promise<string>;
}

export function CreateDocumentDialog({
  onCreateDocument,
}: CreateDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  const router = useRouter();

  const handleCreate = async () => {
    if (!docName.trim()) return;

    try {
      setCreating(true);
      const docId = await onCreateDocument(docName.trim());
      setDocName("");
      setOpen(false);

      router.push(`/docs/${docId}`);
    } catch (error) {
      let errMsg = "Failed to create document";
      if (isAxiosError(error)) {
        errMsg =
          (((error as AxiosError).response?.data as { message: string })
            .message as string) || errMsg;
      }

      setError(errMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="w-fit h-fit bg-transparent hover:bg-transparent p-0 m-0 border-none outline-none"
        >
        <CreateButton />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] bg-white rounded-2xl border-gray-200/80">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold">
            Create New Document
          </DialogTitle>
          <DialogDescription className="text-[15px] text-gray-500">
            Give your document a name. You can always change it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Input
            id="name"
            placeholder="Untitled document"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-11 bg-gray-50 border-gray-200/80 focus:bg-white focus:border-gray-300 rounded-lg"
          />
          {error && <div className="text-destructive text-sm mx-2">
            {error}
          </div>}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-10 px-5 rounded-lg border-gray-200/80 hover:bg-gray-50"
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!docName.trim() || creating}
            className="h-10 min-w-[4rem] bg-gray-600 hover:bg-gray-700 text-white rounded-lg disabled:opacity-50"
          >
            {!creating ? "Create" : <Loader2 className="animate-spin" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
