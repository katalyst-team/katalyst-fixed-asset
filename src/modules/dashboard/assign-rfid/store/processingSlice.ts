export interface ProcessingSlice {
  isProcessing: boolean;

  // Actions
  setIsProcessing: (isProcessing: boolean) => void;
}

export const createProcessingSlice = (
  set: (partial: Partial<ProcessingSlice>) => void
): ProcessingSlice => ({
  // Initial state
  isProcessing: false,

  // Actions
  setIsProcessing: (isProcessing) => set({ isProcessing }),
});
