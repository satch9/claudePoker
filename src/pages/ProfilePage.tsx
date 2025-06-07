import React, { useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUpload } from "../hooks/useUpload";
import { Id } from "../../convex/_generated/dataModel";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const userData = useQuery(
    api.users.getUserById,
    user?._id ? { id: user._id } : "skip"
  );

  const updateUser = useMutation(api.users.updateUser);

  const { uploadAvatar, isUploading, uploadError } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    await uploadAvatar(file, user._id);
  };

  const avatarUrl = useQuery(api.files.getAvatarUrl, {
    fileId: userData?.avatar as Id<"_storage">,
  });

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-white text-xl mb-4">Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-900 to-gray-800 py-10">
      <div className="bg-black/80 rounded-xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center">
        {/* Avatar */}
        <div className="mb-4 relative">
          <img
            src={avatarUrl || "/assets/default-avatar.png"}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-4 border-emerald-500 shadow-lg object-cover"
          />
          <button
            className="absolute bottom-2 right-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1 rounded-full shadow"
            onClick={handleAvatarClick}
            disabled={isUploading}
          >
            {isUploading ? "Chargement..." : "Modifier"}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
          />
          {uploadError && (
            <div className="text-red-500 text-xs mt-2">{uploadError}</div>
          )}
        </div>
        {/* Username & Email */}
        <div className="text-2xl font-bold text-white mb-1">
          {userData.username}
        </div>
        <div className="text-gray-300 text-sm mb-4">{userData.email}</div>
        {/* Chips & Stats */}
        <div className="flex gap-6 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-yellow-400 text-lg font-bold">
              {userData.chips.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">Jetons</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-green-400 text-lg font-bold">
              {userData.gamesPlayed}
            </span>
            <span className="text-xs text-gray-400">Parties jouées</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-blue-400 text-lg font-bold">
              {userData.gamesWon}
            </span>
            <span className="text-xs text-gray-400">Victoires</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-emerald-400 text-lg font-bold">
              {userData.totalWinnings}
            </span>
            <span className="text-xs text-gray-400">Gains totaux</span>
          </div>
        </div>
        {/* Préférences */}
        <div className="w-full bg-gray-900/80 rounded-lg p-4 mb-4">
          <div className="text-white font-semibold mb-2">
            Préférences d'affichage
          </div>
          <div className="flex flex-col gap-2 text-gray-300 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={userData.settings.hideLosingHand}
                className="accent-emerald-500 w-4 h-4"
                onChange={() => {
                  updateUser({
                    id: userData._id,
                    patch: {
                      settings: {
                        ...userData.settings,
                        hideLosingHand: !userData.settings.hideLosingHand,
                      },
                    },
                  });
                }}
              />
              Masquer les mains perdantes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={userData.settings.hideWinningHand}
                className="accent-emerald-500 w-4 h-4"
                onChange={() => {
                  updateUser({
                    id: userData._id,
                    patch: {
                      settings: {
                        ...userData.settings,
                        hideWinningHand: !userData.settings.hideWinningHand,
                      },
                    },
                  });
                }}
              />
              Masquer les mains gagnantes
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={userData.settings.hideFoldWhenLast}
                className="accent-emerald-500 w-4 h-4"
                onChange={() => {
                  updateUser({
                    id: userData._id,
                    patch: {
                      settings: {
                        ...userData.settings,
                        hideFoldWhenLast: !userData.settings.hideFoldWhenLast,
                      },
                    },
                  });
                }}
              />
              Masquer le fold quand dernier
            </label>
          </div>
          <button
            onClick={() => {
              updateUser({
                id: userData._id,
                patch: { settings: userData.settings },
              });
            }}
            className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded shadow"
          >
            Modifier les préférences
          </button>
        </div>
        {/* Infos dates */}
        <div className="w-full flex flex-col gap-1 text-xs text-gray-400">
          <div>
            Créé le :{" "}
            <span className="text-white">
              {new Date(userData.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            Dernière modification :{" "}
            <span className="text-white">
              {new Date(userData.updatedAt).toLocaleString()}
            </span>
          </div>
          <div>
            Dernière connexion :{" "}
            <span className="text-white">
              {new Date(userData.lastLoginAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
