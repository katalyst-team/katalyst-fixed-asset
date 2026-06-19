import { useMutation } from "@tanstack/react-query";

import {
  getUploadPathByExtension,
  getUploadPathByFeatureId,
} from "../../../constants/uploadPath";
import { uploadFileService } from "../../../services/file/uploadFileService";

interface UploadFileParams {
  featureId?: string;
  file: File;
}

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({ featureId, file }: UploadFileParams) => {
      // 1. Determine the path dynamically based on featureId or extension
      const path = featureId
        ? getUploadPathByFeatureId(featureId)
        : getUploadPathByExtension(file.name);

      // 2. Prepare FormData payload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);

      // 3. Hit the direct upload endpoint
      const response = await uploadFileService(formData);

      if (!response.metadata.success) {
        throw new Error(response.metadata.message || "Failed to upload file");
      }

      // Return the URL of the uploaded file
      return response.data.url;
    },
  });
};
