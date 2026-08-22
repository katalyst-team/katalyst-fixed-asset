"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpsertRTLSFloorPlanMutation } from "@/hooks/api/fixed-assets";
import type { FaRTLSFloorPlanRoom } from "@/types/fixed-assets";

export const ROOM_TONE: Record<FaRTLSFloorPlanRoom["type"], string> = {
  gate: "rgba(100,116,139,0.08)",
  room: "rgba(59,130,246,0.07)",
  zone: "rgba(6,182,212,0.07)",
};

export function FloorPlanEditor({
  floor,
  onDone,
  open,
  organizationId,
  rooms,
  siteId,
  width,
  height,
}: {
  floor: string;
  height: number;
  onDone: () => void;
  open: boolean;
  organizationId: string;
  rooms: FaRTLSFloorPlanRoom[];
  siteId: string;
  width: number;
}) {
  const [draft, setDraft] = useState<FaRTLSFloorPlanRoom[]>(rooms);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<FaRTLSFloorPlanRoom["type"]>("room");
  const [x, setX] = useState("20");
  const [y, setY] = useState("20");
  const [w, setW] = useState("200");
  const [h, setH] = useState("120");
  const { isPending: isSaving, mutateAsync: saveFloorPlan } =
    useUpsertRTLSFloorPlanMutation({ organizationId });

  const startAdd = () => {
    setEditingIdx(draft.length);
    setLabel("");
    setType("room");
    setX("20");
    setY("20");
    setW("200");
    setH("120");
  };

  const startEdit = (idx: number) => {
    const r = draft[idx];
    setEditingIdx(idx);
    setLabel(r.label);
    setType(r.type);
    setX(String(r.x));
    setY(String(r.y));
    setW(String(r.w));
    setH(String(r.h));
  };

  const commitRoom = () => {
    if (!label || editingIdx === null) return;
    const room: FaRTLSFloorPlanRoom = {
      h: Number(h) || 1,
      id: editingIdx < draft.length ? draft[editingIdx].id : `room-${Date.now()}`,
      label,
      type,
      w: Number(w) || 1,
      x: Number(x) || 0,
      y: Number(y) || 0,
    };
    setDraft((prev) => {
      const next = [...prev];
      if (editingIdx < prev.length) {
        next[editingIdx] = room;
      } else {
        next.push(room);
      }
      return next;
    });
    setEditingIdx(null);
  };

  const removeRoom = (idx: number) => {
    setDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    await saveFloorPlan({
      floor,
      floor_plan_url: "",
      height,
      rooms: draft,
      site_id: siteId,
      width,
    });
    onDone();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onDone(); }}>
      <DialogContent style={{ maxWidth: 520 }}>
        <DialogHeader>
          <DialogTitle>Edit floor plan · {siteId} floor {floor}</DialogTitle>
        </DialogHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
          {draft.length === 0 && (
            <p className="text-sm text-muted-foreground">No rooms yet. Add zones, rooms, and gates to lay out this floor.</p>
          )}
          {draft.map((r, idx) => (
            <div key={r.id} style={{ alignItems: "center", display: "flex", gap: 8 }}>
              <span className="ks-badge outline">{r.type}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{r.label}</span>
              <span style={{ color: "hsl(var(--text-3))", fontFamily: "ui-monospace, monospace", fontSize: 11 }}>
                {r.w}×{r.h} @ {r.x},{r.y}
              </span>
              <button className="ks-btn ks-btn-ghost ks-btn-icon ks-btn-sm" type="button" onClick={() => startEdit(idx)}>
                <Pencil size={13} />
              </button>
              <button className="ks-btn ks-btn-ghost ks-btn-icon ks-btn-sm" type="button" onClick={() => removeRoom(idx)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 8, display: "flex", flexDirection: "column", gap: 8, padding: 10 }}>
          {editingIdx !== null ? (
            <>
              <div style={{ display: "flex", gap: 8 }}>
                <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
                <Select value={type} onValueChange={(v) => setType(v as FaRTLSFloorPlanRoom["type"])}>
                  <SelectTrigger style={{ width: 110 }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="room">room</SelectItem>
                    <SelectItem value="zone">zone</SelectItem>
                    <SelectItem value="gate">gate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Input placeholder="x" type="number" value={x} onChange={(e) => setX(e.target.value)} />
                <Input placeholder="y" type="number" value={y} onChange={(e) => setY(e.target.value)} />
                <Input placeholder="w" type="number" value={w} onChange={(e) => setW(e.target.value)} />
                <Input placeholder="h" type="number" value={h} onChange={(e) => setH(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button size="sm" onClick={commitRoom}>{editingIdx < draft.length ? "Update" : "Add"}</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingIdx(null)}>Cancel</Button>
              </div>
            </>
          ) : (
            <button className="ks-btn ks-btn-sm" type="button" onClick={startAdd}>
              <Plus size={13} />
              Add room
            </button>
          )}
        </div>
        <DialogFooter>
          <Button disabled={isSaving} onClick={handleSave}>{isSaving ? "Saving…" : "Save floor plan"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

