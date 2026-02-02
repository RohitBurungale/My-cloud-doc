import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  databases,
  storage,
  DATABASE_ID,
  COLLECTION_ID,
  BUCKET_ID,
} from "../appwrite/config";
import { useAuth } from "../context/AuthContext";
import { ID, Query } from "appwrite";
import { 
  Search, 
  Upload, 
  Star, 
  StarOff, 
  Eye, 
  Download, 
  Edit2, 
  Trash2,
  File,
  Loader2,
  X
} from "lucide-react";

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [newFileName, setNewFileName] = useState("");

  /* ---------------- Fetch Documents ---------------- */
  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("isDeleted", false),
        ]
      );
      setDocuments(res.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  /* ---------------- Upload ---------------- */
  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);

    try {
      for (const file of files) {
        const uploaded = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          file
        );

        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          ID.unique(),
          {
            userId: user.$id,
            fileId: uploaded.$id,
            fileName: file.name,
            fileSize: file.size,
            isFavorite: false,
            isDeleted: false,
          }
        );
      }
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ---------------- Actions ---------------- */
  const toggleFavorite = async (doc) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        { isFavorite: !doc.isFavorite }
      );
      fetchDocuments();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const moveToTrash = async (doc) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        { isDeleted: true }
      );
      fetchDocuments();
    } catch (error) {
      console.error("Error moving to trash:", error);
    }
  };

  const renameDocument = async (doc) => {
    if (!newFileName.trim()) {
      setRenamingId(null);
      return;
    }

    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        { fileName: newFileName }
      );
      setRenamingId(null);
      setNewFileName("");
      fetchDocuments();
    } catch (error) {
      console.error("Error renaming document:", error);
    }
  };

  /* ---------------- Search ---------------- */
  const filteredDocs = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIconColor = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const colors = {
      pdf: 'text-red-500',
      doc: 'text-blue-500',
      docx: 'text-blue-500',
      txt: 'text-gray-500',
      jpg: 'text-green-500',
      jpeg: 'text-green-500',
      png: 'text-green-500',
      xls: 'text-emerald-500',
      xlsx: 'text-emerald-500',
      ppt: 'text-orange-500',
      pptx: 'text-orange-500',
    };
    return colors[ext] || 'text-gray-700';
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Documents
        </h2>
        <p className="text-gray-600 mt-2">
          Manage and organize all your uploaded documents in one place.
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 
              bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 
                text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <label className="flex items-center justify-center gap-2 px-6 py-3 
          bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 
          active:bg-blue-800 transition-colors duration-200 cursor-pointer 
          disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Document
            </>
          )}
          <input
            type="file"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Documents Count */}
      {filteredDocs.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredDocs.length} of {documents.length} documents
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 
            p-12 text-center">
            <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {search ? "No documents found" : "No documents yet"}
            </p>
            <p className="text-gray-500 mb-6">
              {search 
                ? "Try a different search term"
                : "Upload your first document to get started"
              }
            </p>
            {!search && (
              <label className="inline-flex items-center gap-2 px-4 py-2 
                bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 
                transition-colors duration-200 cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload Document
                <input
                  type="file"
                  multiple
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.$id}
              className="bg-white rounded-xl border border-gray-200 
                hover:border-gray-300 hover:shadow-lg transition-all duration-200 
                overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg bg-gray-50 ${getFileIconColor(doc.fileName)}`}>
                    <File className="w-6 h-6" />
                  </div>
                  <button
                    onClick={() => toggleFavorite(doc)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={doc.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    {doc.isFavorite ? (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* File Name */}
                <div className="min-h-[56px]">
                  {renamingId === doc.$id ? (
                    <div className="space-y-2">
                      <input
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") renameDocument(doc);
                          if (e.key === "Escape") {
                            setRenamingId(null);
                            setNewFileName("");
                          }
                        }}
                        autoFocus
                        className="w-full px-3 py-2 text-sm border border-gray-300 
                          rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 
                          focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => renameDocument(doc)}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded 
                            hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setRenamingId(null);
                            setNewFileName("");
                          }}
                          className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded 
                            hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-medium text-gray-900 line-clamp-2">
                      {doc.fileName}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 font-medium">
                    {formatFileSize(doc.fileSize)}
                  </span>
                  <div className="text-xs text-gray-500">
                    {new Date(doc.$createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={storage.getFileView(BUCKET_ID, doc.fileId)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                        text-sm text-gray-700 bg-white border border-gray-300 rounded-lg 
                        hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>

                    <a
                      href={storage.getFileDownload(BUCKET_ID, doc.fileId)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                        text-sm text-white bg-blue-600 border border-blue-600 rounded-lg 
                        hover:bg-blue-700 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setRenamingId(doc.$id);
                        setNewFileName(doc.fileName);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                        text-sm text-gray-700 bg-white border border-gray-300 rounded-lg 
                        hover:bg-gray-50 hover:border-gray-400 transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-4 h-4" />
                      Rename
                    </button>

                    <button
                      onClick={() => moveToTrash(doc)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                        text-sm text-red-600 bg-white border border-red-200 rounded-lg 
                        hover:bg-red-50 hover:border-red-300 transition-colors"
                      title="Move to trash"
                    >
                      <Trash2 className="w-4 h-4" />
                      Trash
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Documents;