import type { CursorData, CursorDelete, Cursors } from "@/types";
import { RefObject, useState } from "react";

const useCursors = () => {
    const [otherCursors, setOtherCursors] = useState<Cursors>(() => new Map());
    const handleCursorData = (data: CursorData) => {
        setOtherCursors((prev) => {
            const next = new Map(prev);
            next.set(data.sessionId, {
                sessionId: data.sessionId,
                position: data.position,
                color: data.color,
            });
            return next;
        });
    }

    const handleCursorDelete = (data: CursorDelete) => {
        const sessionIdToDelete = data.sessionId;
        setOtherCursors((prev) => {
            const next = new Map(prev);
            next.delete(sessionIdToDelete);
            return next;
        });
    }

    const getAbsoluteCursorPosition = (
        editableDivRef: RefObject<HTMLDivElement | null>
    ): { start: number; end: number } => {
        if (!editableDivRef.current) return { start: 0, end: 0 };

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return { start: 0, end: 0 };

        const range = selection.getRangeAt(0);

        // Get start position
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editableDivRef.current);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        const start = preCaretRange.toString().length;

        // Get end position
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const end = preCaretRange.toString().length;

        return { start, end };
    };

    return {
        otherCursors, handleCursorData, handleCursorDelete, getAbsoluteCursorPosition
    } as const;
}

export default useCursors;
