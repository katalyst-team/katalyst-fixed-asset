import { useCallback } from "react";

import useUpsertZplTemplateMutation from "@/hooks/api/zpl-template/useUpsertZplTemplateMutation";
import type {
  ZplTemplateFieldMapping,
  ZplTemplateTuning,
} from "@/types/zplTemplate";

interface UseZplTemplateSaveParams {
  content: string;
  defaultName: string;
  fieldMappings: Record<string, ZplTemplateFieldMapping[]>;
  name: string;
  organizationId: string;
  tuning: ZplTemplateTuning;
}

/**
 * Stores the working ZPL template, scoped to the organization.
 *
 * Saving is tied to printing rather than to editing: only a template that
 * actually produced labels is worth keeping. The backend keys templates by
 * content hash, so printing the same ZPL repeatedly updates one row instead
 * of piling up duplicates.
 */
export const useZplTemplateSave = ({
  content,
  defaultName,
  fieldMappings,
  name,
  organizationId,
  tuning,
}: UseZplTemplateSaveParams) => {
  const { mutateAsync: upsertZplTemplate, isPending: isSaving } =
    useUpsertZplTemplateMutation({ organizationId });

  // Awaitable so a caller that unmounts right after saving (the print modal
  // closes itself once a batch finishes) can keep the observer alive until
  // the mutation settles.
  const saveZplTemplate = useCallback(async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || !organizationId) return;

    await upsertZplTemplate({
      content: trimmedContent,
      field_mappings: fieldMappings,
      name: name.trim() || defaultName,
      tuning,
    }).catch(() => undefined);
  }, [
    content,
    defaultName,
    fieldMappings,
    name,
    organizationId,
    tuning,
    upsertZplTemplate,
  ]);

  return { isSaving, saveZplTemplate };
};

export default useZplTemplateSave;
