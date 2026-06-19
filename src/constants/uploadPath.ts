/**
 * Upload Path Configuration
 * Centralized configuration for file upload paths in the application
 */

export enum UploadPath {
  /** Android Application Package (.apk) */
  APK = "apk",
  /** iOS Application Package (.ipa) */
  IPA = "ipa",
  /** Images */
  IMAGES = "images",
  /** Documents */
  DOCUMENTS = "documents",
  /** Videos */
  VIDEOS = "videos",
  /** Audio files */
  AUDIO = "audio",
  /** Archive files */
  ARCHIVES = "archives",
  /** Configuration files */
  CONFIG = "config",
  /** Logs */
  LOGS = "logs",
  /** Generic files */
  GENERIC = "generic",

  // Feature-specific paths

  /** Stock audit images */
  STOCK_AUDIT_IMAGE = "stock-audit-image",

  /** Section audit images */
  SECTION_AUDIT_IMAGE = "section-audit-image",

  /** Move area images */
  MOVE_AREA_IMAGE = "move-area-image",

  /** KBM assign area images */
  KBM_ASSIGN_AREA_IMAGE = "kbm-assign-area-image",

  /** Product images */
  PRODUCT_IMAGE = "product-image",

  /** Inbound images */
  INBOUND_IMAGE = "inbound-image",

  /** Outbound images */
  OUTBOUND_IMAGE = "outbound-image",
}

/**
 * Default upload path to use when no specific mapping is found
 */
export const DEFAULT_UPLOAD_PATH = UploadPath.GENERIC;

/**
 * Get upload path by file extension
 * Determines the appropriate upload path based on the file extension.
 *
 * @param filename - File name
 * @returns Upload path
 */
export function getUploadPathByExtension(filename: string): UploadPath {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  const extensionMap: Record<string, UploadPath> = {
    "7z": UploadPath.ARCHIVES,
    apk: UploadPath.APK,
    avi: UploadPath.VIDEOS,
    bmp: UploadPath.IMAGES,
    doc: UploadPath.DOCUMENTS,
    docx: UploadPath.DOCUMENTS,
    flac: UploadPath.AUDIO,
    gif: UploadPath.IMAGES,
    gz: UploadPath.ARCHIVES,
    ico: UploadPath.IMAGES,
    ini: UploadPath.CONFIG,
    ipa: UploadPath.IPA,
    jpeg: UploadPath.IMAGES,
    jpg: UploadPath.IMAGES,
    json: UploadPath.CONFIG,
    log: UploadPath.LOGS,
    m4a: UploadPath.AUDIO,
    md: UploadPath.DOCUMENTS,
    mkv: UploadPath.VIDEOS,
    mov: UploadPath.VIDEOS,
    mp3: UploadPath.AUDIO,
    mp4: UploadPath.VIDEOS,
    ogg: UploadPath.AUDIO,
    pdf: UploadPath.DOCUMENTS,
    png: UploadPath.IMAGES,
    ppt: UploadPath.DOCUMENTS,
    pptx: UploadPath.DOCUMENTS,
    rar: UploadPath.ARCHIVES,
    svg: UploadPath.IMAGES,
    tar: UploadPath.ARCHIVES,
    txt: UploadPath.DOCUMENTS,
    wav: UploadPath.AUDIO,
    webm: UploadPath.VIDEOS,
    webp: UploadPath.IMAGES,
    xls: UploadPath.DOCUMENTS,
    xlsx: UploadPath.DOCUMENTS,
    xml: UploadPath.CONFIG,
    yaml: UploadPath.CONFIG,
    yml: UploadPath.CONFIG,
    zip: UploadPath.ARCHIVES,
  };

  return extensionMap[ext] || DEFAULT_UPLOAD_PATH;
}

/**
 * Get upload path for a specific feature ID.
 * Maps feature IDs to their corresponding upload paths.
 *
 * @param featureId - Feature identifier
 * @returns Upload path for the feature, or GENERIC if not found
 */
export function getUploadPathByFeatureId(featureId: string): UploadPath {
  switch (featureId) {
    case "stock-audit":
      return UploadPath.STOCK_AUDIT_IMAGE;
    case "section-audit":
      return UploadPath.SECTION_AUDIT_IMAGE;
    case "move-area":
      return UploadPath.MOVE_AREA_IMAGE;
    case "kbm-assign-area":
      return UploadPath.KBM_ASSIGN_AREA_IMAGE;
    case "product":
      return UploadPath.PRODUCT_IMAGE;
    case "inbound":
      return UploadPath.INBOUND_IMAGE;
    case "outbound":
      return UploadPath.OUTBOUND_IMAGE;
    default:
      return DEFAULT_UPLOAD_PATH;
  }
}
