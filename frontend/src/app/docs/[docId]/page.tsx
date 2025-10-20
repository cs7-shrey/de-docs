"use client";
import CursorOverlay from "@/components/editor/Cursors";
import EditableDiv from "@/components/editor/EditableDiv";
import useCollaborativeEditor from "@/hooks/useCollaborativeEditor";
import { useParams } from "next/navigation";
import { useContext, useRef } from "react";
import { ChangeVisibilityDialog } from "@/components/docs/change-visibility-dialog";
import { authContext } from "@/context/useAuth";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="min-h-screen bg-[#d2d5d7]">
      {/* Header Section */}
      <div className="bg-[#f7fbff] border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {fetchingDoc ? (
                <Skeleton className="w-32 h-8 bg-neutral-200" />
              ) : (
                <h1 className="text-xl font-semibold text-neutral-600 px-2 truncate max-w-32">
                  {metadata?.name || "Untitled"}
                </h1>
              )}
            </div>
            <div className="flex items-center space-x-4 ml-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Visibility:</span>
                {fetchingDoc ? (
                  <Skeleton className="bg-blue-100 w-20 h-6 rounded-full" />
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {metadata?.visibility || "loading..."}
                  </span>
                )}
              </div>
              {(fetchingDoc || isFetchingUser) ? (
                <Skeleton className="h-8 bg-gray-400 w-20"/>
              ) : (metadata?.ownerId === user?.id && (
                <ChangeVisibilityDialog
                  visibility={metadata?.visibility}
                  changeVisibility={changeVisibility}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
