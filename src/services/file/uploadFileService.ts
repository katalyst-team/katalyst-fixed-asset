import fetcher, { ApiResponse } from "@/services/index";

export interface UploadFileResponse {
  url: string;
  filename: string;
}

export const uploadFileService = async (
  formData: FormData,
): Promise<ApiResponse<UploadFileResponse>> => {
  return fetcher({
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    method: "POST",
    url: "/v1/files/upload",
  });
};
