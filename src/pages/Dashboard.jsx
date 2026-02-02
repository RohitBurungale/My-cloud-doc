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
import { ID, Query, Permission, Role } from "appwrite";

const Dashboard = () => {
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [trashCount, setTrashCount] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  /* ---------------- Fetch Active Documents ---------------- */
  const fetchDocuments = async () => {
    if (!user) return;

    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal("userId", user.$id),
        Query.equal("isDeleted", false),
      ]
    );

    setDocuments(res.documents);
  };

  /* ---------------- Fetch Trash Count ---------------- */
  const fetchTrashCount = async () => {
    if (!user) return;

    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal("userId", user.$id),
        Query.equal("isDeleted", true),
      ]
    );

    setTrashCount(res.total);
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchTrashCount();
    }
  }, [user]);

  /* ---------------- Handle File Selection ---------------- */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  /* ---------------- Upload (PRIVATE) ---------------- */
  const handleUploadClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setSelectedFiles(files);
    setUploading(true);
    setUploadSuccess(false);

    try {
      for (const file of files) {
        const uploaded = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          file,
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
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
          },
          [
            Permission.read(Role.user(user.$id)),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        );
      }

      fetchDocuments();
      fetchTrashCount();
      setUploadSuccess(true);
      setSelectedFiles([]);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Upload failed:", err.message);
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ---------------- Move to Trash ---------------- */
  const moveToTrash = async (doc) => {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      doc.$id,
      { isDeleted: true }
    );

    fetchDocuments();
    fetchTrashCount();
  };

  /* ---------------- Stats ---------------- */
  const total = documents.length;
  const favorites = documents.filter((d) => d.isFavorite).length;

  return (
    <DashboardLayout>
      {/* Header - Compact */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your documents securely in one place.
        </p>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs font-medium">Total</span>
            <span className="text-blue-500">📄</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{total}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs font-medium">Favorites</span>
            <span className="text-amber-500">⭐</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{favorites}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs font-medium">Trash</span>
            <span className="text-gray-500">🗑️</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{trashCount}</p>
        </div>
      </div>

      {/* Upload Success Message */}
      {uploadSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <p className="text-green-700 text-sm font-medium">
              Files uploaded successfully!
            </p>
          </div>
        </div>
      )}

      {/* Upload Section - Compact */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Upload Documents</h2>
            <p className="text-gray-500 text-xs mt-1">Upload your files here</p>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-600 font-medium mb-2">
              Selected files ({selectedFiles.length}):
            </p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 truncate max-w-[200px]">{file.name}</span>
                  <span className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <span>+</span>
                Choose Files
              </>
            )}
          </button>
          <p className="text-gray-500 text-xs">Max 10MB per file</p>
        </div>
        
        <input
          id="fileInput"
          type="file"
          multiple
          onChange={(e) => {
            handleFileSelect(e);
            handleFileChange(e);
          }}
          className="hidden"
        />
      </div>

      {/* Recent Documents - Compact */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Recent Documents</h2>
              <p className="text-gray-500 text-xs mt-1">Latest uploaded files</p>
            </div>
            {documents.length > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                {documents.length}
              </span>
            )}
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-gray-300 text-3xl mb-2">📄</div>
            <p className="text-gray-500 text-sm">No documents</p>
            <p className="text-gray-400 text-xs mt-1">Upload files to get started</p>
          </div>
        ) : (
          <div className="max-h-[200px] overflow-y-auto">
            {[...documents]
              .sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt))
              .slice(0, 4)
              .map((doc) => (
                <div key={doc.$id} className="p-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${doc.isFavorite ? 'bg-amber-50' : 'bg-gray-100'}`}>
                        <span className={`text-sm ${doc.isFavorite ? 'text-amber-600' : 'text-gray-600'}`}>
                          📄
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{doc.fileName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500 text-xs">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                          <span className="text-gray-300 text-xs">•</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(doc.$createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <a
                        href={storage.getFileView(BUCKET_ID, doc.fileId)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100"
                      >
                        View
                      </a>

                      <a
                        href={storage.getFileDownload(BUCKET_ID, doc.fileId)}
                        className="px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded hover:bg-green-100"
                      >
                        Download
                      </a>

                      <button
                        onClick={() => moveToTrash(doc)}
                        className="px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded hover:bg-red-100"
                      >
                        Trash
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;