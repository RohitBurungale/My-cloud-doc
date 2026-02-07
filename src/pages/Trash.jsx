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
  File,
  Clock,
  Search,
  X,
  Check,
  AlertTriangle,
  MoreVertical
} from "lucide-react";

const Trash = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

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

  /* ---------- Search Filter ---------- */
  const filteredDocs = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------- Selection ---------- */
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === filteredDocs.length) {
      setSelected([]);
    } else {
      setSelected(filteredDocs.map((d) => d.$id));
    }
  };

  /* ---------- Restore ---------- */
  const restoreSelected = async () => {
    if (selected.length === 0) return;
    
    setRestoring(true);
    try {
      for (const id of selected) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          id,
          { isDeleted: false, deletedAt: null }
        );
      }
      await fetchTrash();
    } catch (error) {
      console.error("Error restoring documents:", error);
    } finally {
      setRestoring(false);
    }
  };

  /* ---------- Delete Forever ---------- */
  const deleteSelected = async () => {
    if (selected.length === 0) return;

    setDeleting(true);
    try {
      for (const id of selected) {
        const doc = documents.find((d) => d.$id === id);
        if (!doc) continue;

        // Try deleting file
        try {
          await storage.deleteFile(BUCKET_ID, doc.fileId);
        } catch (err) {
          if (err.code !== 404) {
            console.error("Storage delete failed:", err);
          }
        }

        // Delete DB record
        await databases.deleteDocument(
          DATABASE_ID,
          COLLECTION_ID,
          doc.$id
        );
      }
      await fetchTrash();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting documents:", error);
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- Format Functions ---------- */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const calculateDaysAgo = (dateString) => {
    const deletedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - deletedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      pdf: "📕",
      doc: "📘",
      docx: "📘",
      txt: "📄",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
    };
    return icons[ext] || "📄";
  };

  const getFileColor = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const colors = {
      pdf: 'bg-red-50 text-red-600',
      doc: 'bg-blue-50 text-blue-600',
      docx: 'bg-blue-50 text-blue-600',
      txt: 'bg-gray-50 text-gray-600',
      jpg: 'bg-emerald-50 text-emerald-600',
      jpeg: 'bg-emerald-50 text-emerald-600',
      png: 'bg-emerald-50 text-emerald-600',
    };
    return colors[ext] || 'bg-gray-50 text-gray-600';
  };

  return (
    <DashboardLayout>
      {/* MAIN CONTAINER - No scroll on whole page */}
      <div className="h-full flex flex-col">
        {/* HEADER - Fixed height */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
              <p className="text-sm text-gray-500 mt-1">
                {documents.length} item{documents.length !== 1 ? 's' : ''} • Auto-deletes in 30 days
              </p>
            </div>
            <div className="text-sm font-medium text-gray-700">
              {user?.name || user?.email}
            </div>
          </div>
        </div>

        {/* QUICK STATS - Fixed height */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Items</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Selected</p>
                <p className="text-2xl font-bold text-gray-900">{selected.length}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">
                  {documents.filter(d => {
                    const daysAgo = calculateDaysAgo(d.$updatedAt || d.$createdAt);
                    return daysAgo >= 25;
                  }).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & ACTIONS BAR - Fixed height */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search deleted files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 
                bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:border-transparent transition-shadow"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 
                  text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={selectAll}
            className={`px-4 py-2.5 text-sm rounded-xl border transition-all ${
              selected.length === filteredDocs.length && filteredDocs.length > 0
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            {selected.length === filteredDocs.length && filteredDocs.length > 0 ? "Unselect All" : "Select All"}
          </button>
        </div>

        {/* ACTION BUTTONS - Fixed height, conditional */}
        {selected.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={restoreSelected}
              disabled={restoring}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl 
                hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 
                disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
            >
              {restoring ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Restore {selected.length} item{selected.length !== 1 ? 's' : ''}
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl 
                hover:from-red-600 hover:to-rose-700 transition-all shadow-sm hover:shadow"
            >
              <Trash2 className="w-4 h-4" />
              Delete {selected.length} item{selected.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {/* TRASH LIST - Takes remaining space with internal scroll */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Deleted Files</h3>
            <span className="text-sm text-gray-500 font-medium">
              {filteredDocs.length} found
            </span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-base font-medium text-gray-700 mb-2">
                {search ? "No matching files" : "Trash is empty"}
              </p>
              <p className="text-sm text-gray-500 text-center">
                {search ? "Try adjusting your search terms" : "Deleted files will appear here"}
              </p>
            </div>
          ) : (
            <div className="flex-1 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
              {/* Table with horizontal scroll */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Table header - fixed */}
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50 shrink-0">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 min-w-[900px]">
                    <div className="col-span-1 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selected.length === filteredDocs.length && filteredDocs.length > 0}
                        onChange={selectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                          focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                      />
                    </div>
                    <div className="col-span-4">File Name</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-2">Deleted</div>
                    <div className="col-span-2">Time Left</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                </div>
                
                {/* Scrollable table body with both vertical and horizontal scroll */}
                <div className="flex-1 overflow-y-auto overflow-x-auto">
                  <div className="min-w-[900px]">
                    {filteredDocs.map((doc) => {
                      const daysAgo = calculateDaysAgo(doc.$updatedAt || doc.$createdAt);
                      const daysLeft = Math.max(0, 30 - daysAgo);
                      const isExpiringSoon = daysLeft < 7;
                      
                      return (
                        <div
                          key={doc.$id}
                          className={`px-6 py-3 border-b border-gray-100 hover:bg-white transition-colors ${
                            isExpiringSoon ? 'bg-red-50/30' : ''
                          }`}
                        >
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Checkbox */}
                            <div className="col-span-1 flex items-center">
                              <input
                                type="checkbox"
                                checked={selected.includes(doc.$id)}
                                onChange={() => toggleSelect(doc.$id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                                  focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
                              />
                            </div>
                            
                            {/* File name with icon */}
                            <div className="col-span-4 flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFileColor(doc.fileName)}`}>
                                <span className="text-sm">{getFileIcon(doc.fileName)}</span>
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate" title={doc.fileName}>
                                  {doc.fileName}
                                </h4>
                              </div>
                            </div>
                            
                            {/* File size */}
                            <div className="col-span-2">
                              <span className="text-sm text-gray-600">{formatFileSize(doc.fileSize)}</span>
                            </div>
                            
                            {/* Deleted time */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{daysAgo}d ago</span>
                              </div>
                            </div>
                            
                            {/* Time left with progress */}
                            <div className="col-span-2">
                              <div className="space-y-1">
                                <span className={`text-sm font-medium ${isExpiringSoon ? 'text-red-600' : 'text-amber-600'}`}>
                                  {daysLeft}d left
                                </span>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      isExpiringSoon ? 'bg-red-500' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="col-span-1">
                              <div className="relative flex justify-end">
                                <button
                                  onClick={() => setActiveMenu(activeMenu === doc.$id ? null : doc.$id)}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                
                                {activeMenu === doc.$id && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40"
                                      onClick={() => setActiveMenu(null)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1">
                                      <button
                                        onClick={() => {
                                          setSelected([doc.$id]);
                                          setTimeout(restoreSelected, 0);
                                          setActiveMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Restore
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelected([doc.$id]);
                                          setShowDeleteConfirm(true);
                                          setActiveMenu(null);
                                        }}
                                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Permanently
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AUTO-DELETE NOTICE - Fixed at bottom */}
        <div className="mt-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Auto-delete Notice</p>
                <p className="text-sm text-blue-700">
                  Files are permanently deleted after 30 days. Restore important files before they expire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Delete permanently?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-red-800">
                Delete {selected.length} item{selected.length !== 1 ? 's' : ''} forever?
              </p>
              <p className="text-sm text-red-700 mt-2">
                These files will be permanently removed from storage and cannot be recovered.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl 
                  hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={deleteSelected}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl 
                  hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all text-sm font-medium flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        /* Vertical scrollbar for table body */
        .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f5f9;
        }
        
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
          margin: 4px 0;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
          border: 2px solid #f1f5f9;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Horizontal scrollbar for table */
        .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f5f9;
        }
        
        .overflow-x-auto::-webkit-scrollbar {
          height: 8px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
          margin: 0 4px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
          border: 2px solid #f1f5f9;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Combined scrollbar for both directions */
        .overflow-y-auto.overflow-x-auto::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
        
        /* For Firefox */
        .overflow-y-auto,
        .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f1f5f9;
        }
        
        /* Sticky header effect when scrolling */
        .min-w-\[900px\] > div:first-child {
          position: sticky;
          top: 0;
          z-index: 10;
          background: white;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Trash;