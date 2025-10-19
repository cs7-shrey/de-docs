"use client";

import { authContext } from "@/context/useAuth";
import { useContext, useEffect, useState } from "react";
import { DocListItem } from "@/types";
import { DocumentCard } from "@/components/docs/document-card";
import { CreateDocumentDialog } from "@/components/docs/create-document-dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/home/logo";
import { createDocument, getDocsCreated } from "@/lib/api-client";

export default function Docs() {
  const { user } = useContext(authContext);
  const [documents, setDocuments] = useState<DocListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateDocument = async (name: string) => {
    const newDoc: DocListItem = await createDocument(name);
    console.log(newDoc);
    setDocuments([newDoc, ...documents]);
  };

  useEffect(() => {
    getDocsCreated().then((docs) => setDocuments(docs))
  }, [])

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log(user);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <Logo size={24} />
              <span className="text-xl">De-docs</span>
            </div>
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                My Documents
              </h1>
              <p className="text-muted-foreground mt-1">
                Create, edit, and collaborate on documents
              </p>
            </div>
            <CreateDocumentDialog onCreateDocument={handleCreateDocument} />
          </div>

          <Separator className="mb-6" />

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No documents found" : "No documents yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Get started by creating your first document"}
            </p>
            {!searchQuery && (
              <CreateDocumentDialog onCreateDocument={handleCreateDocument} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}