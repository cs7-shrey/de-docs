"use client";

import { authContext } from "@/context/useAuth";
import { useContext, useState } from "react";
import { DocListItem } from "@/types";
import { DocumentCard } from "@/components/docs/document-card";
import { CreateDocumentDialog } from "@/components/docs/create-document-dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/home/logo";

// Mock data for documents
const MOCK_DOCUMENTS: DocListItem[] = [
  {
    id: "1",
    name: "Project Proposal 2025",
    createdAt: new Date(2025, 9, 15),
    updatedAt: new Date(2025, 9, 17),
    briefContent:
      "Comprehensive proposal for the upcoming project initiatives including budget allocation, timeline, and resource planning...",
  },
  {
    id: "2",
    name: "Meeting Notes - Q4 Planning",
    createdAt: new Date(2025, 9, 10),
    updatedAt: new Date(2025, 9, 16),
    briefContent:
      "Key discussion points from quarterly planning session. Action items: review metrics, update roadmap, schedule follow-ups...",
  },
  {
    id: "3",
    name: "Design System Documentation",
    createdAt: new Date(2025, 9, 5),
    updatedAt: new Date(2025, 9, 14),
    briefContent:
      "Complete guide to our design system including color palette, typography, component library, and usage guidelines...",
  },
  {
    id: "4",
    name: "Technical Architecture Overview",
    createdAt: new Date(2025, 8, 28),
    updatedAt: new Date(2025, 9, 12),
    briefContent:
      "High-level overview of system architecture, microservices design, database schema, and infrastructure setup...",
  },
  {
    id: "5",
    name: "Product Roadmap 2025-2026",
    createdAt: new Date(2025, 8, 20),
    updatedAt: new Date(2025, 9, 10),
    briefContent:
      "Strategic roadmap outlining feature releases, milestones, and product vision for the next fiscal year...",
  },
  {
    id: "6",
    name: "Team Onboarding Guide",
    createdAt: new Date(2025, 8, 15),
    updatedAt: new Date(2025, 9, 8),
    briefContent:
      "Comprehensive onboarding documentation for new team members including setup instructions, best practices, and resources...",
  },
];

export default function Docs() {
  const { user } = useContext(authContext);
  const [documents, setDocuments] = useState<DocListItem[]>(MOCK_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateDocument = (name: string) => {
    const newDoc: DocListItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      briefContent: "",
    };
    setDocuments([newDoc, ...documents]);
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                    {user.name.charAt(0).toUpperCase()}
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