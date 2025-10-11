import type { CursorData, Cursors } from "@/types";
import { useState } from "react";


const useCursors = () => {
    const [otherCursors, setOtherCursors] = useState<Cursors>(() => new Map());
    const handleCursorData = (data: CursorData) => {
        console.log(data);
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

    return {
        otherCursors, handleCursorData
    } as const;
}

export default useCursors;
