"use client";

import { authContext } from "@/context/useAuth";
import { useContext, useEffect, useState } from "react";
import { DocListItem } from "@/types";
import { DocumentCard } from "@/components/docs/document-card";
import { CreateDocumentDialog } from "@/components/docs/create-document-dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { IconUserCircle } from '@tabler/icons-react';
import { Skeleton } from "@/components/ui/skeleton";
import Logo from "@/components/home/logo";
import { createDocument, getDocsCreated } from "@/lib/api-client";

export default function Docs() {
  const { user } = useContext(authContext);
  const [documents, setDocuments] = useState<DocListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleCreateDocument = async (name: string) => {
    const newDoc: DocListItem = await createDocument(name);
    setDocuments([newDoc, ...documents]);

    return newDoc.id;
  };

  useEffect(() => {
    getDocsCreated()
      .then((docs) => setDocuments(docs))
      .finally(() => setIsLoading(false));
  }, [])

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}>
      {/* Header */}
      <header className="bg-[#fafafa]">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5 font-semibold">
              <Logo size={22} />
              <span className="text-xl tracking-tight">De-docs</span>
            </div>
            {user && (
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden sm:inline text-gray-600 font-medium">{user.name}</span>
                {/* <div className="h-7 w-7 rounded-full bg-gray-300/60 flex items-center justify-center text-xs font-semibold text-gray-700">
                  {user.name?.charAt(0).toUpperCase()}
                </div> */}
              <IconUserCircle className="text-gray-600 size-6"/>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 lg:px-12 py-12 max-w-7xl">
        {/* Page Title & Actions */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1.5">
                My Documents
              </h1>
              <p className="text-gray-500 text-[15px]">
                Create, edit, and collaborate on documents
              </p>
            </div>
            <CreateDocumentDialog onCreateDocument={handleCreateDocument} />
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white border-gray-200/80 focus:border-gray-300 focus:ring-1 focus:ring-gray-200 rounded-lg"
            />
          </div>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200/80">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-gray-100/80 p-6 mb-5">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No documents found" : "No documents yet"}
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm text-[15px]">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Get started by creating your first document"}
            </p>
            {/* {!searchQuery && (
              <CreateDocumentDialog onCreateDocument={handleCreateDocument} />
            )} */}
          </div>
        )}
      </main>
    </div>
  );
}