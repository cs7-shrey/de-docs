"use client";

import CursorOverlay from "@/components/editor/Cursors";
import useDiffCalculator from "@/hooks/useDiffCalculator";
import useDocSocket from "@/hooks/useDocSocket";
import { getContent } from "@/lib/api-client";
import { Cursors, Operation } from "@/types";
import { useEffect, useRef, useState } from "react";
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

  const [docId] = useState("dummy")
	const [otherCursors, setOtherCursors] = useState<Cursors>(() => new Map());

	const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // TODO: move the send changes and doc versioning out of diff calculator
	const {
		isConnecting,
		error: socketConnectionError,
		socketRef,
	} = useDocSocket({ sessionId, setOtherCursors, docId, setVersionId, setTextContent });

  const sendChanges = (operations: Operation[], versionId: number) => {
    if(!socketRef.current) return;
    
    socketRef.current.send(JSON.stringify({
      type: "operations",
      operations,
      sessionId,
      docVersionId: versionId,
    }))
  }
	const {
    diffCalculator,
	} = useDiffCalculator({ sendChanges });

	useEffect(() => {
		const fetchContent = async () => {
			const data = await getContent(docId);
			setTextContent(data.content);
			setVersionId(data.version);

			diffCalculator.updateState({
				content: data.content,
				start: 0,
				end: 0,
			});
		};
		fetchContent();
	}, [setVersionId, diffCalculator, docId]);

  // TODO: create a special hook for this coordination
	const updateCursor = () => {
		if (!textAreaRef.current) return;

		diffCalculator.updateCursor(
			textAreaRef.current.selectionStart,
			textAreaRef.current.selectionEnd
		);

		socketRef.current?.send(
			JSON.stringify({
				position: textAreaRef.current.selectionStart,
        type: "cursorPosition"
			})
		);
	};

  console.log(versionId);


	const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newContent = e.target.value;
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
