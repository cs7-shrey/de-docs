"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const CtaButton = () => {
  const router = useRouter();
  return (
    <Button 
        onClick={() => {
        router.push('/docs')
        }}
        className="scale-150 hover:cursor-pointer"
        >
        <p>Start creating</p>
        <ArrowRight className="" />
    </Button>
  )
}

export default CtaButton;
