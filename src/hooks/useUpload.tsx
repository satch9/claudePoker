import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const saveAvatar = useMutation(api.files.saveAvatar);

  const uploadAvatar = async (
    file: File,
    userId: string
  ): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Générer l'URL d'upload
      const postUrl = await generateUploadUrl();

      // Upload du fichier
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const { storageId } = await result.json();

      // Sauvegarder l'ID du fichier dans le user
      const fileId = await saveAvatar({
        userId: userId as Id<"users">,
        fileId: storageId,
      });

      return fileId;
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Erreur inconnue"
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    isUploading,
    uploadError,
  };
};
