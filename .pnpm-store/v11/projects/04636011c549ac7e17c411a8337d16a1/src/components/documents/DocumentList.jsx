import { useRef, useState, useMemo } from "react";
import { FileText, ImageIcon, Download, Trash2, Upload, FolderOpen, Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EmptyState from "@/components/shared/EmptyState";
import { useUploadDocument, useDeleteDocument } from "@/hooks/useDocuments";

const ACCEPTED  = "image/jpeg,image/png,image/webp,application/pdf";
const DOC_TYPES = ["All", "PDF", "Image"];

function DocRow({ doc, canDelete, tripId }) {
  const deleteDoc = useDeleteDocument(tripId);
  const isPdf     = doc.name?.toLowerCase().endsWith(".pdf");

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        {isPdf
          ? <FileText className="h-4 w-4 shrink-0 text-red-400" />
          : <ImageIcon className="h-4 w-4 shrink-0 text-blue-400" />
        }
        <div className="min-w-0">
          <p className="truncate font-medium">{doc.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {doc.uploadedBy?.fullName} · {format(new Date(doc.createdAt), "MMM d, yyyy")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <a href={doc.url} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </a>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => deleteDoc.mutate(doc._id)}
            disabled={deleteDoc.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function DocumentList({ documents, loading, canUpload, canDelete, tripId }) {
  const fileRef   = useRef(null);
  const uploadDoc = useUploadDocument(tripId);

  const [search,  setSearch]  = useState("");
  const [docType, setDocType] = useState("All");

  const filtered = useMemo(() => {
    return documents?.filter((doc) => {
      const isPdf           = doc.name?.toLowerCase().endsWith(".pdf");
      const matchesType     = docType === "All"
        || (docType === "PDF" && isPdf)
        || (docType === "Image" && !isPdf);
      const matchesSearch   = doc.name?.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [documents, search, docType]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    uploadDoc.mutate(fd);
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="space-y-2 px-5 py-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div>
      {/* Upload bar — fixed at top */}
      {canUpload && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p className="text-[11px] text-muted-foreground">
            Accepted: JPG, PNG, WebP, PDF · Max 5 MB
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploadDoc.isPending}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {uploadDoc.isPending ? "Uploading..." : "Upload"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Search + type filter */}
      {documents?.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="h-8 w-[90px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Scrollable list */}
      <div className="max-h-[360px] overflow-y-auto px-5">
        {documents?.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No documents yet"
            description="Upload tickets, booking confirmations, or any trip files."
          />
        ) : filtered?.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No results found.</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered?.map((doc) => (
              <DocRow key={doc._id} doc={doc} canDelete={canDelete} tripId={tripId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
