"use client";

import { authContext } from "@/context/useAuth";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";

const CtaButton = () => {
  const router = useRouter();
  const { isSyncing } = useContext(authContext);
  return (
    <button
      className="group sm:min-w-32 md:min-w-48 lg:min-w-52 inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold text-white transition-all duration-300 ease-in-out bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg hover:shadow-xl"
      onClick={() => {
        router.push("/docs");
      }}
      disabled={isSyncing}
    >
      {!isSyncing ? (
        <>
          <span>Start creating</span>
          <ArrowRightIcon className="group-hover:translate-x-1 transition-all duration-300" />
        </>
      ) : (
        <Loader2 className="animate-spin"/>
      )}
    </button>
  );
};

export default CtaButton;
