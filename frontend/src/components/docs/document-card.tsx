"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-400 group"
      onClick={() => router.push(`/docs/${doc.id}`)}
    >
      <CardHeader className="pb-3 block">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors flex-shrink-0">
            <FileText className="h-5 w-5 text-gray-700" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <CardTitle className="text-base font-semibold text-gray-900 truncate block">
              {doc.name}
            </CardTitle>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>Edited {formatDate(doc.updatedAt)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <CardDescription className="text-sm text-gray-600 line-clamp-2">
          {doc.briefContent || "No content yet..."}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
