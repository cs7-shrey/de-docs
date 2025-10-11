import { RefObject, useEffect, useRef } from "react";
import { flushSync } from "react-dom";

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
    const endOffset = range?.endOffset || 0;

    editableDivRef.current.textContent = value;

    try {
      const newRange = document.createRange();
      const textNode = editableDivRef.current.firstChild;
      if (textNode) {
        newRange.setStart(
          textNode,
          Math.min(startOffset, textNode.textContent?.length || 0)
        );
        //   newRange.setEnd(textNode, endOffset);
        newRange.collapse(true);

        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
    } finally {
    }
  }, [value, editableDivRef]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (isComposing.current) return;
    const newContent = e.currentTarget.textContent || "";
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
    if(!editableDivRef.current) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Insert \n at cursor position
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const start = range.startOffset;

      range.deleteContents();
      
      const currentContent = editableDivRef.current.textContent
      const afterStart = currentContent.slice(start) ?? '';

      const newContent = currentContent.slice(0, start) + '\n' + afterStart;

      editableDivRef.current.textContent = newContent;

      // const textNode = document.createTextNode('\n');
      // range.insertNode(textNode);
      
      // Move cursor after the \n
      const textNode = editableDivRef.current.firstChild;
      if(!textNode) return;

      range.setStart(textNode, start+1);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Trigger onChange
      flushSync(() => {
        onChange(newContent);
      });
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
        onCursorUpdate()
      }}
      onKeyUp={onCursorUpdate}
      className={`${className} whitespace-pre-wrap`}
      style={{ outline: "none", minHeight: "80vh" }}
    />
  );
};

export default EditableDiv;
