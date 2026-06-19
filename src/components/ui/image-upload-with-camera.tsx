/* eslint-disable @next/next/no-img-element, max-lines */
import {
  AlertCircle,
  Camera,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUploadFile } from "@/hooks/api/file/useUploadFile";

interface ImageUploadWithCameraProps {
  description?: string;
  disabled?: boolean;
  featureId?: string;
  initialImages?: string[];
  label?: string;
  maxImages?: number;
  onImagesChange: (imageUrls: string[]) => void;
  prefix?: string;
}

interface UploadedImage {
  error?: string;
  file?: File;
  id: string;
  isUploading: boolean;
  preview: string;
  url?: string;
}

export const ImageUploadWithCamera = ({
  description,
  disabled = false,
  featureId,
  initialImages = [],
  label,
  maxImages = 3,
  onImagesChange,
  prefix = "image",
}: ImageUploadWithCameraProps) => {
  const { t } = useTranslation("common");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
  const [isVideoReady, setIsVideoReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { mutateAsync: uploadFile } = useUploadFile();

  const generateFileName = useCallback(
    (originalName: string) => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = originalName.split(".").pop() || "jpg";
      return `${prefix}/${timestamp}-${randomId}.${extension}`;
    },
    [prefix],
  );

  const uploadSingleImage = useCallback(
    async (imageId: string, file: File) => {
      try {
        const customFileName = generateFileName(file.name);
        const renamedFile = new File([file], customFileName, {
          type: file.type,
        });

        const result = await uploadFile({ featureId, file: renamedFile });

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  error: undefined,
                  isUploading: false,
                  url: result,
                }
              : img,
          ),
        );

        return result;
      } catch (uploadError) {
        const errorMessage =
          uploadError instanceof Error ? uploadError.message : "Upload failed";
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, error: errorMessage, isUploading: false }
              : img,
          ),
        );
        toast.error(
          t("imageUpload.uploadImageFailed", { error: errorMessage }),
        );
        throw uploadError;
      }
    },
    [featureId, generateFileName, uploadFile, t],
  );

  const updateParentImages = useCallback(
    (updatedImages: UploadedImage[]) => {
      const uploadedUrls = updatedImages
        .filter((img) => img.url && !img.isUploading)
        .map((img) => img.url!);
      onImagesChange(uploadedUrls);
    },
    [onImagesChange],
  );

  useEffect(() => {
    setImages((prev) => {
      const nextImages = initialImages.map((url) => ({
        id: `existing-${url}`,
        isUploading: false,
        preview: url,
        url,
      }));

      const isSameLength = prev.length === nextImages.length;
      const isSameContent =
        isSameLength &&
        prev.every(
          (img, index) =>
            img.url === nextImages[index]?.url && !img.isUploading,
        );

      if (isSameContent) {
        return prev;
      }

      return nextImages;
    });
  }, [initialImages]);

  const addImages = useCallback(
    async (files: File[]) => {
      if (images.length + files.length > maxImages) {
        toast.error(t("imageUpload.maxImagesError", { max: maxImages }));
        return;
      }

      const newImages: UploadedImage[] = files.map((file) => ({
        file,
        id: Math.random().toString(36).substring(2, 15),
        isUploading: true,
        preview: URL.createObjectURL(file),
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      const uploadPromises = newImages.map(async (img) => {
        if (!img.file) {
          return;
        }
        try {
          await uploadSingleImage(img.id, img.file);
        } catch {
          // Error already handled in uploadSingleImage
        }
      });

      await Promise.allSettled(uploadPromises);

      setTimeout(() => {
        setImages((current) => {
          updateParentImages(current);
          return current;
        });
      }, 100);
    },
    [images, maxImages, uploadSingleImage, updateParentImages, t],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length > 0) {
        addImages(files);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [addImages],
  );

  const startVideoStream = useCallback(
    async (video: HTMLVideoElement, stream: MediaStream) => {
      try {
        video.srcObject = stream;

        // Wait for metadata to load
        await new Promise<void>((resolve, reject) => {
          const handleLoadedMetadata = () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            resolve();
          };

          const handleError = () => {
            video.removeEventListener("error", handleError);
            reject(new Error("Video metadata failed to load"));
          };

          video.addEventListener("loadedmetadata", handleLoadedMetadata);
          video.addEventListener("error", handleError);

          // Timeout after 5 seconds
          setTimeout(() => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("error", handleError);
            reject(new Error("Video metadata loading timeout"));
          }, 5000);
        });

        // Try to play the video
        try {
          await video.play();
          setIsVideoReady(true);
        } catch (playError) {
          console.warn("Autoplay failed, but video is ready:", playError);
          setIsVideoReady(true);
        }
      } catch (error) {
        console.error("Error starting video stream:", error);
        throw error;
      }
    },
    [],
  );

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      setIsVideoReady(false);

      // Try different camera constraints, starting with the most flexible
      const constraints = [
        // Try user camera first (front camera on mobile, any camera on desktop)
        { video: { height: { ideal: 720 }, width: { ideal: 1280 } } },
        // Try environment camera (back camera on mobile)
        {
          video: {
            facingMode: "environment",
            height: { ideal: 720 },
            width: { ideal: 1280 },
          },
        },
        // Fallback to any video
        { video: true },
      ];

      let stream: MediaStream | null = null;
      let lastError: Error | null = null;

      for (const constraint of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break;
        } catch (error) {
          console.warn("Failed with constraint:", constraint, error);
          lastError = error as Error;
          continue;
        }
      }

      if (!stream) {
        throw (
          lastError || new Error("Failed to access camera with any constraints")
        );
      }

      streamRef.current = stream;
      setIsCameraOpen(true);

      // Wait a bit for React to render the video element
      setTimeout(async () => {
        if (videoRef.current && streamRef.current) {
          try {
            await startVideoStream(videoRef.current, streamRef.current);
          } catch (videoError) {
            console.error("Failed to start video stream:", videoError);
            setCameraError(t("imageUpload.errors.startCameraFailed"));
          }
        }
      }, 100);
    } catch (cameraError) {
      console.error("Camera error:", cameraError);
      let errorMessage = t("imageUpload.errors.accessDenied");

      if (cameraError instanceof Error) {
        if (cameraError.name === "NotAllowedError") {
          errorMessage = t("imageUpload.errors.permissionDenied");
        } else if (cameraError.name === "NotFoundError") {
          errorMessage = t("imageUpload.errors.noCamera");
        } else if (cameraError.name === "NotReadableError") {
          errorMessage = t("imageUpload.errors.cameraInUse");
        } else if (cameraError.name === "OverconstrainedError") {
          errorMessage = t("imageUpload.errors.constraintsNotSupported");
        } else {
          errorMessage = `${t("imageUpload.errors.accessDenied")}: ${cameraError.message}`;
        }
      }

      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  }, [startVideoStream, t]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setIsVideoReady(false);
    setCameraError("");
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isVideoReady) {
      toast.error(t("imageUpload.cameraNotReady"));
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      toast.error(t("imageUpload.canvasNotAvailable"));
      return;
    }

    // Ensure video has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error(t("imageUpload.videoNotReady"));
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error(t("imageUpload.capturePhotoFailed"));
          return;
        }

        const fileName = `camera-capture-${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: "image/jpeg" });

        await addImages([file]);
        stopCamera();
      },
      "image/jpeg",
      0.9,
    );
  }, [addImages, stopCamera, isVideoReady, t]);

  const removeImage = useCallback(
    (imageId: string) => {
      setImages((prev) => {
        const updated = prev.filter((img) => img.id !== imageId);
        updateParentImages(updated);
        return updated;
      });

      const imageToRemove = images.find((img) => img.id === imageId);
      if (imageToRemove && imageToRemove.preview.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
    },
    [images, updateParentImages],
  );

  const retryUpload = useCallback(
    async (imageId: string) => {
      const image = images.find((img) => img.id === imageId);
      if (!image || !image.file) return;

      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, error: undefined, isUploading: true }
            : img,
        ),
      );

      try {
        await uploadSingleImage(imageId, image.file);
        setTimeout(() => {
          setImages((current) => {
            updateParentImages(current);
            return current;
          });
        }, 100);
      } catch {
        // Error already handled in uploadSingleImage
      }
    },
    [images, uploadSingleImage, updateParentImages],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const canAddMore = images.length < maxImages;
  const hasUploadingImages = images.some((img) => img.isUploading);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">{label || "Images"}</Label>
        <p className="text-sm text-muted-foreground mt-1">
          {description ||
            "Upload images from your device or take photos with your camera"}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={disabled || !canAddMore}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {t("imageUpload.chooseFiles")}
        </Button>

        <Button
          className="flex-1"
          disabled={disabled || !canAddMore}
          size="sm"
          type="button"
          variant="outline"
          onClick={startCamera}
        >
          <Camera className="w-4 h-4 mr-2" />
          {t("imageUpload.takePhoto")}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        multiple
        accept="image/*"
        className="hidden"
        disabled={disabled}
        type="file"
        onChange={handleFileSelect}
      />

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {t("imageUpload.takePhotoTitle")}
              </h3>
              <Button
                size="sm"
                type="button"
                variant="ghost"
                onClick={stopCamera}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {cameraError ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  {cameraError}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {t("imageUpload.errors.troubleshootingTip")}
                </p>
                <Button
                  className="mt-4"
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                >
                  {t("imageUpload.tryAgain")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {!isVideoReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                        <p className="text-sm text-muted-foreground">
                          {t("imageUpload.startingCamera")}
                        </p>
                      </div>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ display: isVideoReady ? "block" : "none" }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={!isVideoReady}
                    type="button"
                    onClick={capturePhoto}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isVideoReady
                      ? t("imageUpload.capture")
                      : t("imageUpload.pleaseWait")}
                  </Button>
                  <Button type="button" variant="outline" onClick={stopCamera}>
                    {t("imageUpload.cancel")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => {
            const fileDisplayName =
              image.file?.name ??
              (image.url
                ? image.url.split("/").pop() || image.url
                : t("imageUpload.chooseFiles"));

            return (
              <Card key={image.id} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {image.preview ? (
                    <img
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                      src={image.preview}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {image.isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}

                  {image.error && (
                    <div className="absolute inset-0 bg-destructive/90 flex items-center justify-center p-2">
                      <div className="text-center">
                        <AlertCircle className="w-6 h-6 text-white mx-auto mb-1" />
                        <p className="text-xs text-white">
                          {t("imageUpload.uploadFailed")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute top-2 right-2 flex gap-1">
                  {image.error && (
                    <Button
                      className="h-6 w-6 p-0"
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() => retryUpload(image.id)}
                    >
                      <Upload className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    className="h-6 w-6 p-0"
                    disabled={image.isUploading}
                    size="sm"
                    type="button"
                    variant="destructive"
                    onClick={() => removeImage(image.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">
                      {fileDisplayName}
                    </span>
                    {image.url && !image.isUploading && !image.error && (
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {hasUploadingImages && (
        <div className="text-sm text-muted-foreground text-center">
          {t("imageUpload.uploading")}
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        {t("imageUpload.imagesSelected", {
          count: images.length,
          max: maxImages,
        })}
      </div>
    </div>
  );
};
