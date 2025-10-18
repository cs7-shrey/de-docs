"use client";

import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const CtaButton = () => {
  const router = useRouter();
  return (
    <button
      className="group inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold text-white transition-all duration-300 ease-in-out bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg hover:shadow-xl"
      onClick={() => {
        router.push("/docs");
      }}
    >
      Start creating
      <ArrowRightIcon className="group-hover:translate-x-1 transition-all duration-300"/>
    </button>
  );
};

export default CtaButton;
