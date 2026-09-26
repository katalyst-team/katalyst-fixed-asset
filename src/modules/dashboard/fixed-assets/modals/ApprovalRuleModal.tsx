"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/user-context";
import {
  useCreateApprovalRuleMutation,
  useGetFAUsersQuery,
} from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";
import type { ApprovalScope, ApprovalType } from "@/types/fixed-assets";

interface ApprovalRuleModalProps {
  onClose: () => void;
  open: boolean;
}

interface RuleStep {
  approver_id: string;
  step_name: string;
}

const APPROVAL_TYPES = [
  "disposal",
  "transfer",
  "maintenance",
  "acquisition",
  "write-off",
  "revaluation",
] as const;

const SCOPES = ["organization", "category", "cost_center", "store"] as const;

export function ApprovalRuleModal({ onClose, open }: ApprovalRuleModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { mutateAsync } = useCreateApprovalRuleMutation({ organizationId });
  const { data: usersResp } = useGetFAUsersQuery({
    limit: 100,
    organizationId,
  });
  const users = usersResp?.data?.users ?? [];

  const [approvalType, setApprovalType] = useState<ApprovalType>("disposal");
  const [name, setName] = useState("");
  const [scope, setScope] = useState<ApprovalScope>("organization");
  const [scopeValue, setScopeValue] = useState("");
  const [steps, setSteps] = useState<RuleStep[]>([
    { approver_id: "", step_name: "Review" },
  ]);

  const approvalTypeLabels: Record<(typeof APPROVAL_TYPES)[number], string> = {
    acquisition: t("modals.approvalRule.typeAcquisition"),
    disposal: t("modals.approvalRule.typeDisposal"),
    maintenance: t("modals.approvalRule.typeMaintenance"),
    revaluation: t("modals.approvalRule.typeRevaluation"),
    transfer: t("modals.approvalRule.typeTransfer"),
    "write-off": t("modals.approvalRule.typeWriteOff"),
  };

  const scopeLabels: Record<(typeof SCOPES)[number], string> = {
    category: t("modals.approvalRule.scopeCategory"),
    cost_center: t("modals.approvalRule.scopeCostCenter"),
    organization: t("modals.approvalRule.scopeOrganization"),
    store: t("modals.approvalRule.scopeStore"),
  };

  const needsScopeValue = scope !== "organization";
  const stepsValid =
    steps.length > 0 &&
    steps.every((step) => step.step_name.trim().length > 0 && step.approver_id !== "");
  const isValid =
    name.trim().length > 0 && stepsValid && (!needsScopeValue || scopeValue.trim().length > 0);

  function updateStep(index: number, patch: Partial<RuleStep>) {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, ...patch } : step)),
    );
  }

  async function handleSubmit() {
    if (!isValid) return;
    await mutateAsync({
      approval_type: approvalType,
      name: name.trim(),
      scope,
      scope_value: needsScopeValue ? scopeValue.trim() : undefined,
      workflow_steps: steps.map((step) => ({
        approver_id: step.approver_id,
        step_name: step.step_name.trim(),
      })),
    });
    toast.success(t("toasts.approvalRuleCreated"));
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t("modals.approvalRule.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.approvalRule.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label isRequired htmlFor="rule-name">
              {t("modals.approvalRule.ruleName")}
            </Label>
            <Input
              id="rule-name"
              placeholder={t("modals.approvalRule.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rule-type">
                {t("modals.approvalRule.approvalType")}
              </Label>
              <Select
                value={approvalType}
                onValueChange={(value) => setApprovalType(value as ApprovalType)}
              >
                <SelectTrigger id="rule-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPROVAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {approvalTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rule-scope">
                {t("modals.approvalRule.scope")}
              </Label>
              <Select
                value={scope}
                onValueChange={(value) => setScope(value as ApprovalScope)}
              >
                <SelectTrigger id="rule-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPES.map((scopeOption) => (
                    <SelectItem key={scopeOption} value={scopeOption}>
                      {scopeLabels[scopeOption]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {needsScopeValue && (
            <div className="grid gap-2">
              <Label isRequired htmlFor="rule-scope-value">
                {t("modals.approvalRule.scopeValue")}
              </Label>
              <Input
                id="rule-scope-value"
                placeholder={t("modals.approvalRule.scopeValuePlaceholder")}
                value={scopeValue}
                onChange={(e) => setScopeValue(e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label>{t("modals.approvalRule.workflowSteps")}</Label>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  aria-label={t("modals.approvalRule.stepNameAria", {
                    number: index + 1,
                  })}
                  placeholder={t("modals.approvalRule.stepNamePlaceholder")}
                  value={step.step_name}
                  onChange={(e) => updateStep(index, { step_name: e.target.value })}
                />
                <Select
                  value={step.approver_id || undefined}
                  onValueChange={(approverId) => updateStep(index, { approver_id: approverId })}
                >
                  <SelectTrigger
                    aria-label={t("modals.approvalRule.stepApproverAria", {
                      number: index + 1,
                    })}
                    className="w-[180px]"
                  >
                    <SelectValue
                      placeholder={t("modals.approvalRule.approverPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  aria-label={t("modals.approvalRule.removeStepAria", {
                    number: index + 1,
                  })}
                  className="ks-btn ks-btn-icon"
                  disabled={steps.length === 1}
                  type="button"
                  onClick={() =>
                    setSteps((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() =>
                setSteps((prev) => [...prev, { approver_id: "", step_name: "" }])
              }
            >
              <Plus size={14} />
              {t("modals.approvalRule.addStep")}
            </button>
          </div>
        </div>

        <DialogFooter>
          <button className="ks-btn" type="button" onClick={onClose}>
            {t("modals.approvalRule.cancel")}
          </button>
          <button
            className={cn("ks-btn ks-btn-primary", !isValid && "opacity-50")}
            disabled={!isValid}
            type="button"
            onClick={handleSubmit}
          >
            {t("modals.approvalRule.createRule")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
