import { RefObject, useEffect, useRef } from "react";

interface Props {
  value: string;
  disabled: boolean;
  className: string;
  editableDivRef: RefObject<HTMLDivElement | null>;
  onChange: (newContent: string) => void;
  onCursorUpdate: () => void;
}

const EditableDiv: React.FC<Props> = ({
  value,
  disabled,
  className,
  editableDivRef,
  onChange,
  onCursorUpdate,
}) => {
  const isComposing = useRef(false);

  useEffect(() => {
    if (!editableDivRef.current || editableDivRef.current.textContent === value)
      return;

    const selection = window.getSelection();
    const range =
      selection?.rangeCount && selection?.rangeCount > 0
        ? selection.getRangeAt(0)
        : null;
    const startOffset = range?.startOffset || 0;

    // ✅ Add zero-width space for trailing newlines
    const displayValue = value.replace(/\n$/, '\n\u200B');
    editableDivRef.current.textContent = displayValue;

    try {
      const newRange = document.createRange();
      const textNode = editableDivRef.current.firstChild;
      if (textNode) {
        const safeOffset = Math.min(startOffset, textNode.textContent?.length || 0);
        newRange.setStart(textNode, safeOffset);
        newRange.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
    } catch (e) {
      console.error('Cursor restore failed:', e);
    }
  }, [value, editableDivRef]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposing.current) return;
    // ✅ Strip zero-width space before sending
    const newContent = (e.currentTarget.textContent || '').replace(/\u200B/g, '');
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

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const cursorPos = range.startOffset;

      // ✅ Read current content, insert \n
      const currentContent = (editableDivRef.current.textContent || '').replace(/\u200B/g, '');
      const newContent = 
        currentContent.slice(0, cursorPos) + 
        '\n' + 
        currentContent.slice(cursorPos);

      // ✅ Update display with zero-width space for trailing \n
      const displayValue = newContent.replace(/\n$/, '\n\u200B');
      editableDivRef.current.textContent = displayValue;

      // ✅ Restore cursor after the \n
      try {
        const textNode = editableDivRef.current.firstChild;
        if (textNode) {
          const newRange = document.createRange();
          const newPos = Math.min(cursorPos + 1, textNode.textContent?.length || 0);
          newRange.setStart(textNode, newPos);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (e) {
        console.error('Cursor positioning failed:', e);
      }

      // ✅ Trigger onChange (without zero-width space)
      onChange(newContent);
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