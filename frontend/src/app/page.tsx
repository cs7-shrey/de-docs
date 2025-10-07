"use client"

import DiffCalculator from "@/lib/diff-calculator-character";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid4 } from "uuid";

// const diffCalculator = new DiffCalculator({content: '', start: 0, end: 0}, 500);

export default function Home() {
  const [textContent, setTextContent] = useState('');
  const [versionId, setVersionId] = useState(0);
  const [sessionId] = useState(() => uuid4());

  const [diffCalculator] = useState(
    () => new DiffCalculator({
        content: '', start: 0, end: 0
      }, 500, setVersionId, sessionId
    )
  )

  console.log(sessionId);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const response = await axios.get('http://localhost:3001/content');
      setTextContent(response.data.content);
      setVersionId(response.data.version);

      diffCalculator.updateState({
        content: response.data.content,
        start: 0,
        end: 0
      })

      console.log(response.data.content);
    }
    fetchContent();
  }, [])


  const updateCursor = () => {
    if(!textAreaRef.current) return;

    diffCalculator.updateCursor(
      textAreaRef.current.selectionStart,
      textAreaRef.current.selectionEnd
    )
  }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setTextContent(newContent)

    if(!textAreaRef.current) return;

    diffCalculator.captureChangeWithDebounce({
      content: newContent,
      start: textAreaRef.current.selectionStart,
      end: textAreaRef.current.selectionEnd
    }, versionId);
  }

  return (
    <textarea 
      name="" id=""
      className="bg-white text-black h-[80vh] w-[70vw] m-8 p-4 whitespace-pre-wrap resize-none"
      value={textContent}
      ref={textAreaRef}
      onChange={onChange}
      onClick={updateCursor}
      onKeyDown={updateCursor}
    >
    </textarea>
  );
}
