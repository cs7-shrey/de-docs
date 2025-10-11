import { Cursors } from "@/types";
import React, { ReactElement, RefObject, useRef } from "react";

type Props = {
	children: ReactElement<
		React.TextareaHTMLAttributes<HTMLTextAreaElement>,
		"textarea"
	>;
    otherCursors: Cursors;
    textAreaRef: RefObject<HTMLTextAreaElement | null> | RefObject<HTMLDivElement | null>;
    textContent: string;
};

const CursorOverlay: React.FC<Props> = ({ children, otherCursors, textAreaRef, textContent }) => {
	const hiddenDivRef = useRef<HTMLDivElement>(null);
	const getCursorCoordinates = (position: number) => {
		if (!hiddenDivRef.current || !textAreaRef.current)
			return { top: 0, left: 0 };

		const textArea = textAreaRef.current;
		const hiddenDiv = hiddenDivRef.current;

		// Copy textarea styles to hidden div
		const style = window.getComputedStyle(textArea);
		hiddenDiv.style.font = style.font;
		hiddenDiv.style.fontSize = style.fontSize;
		hiddenDiv.style.fontFamily = style.fontFamily;
		hiddenDiv.style.lineHeight = style.lineHeight;
		hiddenDiv.style.padding = style.padding;
		hiddenDiv.style.margin = style.margin;
		hiddenDiv.style.border = style.border;
		hiddenDiv.style.width = style.width;
		hiddenDiv.style.height = style.height;
		hiddenDiv.style.wordWrap = style.wordWrap;
		hiddenDiv.style.whiteSpace = style.whiteSpace;

		// Set content up to cursor position
		const textBeforeCursor = textContent.substring(0, position);
		hiddenDiv.textContent = textBeforeCursor;

		// Add a span to measure cursor position
		const span = document.createElement("span");
		span.textContent = "|";
		hiddenDiv.appendChild(span);

		const spanRect = span.getBoundingClientRect();
		const textAreaRect = textArea.getBoundingClientRect();

		return {
			top: spanRect.top - textAreaRect.top + textArea.scrollTop,
			left: spanRect.left - textAreaRect.left + textArea.scrollLeft,
		};
	};
	return (
		<div className="relative inline-block w-full">
			{children}
			{/* Hidden div for calculating cursor positions */}
			<div
				ref={hiddenDivRef}
				className="absolute top-0 left-0 invisible whitespace-pre-wrap"
				style={{ pointerEvents: "none" }}
			/>

			{/* Render other users' cursors */}
			{Array.from(otherCursors.values()).map((cursor) => {
				const coords = getCursorCoordinates(cursor.position);
				return (
					<div
						key={cursor.sessionId}
						className="absolute pointer-events-none transition-all duration-100"
						style={{
							top: `${coords.top}px`,
							left: `${coords.left}px`,
						}}
					>
						{/* Cursor line */}
						<div
							className="w-0.5 h-5 animate-pulse"
							style={{ backgroundColor: cursor.color }}
						/>
						{/* User label */}
						{/* <div
            className="absolute top-0 left-1 px-2 py-0.5 rounded text-white text-xs whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
            >
            {cursor.name}
            </div> */}
					</div>
				);
			})}
		</div>
	);
};

export default CursorOverlay;
