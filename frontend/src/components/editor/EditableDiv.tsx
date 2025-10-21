import { useLastStore } from "@/store/useLastStore";
import { RefObject, useEffect, useRef } from "react";

interface Props {
  value: string;
  disabled: boolean;
  className: string;
  editableDivRef: RefObject<HTMLDivElement | null>;
  getAbsoluteCursorPosition: (
    editableDivRef: RefObject<HTMLDivElement | null>
  ) => { start: number; end: number };
  onChange: (newContent: string) => void;
  onCursorUpdate: () => void;
}

const EditableDiv: React.FC<Props> = ({
  value,
  disabled,
  className,
  editableDivRef,
  getAbsoluteCursorPosition,
  onChange,
  onCursorUpdate,
}) => {
  const isComposing = useRef(false);

  /* Extra logic, because div doesn't support a value prop that can
    re-render with now content on value change, therefore this
    coordination is need. This also involves restoring cursor position
    after new content inserted (should be more nuanced upon arrival of
    content from other editors)
  */
  const restoreCursor = (startPosition: number, offset: number = 0) => {
    if(!editableDivRef.current) return;

    editableDivRef.current.normalize();

    try {
      const selection = window.getSelection();
      if (!selection) return;

      const textNode = editableDivRef.current.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const newRange = document.createRange();
        const safeOffset = Math.min(startPosition + offset, textNode.textContent?.length || 0);
        newRange.setStart(textNode, safeOffset);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } catch (e) {
      console.error('Cursor restore failed:', e);
    }
  }
  useEffect(() => {
    if (!editableDivRef.current || editableDivRef.current.textContent === value)
      return;

    const { start: absoluteCursorPos } = getAbsoluteCursorPosition(editableDivRef);

    const { lastOperationalStart, lastOperationalOffset, setLastOperationalStart, setLastOperationalOffset } = useLastStore.getState();

    const displayValue = value.replace(/\n$/, '\n\u200B');
    editableDivRef.current.textContent = displayValue;

    const offset = absoluteCursorPos >= lastOperationalStart
      ? lastOperationalOffset
      : 0;

    console.log(offset, lastOperationalStart, absoluteCursorPos);
    restoreCursor(absoluteCursorPos, offset);

    // Reset last operation info
    setLastOperationalStart(0);
    setLastOperationalOffset(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editableDivRef]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposing.current) return;
    // Strip zero-width space before sending
    const newContent = (e.currentTarget.textContent || "").replace(
      /\u200B/g,
      ""
    );
    onChange(newContent);
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    isComposing.current = false;
    handleInput(e);
  };

  const addNewLineOnEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!editableDivRef.current) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const { start: cursorPos } = getAbsoluteCursorPosition(editableDivRef);

      // Read current content, insert \n
      const currentContent = (editableDivRef.current.textContent || "").replace(
        /\u200B/g,
        ""
      );
      const newContent =
        currentContent.slice(0, cursorPos) +
        "\n" +
        currentContent.slice(cursorPos);

      // Update display with zero-width space for trailing \n
      const displayValue = newContent.replace(/\n$/, "\n\u200B");
      editableDivRef.current.textContent = displayValue;

      restoreCursor(cursorPos + 1);
      onChange(newContent);         // regular changes
    }
  };

  return (
    <div
      ref={editableDivRef}
      contentEditable={!disabled}
      suppressContentEditableWarning
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onInput={handleInput}
      onClick={onCursorUpdate}
      onKeyDown={(e) => {
        addNewLineOnEnter(e);
        onCursorUpdate();
      }}
      onKeyUp={onCursorUpdate}
      className={`${className} whitespace-pre-wrap`}
      style={{ outline: "none", minHeight: "80vh" }}
    />
  );
};

export default EditableDiv;
