"use client"
import CursorOverlay from "@/components/editor/Cursors";
import EditableDiv from "@/components/editor/EditableDiv"
import useCollaborativeEditor from "@/hooks/useCollaborativeEditor";
import { useParams } from "next/navigation";
import { useRef } from "react"

export default function Temp() {
  const editableDivRef = useRef<HTMLDivElement>(null);
  const docId = String(useParams().docId);
  
  const {
    textContent,
    otherCursors,
    handleTextContentChange,
    handleCursorUpdate,
    getAbsoluteCursorPosition
  } = useCollaborativeEditor(docId);

  const updateCursor = () => {
    if (!editableDivRef.current) return;

    const position = getCursorPosition();
    handleCursorUpdate(
        position.start,
        position.end
    );
  };

  const getCursorPosition = () => {
    return getAbsoluteCursorPosition(editableDivRef);
  }

    return(
        <div className="m-4">
            <CursorOverlay
                otherCursors={otherCursors}
                textAreaRef={editableDivRef}
                textContent={textContent}
            >
                <EditableDiv
                    value={textContent}
                    disabled={false}
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
            </CursorOverlay>
        </div>
    )
}