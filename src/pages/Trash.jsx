import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  storage,
  databases,
  BUCKET_ID,
  DATABASE_ID,
  COLLECTION_ID,
} from "../appwrite/config";
import { useAuth } from "../context/AuthContext";
import { Query } from "appwrite";
import {
  RotateCcw,
  Trash2,
  File
} from "lucide-react";

const Trash = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState([]);

  /* ---------- Fetch Trash ---------- */
  const fetchTrash = async () => {
    if (!user) return;

    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("isDeleted", true),
        ]
      );
      setDocuments(res.documents);
      setSelected([]);
    } catch (error) {
      console.error("Error fetching trash:", error);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, [user]);

  /* ---------- Selection ---------- */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === documents.length) {
      setSelected([]);
    } else {
      setSelected(documents.map((d) => d.$id));
    }
  };

  /* ---------- Restore ---------- */
  const restoreSelected = async () => {
    try {
      for (const id of selected) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          id,
          { isDeleted: false, deletedAt: null }
        );
      }
      fetchTrash();
    } catch (error) {
      console.error("Error restoring documents:", error);
    }
  };

  /* ---------- Delete Forever (SAFE) ---------- */
  const deleteSelected = async () => {
    if (selected.length === 0) return;

    const confirm = window.confirm(
      `Delete ${selected.length} file(s) permanently?`
    );
    if (!confirm) return;

    try {
      for (const id of selected) {
        const doc = documents.find((d) => d.$id === id);
        if (!doc) continue;

        // Try deleting file (ignore 404)
        try {
          await storage.deleteFile(BUCKET_ID, doc.fileId);
        } catch (err) {
          if (err.code !== 404) {
            console.error("Storage delete failed:", err);
          }
        }

        // Always delete DB record
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_ID,
          doc.$id
        );
      }
      fetchTrash();
    } catch (error) {
      console.error("Error deleting documents:", error);
    }
  };

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
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Trash</h2>
        <p className="text-gray-600 mt-2">
          Files are permanently deleted after 30 days.
        </p>
      </div>

      {/* Bulk Actions */}
      {documents.length > 0 && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={selectAll}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 
              hover:underline transition-colors"
          >
            {selected.length === documents.length
              ? "Unselect All"
              : "Select All"}
          </button>

          {selected.length > 0 && (
            <>
              <button
                onClick={restoreSelected}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                  bg-green-600 text-white rounded-lg hover:bg-green-700 
                  transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Restore ({selected.length})
              </button>

              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                  bg-red-600 text-white rounded-lg hover:bg-red-700 
                  transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Forever ({selected.length})
              </button>
            </>
          )}
        </div>
      )}

      {/* Trash List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-16 text-center">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Trash is empty
            </p>
            <p className="text-sm text-gray-500">
              Deleted files will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div
                key={doc.$id}
                className="flex items-center justify-between p-5 hover:bg-gray-50 
                  transition-colors"
              >
                {/* Left Side */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selected.includes(doc.$id)}
                    onChange={() => toggleSelect(doc.$id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                      focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />

                  <div className={`p-2.5 rounded-lg bg-gray-50 ${getFileIconColor(doc.fileName)}`}>
                    <File className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {doc.fileName}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() =>
                      databases
                        .updateDocument(
                          DATABASE_ID,
                          COLLECTION_ID,
                          doc.$id,
                          { isDeleted: false, deletedAt: null }
                        )
                        .then(fetchTrash)
                    }
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                      text-green-700 bg-green-50 border border-green-200 rounded-lg 
                      hover:bg-green-100 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>

                  <button
                    onClick={() => {
                      setSelected([doc.$id]);
                      setTimeout(() => deleteSelected(), 0);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                      text-red-700 bg-red-50 border border-red-200 rounded-lg 
                      hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Count */}
      {documents.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          {documents.length} {documents.length === 1 ? 'item' : 'items'} in trash
        </div>
      )}
    </DashboardLayout>
  );
};

export default Trash;