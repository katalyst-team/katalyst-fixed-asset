"use client";

import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDeleteZplTemplateMutation from "@/hooks/api/zpl-template/useDeleteZplTemplateMutation";
import useGetZplTemplateListQuery from "@/hooks/api/zpl-template/useGetZplTemplateListQuery";
import type { ZplTemplateType } from "@/types/zplTemplate";

interface ZplTemplatePickerProps {
  // False once the user has their own ZPL in the editor, which suppresses the
  // initial auto-apply so their work is never overwritten.
  isEmpty: boolean;
  isSaving: boolean;
  name: string;
  organizationId: string;
  onApply: (template: ZplTemplateType) => void;
  onNameChange: (name: string) => void;
}

const ZplTemplatePicker = ({
  isEmpty,
  isSaving,
  name,
  organizationId,
  onApply,
  onNameChange,
}: ZplTemplatePickerProps) => {
  const [selectedId, setSelectedId] = useState<string>("");

  const { data } = useGetZplTemplateListQuery({ organizationId });
  const templates = useMemo(
    () => data?.data?.zpl_templates ?? [],
    [data?.data?.zpl_templates]
  );

  const { mutate: deleteTemplate, isPending: isDeleting } =
    useDeleteZplTemplateMutation({ organizationId });

  const handleApply = useCallback(
    (templateId: string) => {
      const template = templates.find((item) => item.id === templateId);
      if (!template) return;
      setSelectedId(templateId);
      onNameChange(template.name);
      onApply(template);
    },
    [templates, onApply, onNameChange]
  );

  // Load the most recently used template on open, so the common case needs no
  // interaction at all. Runs at most once per mount and never once the user
  // has typed or picked something.
  const hasAutoAppliedRef = useRef(false);
  useEffect(() => {
    if (hasAutoAppliedRef.current) return;
    if (!isEmpty || selectedId || templates.length === 0) return;

    hasAutoAppliedRef.current = true;
    handleApply(templates[0].id);
  }, [isEmpty, selectedId, templates, handleApply]);

  const handleDelete = () => {
    if (!selectedId) return;
    deleteTemplate(
      { zplTemplateId: selectedId },
      { onSuccess: () => setSelectedId("") }
    );
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1">
        <Label>Recent templates</Label>
        <div className="flex gap-2">
          <Select value={selectedId} onValueChange={handleApply}>
            <SelectTrigger>
              <SelectValue placeholder="No templates yet" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            aria-label="Delete template"
            disabled={!selectedId || isDeleting}
            size="icon"
            title="Delete template"
            variant="outline"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Template name</Label>
        <Input
          placeholder="e.g. Asset label 40x60"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {isSaving ? "Saving template…" : "Saved automatically after a successful print"}
        </p>
      </div>
    </div>
  );
};

export default ZplTemplatePicker;
