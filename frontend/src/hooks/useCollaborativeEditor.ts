import useCursors from "@/hooks/useCursors";
import useDiffCalculator from "@/hooks/useDiffCalculator";
import useDocContent from "@/hooks/useDocContent";
import useDocSocket from "@/hooks/useDocSocket";
import { updateVisibility } from "@/lib/api-client";
import { performOperations } from "@/lib/operations";
import { useLastStore } from "@/store/useLastStore";
import { DocMetaData, OperationsData, Visibility } from "@/types";
import { useCallback, useState } from "react";
import { v4 as uuid4 } from "uuid";
import Debouncer from "@/lib/debouncer";

const useCollaborativeEditor = (docId: string) => {
  const [textContent, setTextContent] = useState("");
  const [versionId, setVersionId] = useState(0);
  const [sessionId] = useState(() => uuid4());

  const [metadata, setMetadata] = useState<DocMetaData | null>(null);
  const [cursorDebouncer] = useState(() => new Debouncer(550));

  const handleOperationsData = (data: OperationsData) => {
    if (data.senderSessionId !== sessionId) {
      const operations = data.operations;

      setTextContent((content) => {
        const { content: newContent, operationalStart, operationalOffset } = performOperations(operations, content);
        const { setLastOperationalOffset, setLastOperationalStart } = useLastStore.getState();

        setLastOperationalStart(operationalStart);
        setLastOperationalOffset(operationalOffset);

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

  const { otherCursors, handleCursorData, handleCursorDelete, getAbsoluteCursorPosition } = useCursors();
  const {
    isConnecting,
    socketRef,
    sendChanges,
  } = useDocSocket({
    sessionId,
    docId,
    handleCursorData,
    handleCursorDelete,
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
  const {fetching: fetchingDoc} = useDocContent({
    docId,
    onContentData,
    setMetadata,
  });

  return {
    textContent,
    isConnecting,
    otherCursors,
    metadata,
    fetchingDoc,
    canEdit: socketRef.current?.readyState === WebSocket.OPEN,
    getAbsoluteCursorPosition,

    handleCursorUpdate: (selectionStart: number, selectionEnd: number) => {
      diffCalculator.updateCursor(selectionStart, selectionEnd);

      // TODO: debounce this
      // socketRef.current?.send(
      //   JSON.stringify({
      //     position: selectionStart,
      //     type: "cursorPosition",
      //   })
      // );

      cursorDebouncer.debounce(() => {
        socketRef.current?.send(
          JSON.stringify({
            position: selectionStart,
            type: "cursorPosition",
          })
        );
      });
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

    changeVisibility: async (visibility: Visibility) => {
      await updateVisibility(docId, visibility);
      setMetadata((prev) => {
        if(!prev) return null;

        return {...prev, visibility};
      })
    },
  };
};

export default useCollaborativeEditor;
