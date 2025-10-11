"use client";

import CursorOverlay from "@/components/editor/Cursors";
import useCollaborativeEditor from "@/hooks/useCollaborativeEditor";
import { useRef, useState } from "react";

// diff calculation
// document versioning and session communication
// fetching document, connecting web socket
// cursor communication to sockets
// update cursor on keyboard input
// getting cursor coordinates function
// overlaying the cursor diffs on the text area element

export default function Home() {
  const [docId] = useState("dummy");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const {
    textContent,
    isConnecting,
    otherCursors,
    handleTextContentChange,
    handleCursorUpdate,
  } = useCollaborativeEditor(docId);

  // TODO: create a special hook for this coordination
  const updateCursor = () => {
    if (!textAreaRef.current) return;

    handleCursorUpdate(
      textAreaRef.current.selectionStart,
      textAreaRef.current.selectionEnd
    );
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!textAreaRef.current) return;

    const newContent = e.target.value;
    handleTextContentChange(
      newContent,
      textAreaRef.current.selectionStart,
      textAreaRef.current.selectionEnd
    );
  };

  return (
    <div className="relative m-8">
      <CursorOverlay
        otherCursors={otherCursors}
        textAreaRef={textAreaRef}
        textContent={textContent}
      >
        <textarea
          name=""
          id=""
          className="bg-white text-black h-[80vh] w-[70vw] p-4 whitespace-pre-wrap resize-none border-2 border-gray-300 rounded focus:outline-none focus:border-blue-500"
          value={textContent}
          ref={textAreaRef}
          onChange={onChange}
          onClick={updateCursor}
          onKeyDown={updateCursor}
          onKeyUp={updateCursor}
          onScroll={updateCursor}
          disabled={isConnecting}
        />
      </CursorOverlay>
    </div>
  );
}
