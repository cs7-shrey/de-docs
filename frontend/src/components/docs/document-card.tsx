"use client";

import { DocListItem } from "@/types";
import { FileText, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface DocumentCardProps {
  doc: DocListItem;
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] group bg-white rounded-xl border border-gray-200/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-gray-300/80 p-5"
      onClick={() => router.push(`/docs/${doc.id}`)}
    >
      {/* Header */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="p-2.5 rounded-lg bg-gray-50 group-hover:bg-gray-100/80 transition-colors flex-shrink-0">
          <FileText className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="text-[15px] font-semibold text-gray-900 truncate mb-1.5">
            {doc.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span>Edited {formatDate(new Date(doc.openedAt))}</span>
          </div>
        </div>
      </div>
      
      {/* Content Preview */}
      <p className="text-[13px] text-gray-600 line-clamp-2 leading-relaxed">
        {doc.briefContent || "No content yet..."}
      </p>
    </div>
  );
}
