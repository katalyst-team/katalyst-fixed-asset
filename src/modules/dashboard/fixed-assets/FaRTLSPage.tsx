"use client";

import { MapPin, Pencil, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo, useState } from "react";

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
import { useUser } from "@/context/user-context";
import {
  useCreateSavedQueryMutation,
  useDeleteSavedQueryMutation,
  useGetAssetRegisterQuery,
  useGetRTLSFloorPlanQuery,
  useGetRTLSPositionsQuery,
  useGetRTLSSitesQuery,
  useGetSavedQueriesQuery,
} from "@/hooks/api/fixed-assets";
import { useUrlFilterSync } from "@/hooks/useUrlFilterSync";
import {
  FaKpiStrip,
  FaShellHead,
  FaStat,
  formatIDRShort,
} from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import { FloorPlanEditor, PulseDot, ROOM_TONE } from "@/modules/dashboard/fixed-assets/FaRTLSFloorPlanEditor";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals";
import { useFaPermission } from "@/modules/dashboard/fixed-assets/useFaPermission";

export function FaRTLSPage() {
  const { t } = useTranslation("fixed-assets");
  const router = useRouter();
  const { openModal } = useFaModal();
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const [siteId, setSiteId] = useState("");
  const [floor, setFloor] = useState("");
  const [queryOpen, setQueryOpen] = useState(false);
  const [queryName, setQueryName] = useState("");
  const [querySite, setQuerySite] = useState("");
  const [queryFloor, setQueryFloor] = useState("");
  const hasLocation = Boolean(siteId && floor);

  const { syncToUrl } = useUrlFilterSync<{ floor: string; site: string }>({
    fromQuery: (q) => ({
      floor: typeof q.floor === "string" ? q.floor : "",
      site: typeof q.site === "string" ? q.site : "",
    }),
    onInit: (f) => {
      if (f.site) setSiteId(f.site);
      if (f.floor) setFloor(f.floor);
    },
    toQuery: (f) => ({ floor: f.floor, site: f.site }),
  });

  const { data: posResp, isError, isLoading } = useGetRTLSPositionsQuery({
    enabled: hasLocation,
    floor,
    organizationId,
    site_id: siteId,
  });
  const { data: fpResp } = useGetRTLSFloorPlanQuery({
    enabled: hasLocation,
    floor,
    organizationId,
    site_id: siteId,
  });
  const { data: savedQueriesResp } = useGetSavedQueriesQuery({ organizationId });
  const { data: sitesResp } = useGetRTLSSitesQuery({ organizationId });
  const { data: assetResp } = useGetAssetRegisterQuery({ organizationId });
  const { mutateAsync: createSavedQuery } = useCreateSavedQueryMutation({
    organizationId,
  });
  const { mutateAsync: deleteSavedQuery } = useDeleteSavedQueryMutation({
    organizationId,
  });
  const { canCreate, canDelete } = useFaPermission();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const positions = posResp?.data?.positions ?? [];
  const anchors = posResp?.data?.anchors ?? [];
  const rtlsSummary = posResp?.data?.summary;
  const avgAccuracy = positions.length > 0
    ? (positions.reduce((sum, p) => sum + p.accuracy_m, 0) / positions.length).toFixed(1)
    : null;
  const floorPlan = fpResp?.data;
  const rooms = floorPlan?.rooms ?? [];
  const savedQueries = useMemo(
    () => savedQueriesResp?.data?.queries ?? [],
    [savedQueriesResp],
  );
  const sites = useMemo(() => sitesResp?.data?.sites ?? [], [sitesResp]);
  const locations = useMemo(() => {
    if (sites.length > 0) {
      return sites.map((s) => ({ floor: s.floor, site_id: s.site_id }));
    }
    return Array.from(
      new Map(savedQueries.map((q) => [`${q.site_id}|${q.floor}`, q])).values(),
    ).map((q) => ({ floor: q.floor, site_id: q.site_id }));
  }, [savedQueries, sites]);

  useEffect(() => {
    if (hasLocation || locations.length === 0) return;
    setSiteId(locations[0].site_id);
    setFloor(locations[0].floor);
  }, [floor, hasLocation, locations, siteId]);
  const assets = assetResp?.data ?? [];
  const assetById = new Map(assets.map((a) => [a.id, a]));
  const vbW = floorPlan?.width ?? 600;
  const vbH = floorPlan?.height ?? 360;

  const selectedPosition = positions.find((p) => p.asset_id === selectedAssetId) ?? positions[0] ?? null;
  const selectedAsset = selectedPosition ? assetById.get(selectedPosition.asset_id) : undefined;
  const infoRows = selectedPosition
    ? [
        { k: t("page.rtls.info.asset"), v: selectedPosition.name },
        { k: t("page.rtls.info.assetId"), v: selectedPosition.asset_id },
        { k: t("page.rtls.info.siteFloor"), v: t("page.rtls.siteFloor", { floor, site: siteId }) },
        { k: t("page.rtls.info.custodian"), v: selectedAsset?.custodian ?? "—" },
        { k: t("page.rtls.info.lastSeen"), v: selectedPosition.last_seen },
        { k: t("page.rtls.info.accuracy"), v: `±${selectedPosition.accuracy_m.toFixed(1)} m` },
        { k: t("page.rtls.info.value"), v: selectedAsset ? formatIDRShort(selectedAsset.val) : "—" },
      ]
    : [];

  const handleSelectLocation = (nextSite: string, nextFloor: string) => {
    setSiteId(nextSite);
    setFloor(nextFloor);
    syncToUrl({ floor: nextFloor, site: nextSite });
  };

  const handleSaveQuery = async () => {
    if (!queryName || !querySite || !queryFloor) return;
    await createSavedQuery({ floor: queryFloor, name: queryName, site_id: querySite });
    handleSelectLocation(querySite, queryFloor);
    setQueryOpen(false);
    setQueryName("");
  };

  const handleDeleteQuery = async (queryId: string) => {
    await deleteSavedQuery({ queryId });
  };

  return (
    <div>
      <FaShellHead
        actions={
          <>
            <button
              className="ks-btn ks-btn-sm"
              type="button"
              onClick={() => openModal("locateAsset")}
            >
              <Search size={14} />
              {t("page.rtls.locateAsset")}
            </button>
            <Select
              value={siteId ? `${siteId}|${floor}` : ""}
              onValueChange={(key) => {
                const loc = locations.find((l) => `${l.site_id}|${l.floor}` === key);
                if (loc) handleSelectLocation(loc.site_id, loc.floor);
              }}
            >
              <SelectTrigger className="w-[190px]">
                <SelectValue
                  placeholder={locations.length > 0 ? t("page.rtls.selectLocation") : t("page.rtls.noSavedLocation")}
                />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem
                    key={`${l.site_id}|${l.floor}`}
                    value={`${l.site_id}|${l.floor}`}
                  >
                    {t("page.rtls.siteFloor", { floor: l.floor, site: l.site_id })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        desc={t("page.rtls.description")}
        title={t("page.rtls.title")}
      />

      <FaKpiStrip>
        <FaStat label={t("page.rtls.kpi.tracked")} tone="brand" value={String(positions.length)} />
        <FaStat label={t("page.rtls.kpi.accuracy")} tone="info" value={avgAccuracy ? `±${avgAccuracy} m` : "—"} />
        <FaStat label={t("page.rtls.kpi.zones")} tone="success" value={String(rtlsSummary?.zones_active ?? "—")} />
        <FaStat
          label={t("page.rtls.kpi.missing24h")}
          sub={t("page.rtls.kpi.missing24hSub")}
          tone="danger"
          value={String(rtlsSummary?.missing_24h ?? "—")}
        />
      </FaKpiStrip>

      <FaQueryState
        emptyDescription={
          hasLocation
            ? t("page.rtls.noTrackedDesc")
            : t("page.rtls.noLocationDesc")
        }
        emptyTitle={hasLocation ? t("page.rtls.noTrackedTitle") : t("page.rtls.noLocationTitle")}
        isEmpty={!hasLocation || positions.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="ks-card">
          <div className="ks-card-head">
            <div>
              <div className="ks-card-title">
                {siteId ? t("page.rtls.siteFloor", { floor, site: siteId }) : t("page.rtls.noLocationTitle")}
              </div>
              <div className="ks-card-desc">
                {t("page.rtls.liveSummary", { anchors: anchors.length, assets: positions.length })}
              </div>
            </div>
            <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
              <button className="ks-btn ks-btn-sm" type="button" onClick={() => setEditorOpen(true)}>
                <Pencil size={13} />
                {t("page.rtls.editLayout")}
              </button>
              <span className="ks-badge success">{t("page.rtls.live")}</span>
            </div>
          </div>
          <div className="ks-card-body">
            <svg
              className="h-auto w-full"
              style={{ color: "hsl(var(--text-2))" }}
              viewBox={`0 0 ${vbW} ${vbH}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  height="20"
                  id="rtls-grid"
                  patternUnits="userSpaceOnUse"
                  width="20"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect fill="url(#rtls-grid)" height={vbH} width={vbW} x="0" y="0" />

              {floorPlan?.floor_plan_url && (
                <image
                  height={vbH}
                  href={floorPlan.floor_plan_url}
                  opacity="0.5"
                  width={vbW}
                  x="0"
                  y="0"
                />
              )}

              {rooms.map((r) => (
                <g key={r.id}>
                  <rect
                    fill={ROOM_TONE[r.type] ?? ROOM_TONE.room}
                    height={r.h}
                    rx="4"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                    width={r.w}
                    x={r.x}
                    y={r.y}
                  />
                  <text
                    fill="currentColor"
                    fillOpacity="0.7"
                    fontSize="11"
                    fontWeight="600"
                    x={r.x + 10}
                    y={r.y + 20}
                  >
                    {r.label}
                  </text>
                </g>
              ))}

              {anchors.map((a) => (
                <g key={a.id}>
                  <circle cx={a.x} cy={a.y} fill="#22d3ee" r="5" />
                  <circle
                    cx={a.x}
                    cy={a.y}
                    fill="none"
                    r="9"
                    stroke="#22d3ee"
                    strokeOpacity="0.5"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {positions.map((p) => (
                <g
                  key={p.asset_id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedAssetId(p.asset_id)}
                >
                  <PulseDot color={p.asset_id === selectedPosition?.asset_id ? "#ef4444" : "#3b82f6"} x={p.x} y={p.y} />
                </g>
              ))}
            </svg>

            <div className="ks-chart-legend" style={{ marginTop: 12 }}>
              <span className="ks-legend-item">
                <span
                  className="ks-legend-swatch"
                  style={{ background: "#22d3ee" }}
                />
                BLE {t("page.rtls.legend.anchor")}
              </span>
              <span className="ks-legend-item">
                <span
                  className="ks-legend-swatch"
                  style={{ background: "#3b82f6" }}
                />
                {t("page.rtls.legend.asset")}
              </span>
              <span className="ks-legend-item">
                <span
                  className="ks-legend-swatch"
                  style={{ background: "#ef4444" }}
                />
                {t("page.rtls.legend.alert")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">
                {selectedPosition ? t("page.rtls.selectedNamed", { id: selectedPosition.asset_id }) : t("page.rtls.selected")}
              </div>
              <MapPin size={14} />
            </div>
            <div className="ks-card-body">
              {selectedPosition ? (
                <>
              <div className="grid grid-cols-2 gap-3">
                {infoRows.map((row) => (
                  <div key={row.k}>
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {row.k}
                    </div>
                    <div className="text-sm font-medium">{row.v}</div>
                  </div>
                ))}
              </div>
              <button
                className="ks-btn ks-btn-primary ks-btn-sm"
                style={{ marginTop: 14 }}
                type="button"
                onClick={() => router.push(`/dashboard/fixed-assets/register/${selectedPosition.asset_id}/`)}
              >
                <Search size={14} />
                {t("page.rtls.openProfile")}
              </button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t("page.rtls.noAssetsFloor")}</p>
              )}
            </div>
          </div>

          <div className="ks-card">
            <div className="ks-card-head">
              <div className="ks-card-title">{t("page.rtls.savedQueries")}</div>
              {canCreate && (
                <button
                  className="ks-btn ks-btn-sm"
                  type="button"
                  onClick={() => setQueryOpen(true)}
                >
                  {t("page.rtls.saveQuery")}
                </button>
              )}
            </div>
            <div className="ks-card-body">
              <div className="flex flex-col gap-2">
                {savedQueries.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center gap-2"
                  >
                    <button
                      className="ks-btn ks-btn-ghost ks-btn-sm"
                      style={{ flex: 1, justifyContent: "flex-start" }}
                      type="button"
                      onClick={() => handleSelectLocation(q.site_id, q.floor)}
                    >
                      <MapPin size={13} />
                      {q.name}
                    </button>
                    {canDelete && (
                      <button
                        aria-label={t("page.rtls.deleteQuery")}
                        className="ks-btn ks-btn-ghost ks-btn-icon ks-btn-sm"
                        type="button"
                        onClick={() => handleDeleteQuery(q.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </FaQueryState>
      <Dialog
        open={queryOpen}
        onOpenChange={(open) => {
          setQueryOpen(open);
          if (open) {
            setQuerySite(siteId);
            setQueryFloor(floor);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("page.rtls.saveQueryTitle")}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder={t("page.rtls.queryNamePlaceholder")}
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveQuery(); }}
          />
          <Input
            placeholder={t("page.rtls.siteIdPlaceholder")}
            value={querySite}
            onChange={(e) => setQuerySite(e.target.value)}
          />
          <Input
            placeholder={t("page.rtls.floorPlaceholder")}
            value={queryFloor}
            onChange={(e) => setQueryFloor(e.target.value)}
          />
          <DialogFooter>
            <Button
              disabled={!queryName || !querySite || !queryFloor}
              onClick={handleSaveQuery}
            >
              {t("page.rtls.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FloorPlanEditor
        floor={floor}
        height={vbH}
        open={editorOpen}
        organizationId={organizationId}
        rooms={rooms}
        siteId={siteId}
        width={vbW}
        onDone={() => setEditorOpen(false)}
      />
    </div>
  );
}
