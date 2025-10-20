import { useEffect, useState } from "react";
import { getContent } from "@/lib/api-client";
import { isAxiosError } from "axios";
import { DocMetaData } from "@/types";

interface Options {
    docId: string;
    onContentData: (content: string, versionId: number) => void;
    setMetadata: (metadata: DocMetaData) => void;
}
const useDocContent = ({ docId, onContentData, setMetadata }: Options) => {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setFetching(true); 

        const data = await getContent(docId);
        onContentData(data.content, data.version);

        setMetadata({
          visibility: data.visibility,
          ownerId: data.ownerId,
          name: data.name
        });
      } 
      catch (error) {
        let errMsg = "An error occured while fetching the document"; 
        if(isAxiosError(error)) {
          errMsg = (typeof error.response?.data.detail === "string" && error.response?.data.detail) || errMsg;
        }
        setError(errMsg);
      } 
      finally {
        setFetching(false);
      }
    };
    fetchContent();
  }, [docId, onContentData]);

  return {fetching, error};
};

export default useDocContent;
