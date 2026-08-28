"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

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
  { label: "Disposal", value: "disposal" },
  { label: "Transfer", value: "transfer" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Acquisition", value: "acquisition" },
  { label: "Write-off", value: "write-off" },
  { label: "Revaluation", value: "revaluation" },
];

const SCOPES = [
  { label: "Organization", value: "organization" },
  { label: "Category", value: "category" },
  { label: "Cost center", value: "cost_center" },
  { label: "Store", value: "store" },
];

export function ApprovalRuleModal({ onClose, open }: ApprovalRuleModalProps) {
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
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>New approval rule</DialogTitle>
          <DialogDescription>
            Multi-step approval workflow with assigned approvers per step
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label isRequired htmlFor="rule-name">
              Rule name
            </Label>
            <Input
              id="rule-name"
              placeholder="e.g. Disposal above threshold"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rule-type">Approval type</Label>
              <Select
                value={approvalType}
                onValueChange={(value) => setApprovalType(value as ApprovalType)}
              >
                <SelectTrigger id="rule-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPROVAL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rule-scope">Scope</Label>
              <Select
                value={scope}
                onValueChange={(value) => setScope(value as ApprovalScope)}
              >
                <SelectTrigger id="rule-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPES.map((scopeOption) => (
                    <SelectItem key={scopeOption.value} value={scopeOption.value}>
                      {scopeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {needsScopeValue && (
            <div className="grid gap-2">
              <Label isRequired htmlFor="rule-scope-value">
                Scope value
              </Label>
              <Input
                id="rule-scope-value"
                placeholder="e.g. it, store-uuid"
                value={scopeValue}
                onChange={(e) => setScopeValue(e.target.value)}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label>Workflow steps</Label>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  aria-label={`Step ${index + 1} name`}
                  placeholder="Step name"
                  value={step.step_name}
                  onChange={(e) => updateStep(index, { step_name: e.target.value })}
                />
                <Select
                  value={step.approver_id || undefined}
                  onValueChange={(approverId) => updateStep(index, { approver_id: approverId })}
                >
                  <SelectTrigger aria-label={`Step ${index + 1} approver`} className="w-[180px]">
                    <SelectValue placeholder="Approver" />
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
                  aria-label={`Remove step ${index + 1}`}
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
              Add step
            </button>
          </div>
        </div>

        <DialogFooter>
          <button className="ks-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={cn("ks-btn ks-btn-primary", !isValid && "opacity-50")}
            disabled={!isValid}
            type="button"
            onClick={handleSubmit}
          >
            Create rule
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
