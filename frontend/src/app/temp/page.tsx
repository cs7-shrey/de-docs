"use client"
import CursorOverlay from "@/components/editor/Cursors";
import EditableDiv from "@/components/editor/EditableDiv"
import useCollaborativeEditor from "@/hooks/useCollaborativeEditor";
import { useRef, useState } from "react"

export default function Temp() {
  const editableDivRef = useRef<HTMLDivElement>(null);
  const [docId] = useState("dummy");

  const {
    textContent,
    otherCursors,
    handleTextContentChange,
    handleCursorUpdate,
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
    const selection = window.getSelection();
    const range = (selection?.rangeCount && selection?.rangeCount > 0) ? selection.getRangeAt(0) : null;
    const startOffset = range?.startOffset || 0;
    const endOffset = range?.endOffset || 0;

    return {
        start: startOffset,
        end: endOffset,
    }
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