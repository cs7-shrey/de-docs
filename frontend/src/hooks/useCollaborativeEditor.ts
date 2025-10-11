import useCursors from "@/hooks/useCursors";
import useDiffCalculator from "@/hooks/useDiffCalculator";
import useDocContent from "@/hooks/useDocContent";
import useDocSocket from "@/hooks/useDocSocket";
import { performOperations } from "@/lib/operations";
import { OperationsData } from "@/types";
import { useCallback, useState } from "react";
import { v4 as uuid4 } from "uuid";

const useCollaborativeEditor = (docId: string) => {
  const [textContent, setTextContent] = useState("");
  const [versionId, setVersionId] = useState(0);
  const [sessionId] = useState(() => uuid4());

  const handleOperationsData = (data: OperationsData) => {
    if (data.senderSessionId !== sessionId) {
      const operations = data.operations;

      setTextContent((content) => {
        const newContent = performOperations(operations, content);

        diffCalculator.updateState({
          ...diffCalculator.state,
          content: newContent,
        });

        return newContent;
      });

      // TODO: move cursor appropriately and set content in diff-calculator
    }
    setVersionId(data.versionId);
  };

  const { otherCursors, handleCursorData } = useCursors();
  const {
    isConnecting,
    error: socketConnectionError,
    socketRef,
    sendChanges,
  } = useDocSocket({
    sessionId,
    docId,
    handleCursorData,
    handleOperationsData,
  });

  const { diffCalculator } = useDiffCalculator({ sendChanges });

  const onContentData = useCallback(
    (content: string, version: number) => {
      setTextContent(content);
      setVersionId(version);

      diffCalculator.updateState({
        content: content,
        start: 0,
        end: 0,
      });
    },
    [setTextContent, setVersionId, diffCalculator]
  );
  useDocContent({
    docId,
    onContentData,
  });

  return {
    textContent,
    isConnecting,
    otherCursors,
    handleCursorUpdate: (selectionStart: number, selectionEnd: number) => {
      diffCalculator.updateCursor(selectionStart, selectionEnd);

      // TODO: debounce this
      socketRef.current?.send(
        JSON.stringify({
          position: selectionStart,
          type: "cursorPosition",
        })
      );
    },

    handleTextContentChange: (
      newContent: string,
      selectionStart: number,
      selectionEnd: number
    ) => {
      setTextContent(newContent);

      diffCalculator.captureChangeWithDebounce(
        {
          content: newContent,
          start: selectionStart,
          end: selectionEnd,
        },
        versionId
      );
    },

  };
};

export default useCollaborativeEditor;
