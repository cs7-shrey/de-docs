"use client";
import CursorOverlay from "@/components/editor/Cursors";
import EditableDiv from "@/components/editor/EditableDiv";
import useCollaborativeEditor from "@/hooks/useCollaborativeEditor";
import { useParams } from "next/navigation";
import { useContext, useRef } from "react";
import { ChangeVisibilityDialog } from "@/components/docs/change-visibility-dialog";
import { authContext } from "@/context/useAuth";
import { FileText, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Logo from "@/components/home/logo";

export default function Page() {
  const editableDivRef = useRef<HTMLDivElement>(null);
  const docId = String(useParams().docId);

  const { user, isFetching: isFetchingUser } = useContext(authContext);

  const {
    textContent,
    otherCursors,
    metadata,
    fetchingDoc,
    canEdit,
    handleTextContentChange,
    handleCursorUpdate,
    getAbsoluteCursorPosition,
    changeVisibility,
  } = useCollaborativeEditor(docId);

  const updateCursor = () => {
    if (!editableDivRef.current) return;

    const position = getCursorPosition();
    handleCursorUpdate(position.start, position.end);
  };

  const getCursorPosition = () => {
    return getAbsoluteCursorPosition(editableDivRef);
  };

  return (
    <div className="min-h-screen bg-[#e3e4e8]">
      {/* Header Section */}
      <div className="bg-[#fefefe] border-b border-gray-200 sticky shadow-sm top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {fetchingDoc ? (
                <Skeleton className="w-32 h-8 bg-neutral-200" />
              ) : (
                <div className="flex items-center">
                  <Link href="/docs">
                    <Logo />
                  </Link>
                  <h1 className="text-lg sm:text-xl tracking-tight font-semibold text-neutral-600 px-2 truncate max-w-[65%] md:max-w-[50%] lg:max-w-[30%]">
                    {metadata?.name || "Untitled"}
                  </h1>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 mr-4">
              <div className="flex items-center space-x-2">
                {fetchingDoc ? (
                  <Skeleton className="hidden xs:block bg-gray-400 w-20 h-6 rounded-full" />
                ) : (
                  <span className="hidden xs:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 capitalize">
                    {metadata?.visibility || "loading..."}
                  </span>
                )}
              </div>
              {fetchingDoc || isFetchingUser ? (
                <Skeleton className="h-8 bg-blue-100 w-20" />
              ) : (
                metadata?.ownerId === user?.id && (
                  <ChangeVisibilityDialog
                    visibility={metadata?.visibility}
                    changeVisibility={changeVisibility}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={cn(
            "bg-white border-1 shadow-sm rounded-lg overflow-hidden",
            "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
          )}
        >
          <div className="p-8">
            <CursorOverlay
              otherCursors={otherCursors}
              textAreaRef={editableDivRef}
              textContent={textContent}
            >
              {!fetchingDoc ? (
                <EditableDiv
                  value={textContent}
                  disabled={!canEdit || fetchingDoc}
                  editableDivRef={editableDivRef}
                  className="bg-white text-black p-4 min-w-[90%]"
                  getAbsoluteCursorPosition={getAbsoluteCursorPosition}
                  onChange={(newContent: string) => {
                    const position = getCursorPosition();
                    handleTextContentChange(
                      newContent,
                      position.start,
                      position.end
                    );
                  }}
                  onCursorUpdate={updateCursor}
                />
              ) : (
                <div className="min-h-[70vh] flex items-center justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              )}
            </CursorOverlay>
          </div>
        </div>
      </div>
    </div>
  );
}
