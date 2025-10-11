"use client";

import CursorOverlay from "@/components/editor/Cursors";
import useCursors from "@/hooks/useCursors";
import useDiffCalculator from "@/hooks/useDiffCalculator";
import useDocContent from "@/hooks/useDocContent";
import useDocSocket from "@/hooks/useDocSocket";
import { performOperations } from "@/lib/operations";
import { OperationsData } from "@/types";
import { useCallback, useRef, useState } from "react";
import { v4 as uuid4 } from "uuid";

// diff calculation
// document versioning and session communication
// fetching document, connecting web socket
// cursor communication to sockets
// update cursor on keyboard input
// getting cursor coordinates function
// overlaying the cursor diffs on the text area element

export default function Home() {
  const [textContent, setTextContent] = useState("");
  const [sessionId] = useState(() => uuid4());
  const [versionId, setVersionId] = useState(0);
  const [docId] = useState("dummy");

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleOperationsData = (data: OperationsData) => {
      if(data.senderSessionId !== sessionId) {
          const operations = data.operations;

          setTextContent((content) => {
            const newContent = performOperations(operations, content);

            diffCalculator.updateState({
              ...diffCalculator.state,
              content: newContent
            })

            return newContent;
          });

          // TODO: move cursor appropriately and set content in diff-calculator

          console.log(diffCalculator.state)
      }
      setVersionId(data.versionId);
  }

  const { otherCursors, handleCursorData } = useCursors();
  const {
    isConnecting,
    error: socketConnectionError,
    socketRef, sendChanges,
  } = useDocSocket({
    sessionId,
    docId,
    handleCursorData,
    handleOperationsData
  });

  const { diffCalculator } = useDiffCalculator({ sendChanges });

  const onContentData = useCallback((content: string, version: number) => {
    setTextContent(content);
    setVersionId(version);

    diffCalculator.updateState({
      content: content,
      start: 0,
      end: 0,
    });
  }, [setTextContent, setVersionId, diffCalculator]);
  useDocContent({ 
    docId, 
    onContentData
  });

  // TODO: create a special hook for this coordination
  const updateCursor = () => {
    if (!textAreaRef.current) return;

    diffCalculator.updateCursor(
      textAreaRef.current.selectionStart,
      textAreaRef.current.selectionEnd
    );

    // TODO: debounce this
    socketRef.current?.send(
      JSON.stringify({
        position: textAreaRef.current.selectionStart,
        type: "cursorPosition",
      })
    );
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    console.log(newContent);
    setTextContent(newContent);

    if (!textAreaRef.current) return;

    diffCalculator.captureChangeWithDebounce(
      {
        content: newContent,
        start: textAreaRef.current.selectionStart,
        end: textAreaRef.current.selectionEnd,
      },
      versionId
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
