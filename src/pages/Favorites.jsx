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
  Star,
  Eye,
  Download,
  File,
  Heart
} from "lucide-react";

const Favorites = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal("userId", user.$id),
          Query.equal("isFavorite", true),
          Query.equal("isDeleted", false),
        ]
      );
      setDocuments(res.documents);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const removeFavorite = async (doc) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        { isFavorite: false }
      );
      fetchFavorites();
    } catch (error) {
      console.error("Error removing favorite:", error);
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
        <h2 className="text-3xl font-bold text-gray-900">
          Favorites
        </h2>
        <p className="text-gray-600 mt-2">
          Your starred documents for quick access.
        </p>
      </div>

      {/* Favorites List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {documents.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              No favorite documents
            </p>
            <p className="text-sm text-gray-500">
              Star documents to see them here for quick access.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div
                key={doc.$id}
                className="flex items-center justify-between p-5 hover:bg-gray-50 
                  transition-colors duration-150"
              >
                {/* Left Side - File Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-lg bg-gray-50 ${getFileIconColor(doc.fileName)}`}>
                    <File className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {doc.fileName}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">
                        {formatFileSize(doc.fileSize)}
                      </p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-500">
                        {new Date(doc.$createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center gap-3 ml-4">
                  {/* Preview */}
                  <a
                    href={storage.getFileView(BUCKET_ID, doc.fileId)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                      text-gray-700 bg-white border border-gray-300 rounded-lg 
                      hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </a>

                  {/* Download */}
                  <a
                    href={storage.getFileDownload(BUCKET_ID, doc.fileId)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                      text-white bg-blue-600 border border-blue-600 rounded-lg 
                      hover:bg-blue-700 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>

                  {/* Remove Favorite */}
                  <button
                    onClick={() => removeFavorite(doc)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Remove from favorites"
                  >
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
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
          {documents.length} favorite {documents.length === 1 ? 'document' : 'documents'}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Favorites;