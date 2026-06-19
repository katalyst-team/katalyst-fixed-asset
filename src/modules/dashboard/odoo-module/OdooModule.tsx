import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import { useExecuteOdooProxyMutation } from "@/hooks/api/odoo-module";
import { OdooProxyAction, OdooProxyMetadata } from "@/types/odoo-module";

const initialBodies: Record<string, string> = {
  assign_packs: JSON.stringify(
    {
      assignments: [
        {
          move_id: 0,
          picking_id: 0,
          product_id: 0,
          quantity: 0,
          rfid: "string",
          store_to: 0,
        },
      ],
      manufacturing: [
        {
          mo_id: 0,
          move_lines: [
            {
              product_id: 0,
              rfid: "string",
            },
          ],
          qty_producing: 0,
        },
      ],
    },
    null,
    2,
  ),
  deactivate_packs: JSON.stringify(
    {
      rfid: ["string"],
    },
    null,
    2,
  ),
  register_rfid: JSON.stringify(
    {
      rfids: [
        {
          epc_code: "string",
          name: "string",
        },
      ],
    },
    null,
    2,
  ),
  review_unpack: JSON.stringify(
    {
      rfid: ["string"],
    },
    null,
    2,
  ),
  stock_audit: JSON.stringify(
    {
      rfids: [
        {
          rfid: "string",
        },
      ],
    },
    null,
    2,
  ),
  stock_opname: JSON.stringify(
    {
      items: [
        {
          lot_id: 20361,
          product_id: 15153,
          qty: 87,
          rfid: "UC0235",
        },
      ],
    },
    null,
    2,
  ),
};

const getActions: Array<{
  action: OdooProxyAction;
  label: string;
  needsId?: boolean;
}> = [
  { action: "list_rfids", label: "List RFID" },
  { action: "list_transfers", label: "List Transfers" },
  { action: "list_products", label: "List Products" },
  { action: "get_product_detail", label: "Get Product Detail", needsId: true },
  { action: "list_locations", label: "List Locations" },
  {
    action: "get_location_detail",
    label: "Get Location Detail",
    needsId: true,
  },
];

const postActions: Array<{ action: OdooProxyAction; title: string }> = [
  { action: "register_rfid", title: "Register RFID" },
  { action: "assign_packs", title: "Assign RFID to Packs" },
  { action: "deactivate_packs", title: "Deactivate Packs" },
  { action: "review_unpack", title: "Review Unpack" },
  { action: "stock_audit", title: "Stock Audit" },
  { action: "stock_opname", title: "Stock Opname" },
];

const OdooModule: React.FC = () => {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const mutation = useExecuteOdooProxyMutation();

  const [query, setQuery] = React.useState("");
  const [resourceId, setResourceId] = React.useState("");
  const [result, setResult] = React.useState("");
  const [metadata, setMetadata] = React.useState<OdooProxyMetadata | null>(
    null,
  );
  const [bodyMap, setBodyMap] =
    React.useState<Record<string, string>>(initialBodies);

  const parseQuery = React.useCallback(
    (raw: string): Record<string, string> => {
      const params = new URLSearchParams(raw);
      const parsed: Record<string, string> = {};
      params.forEach((value, key) => {
        parsed[key] = value;
      });
      return parsed;
    },
    [],
  );

  const extractErrorEnvelope = (error: unknown) => {
    const err = error as {
      response?: { data?: { metadata?: OdooProxyMetadata } };
    };
    return err?.response?.data?.metadata;
  };

  const onExecute = async (
    action: OdooProxyAction,
    withBody = false,
    needsId = false,
  ) => {
    if (!organizationId) return;

    if (needsId && !resourceId.trim()) {
      toast.error("Resource ID is required for this endpoint");
      return;
    }

    try {
      const payload = {
        action,
        body: withBody ? JSON.parse(bodyMap[action] || "{}") : undefined,
        params: query ? parseQuery(query) : undefined,
        resourceId: needsId ? resourceId.trim() : undefined,
      };

      const response = await mutation.mutateAsync({ organizationId, payload });
      setResult(JSON.stringify(response, null, 2));
      setMetadata(response.metadata);
      toast.success("Odoo transaction request executed");
    } catch (error) {
      const envelope = extractErrorEnvelope(error);
      if (envelope) {
        setMetadata(envelope);
        setResult(JSON.stringify({ metadata: envelope }, null, 2));

        if (
          envelope.code === "401" ||
          envelope.message.toLowerCase().includes("unauthorized")
        ) {
          toast.error("Odoo session unauthorized. Please re-login.");
        } else {
          toast.error(envelope.message || "Odoo request failed");
        }
        return;
      }

      toast.error("Odoo request failed");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Odoo Transaction APIs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>
            Base path:{" "}
            <code>/v1/organizations/{`{organizationID}`}/odoo/...</code>
          </p>
          <p>
            Transaction-first proxy API dengan async local update
            (non-blocking).
          </p>
          {metadata?.correlation_id && (
            <p>
              Last <code>correlation_id</code>:{" "}
              <span className="font-mono">{metadata.correlation_id}</span>
            </p>
          )}
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-1">
              <Label>Resource ID (product/location detail)</Label>
              <Input
                placeholder="resource id"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Query Params (optional)</Label>
              <Input
                placeholder="limit=10&offset=0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">GET Transaction APIs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 lg:grid-cols-3">
          {getActions.map((item) => (
            <Button
              key={item.action}
              disabled={!organizationId || mutation.isPending}
              onClick={() =>
                onExecute(item.action, false, Boolean(item.needsId))
              }
            >
              {item.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {postActions.map((item) => (
        <Card key={item.action}>
          <CardHeader>
            <CardTitle className="text-base">POST {item.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              className="min-h-[120px] font-mono text-xs"
              placeholder='{"key":"value"}'
              value={bodyMap[item.action] || "{}"}
              onChange={(e) =>
                setBodyMap((prev) => ({
                  ...prev,
                  [item.action]: e.target.value,
                }))
              }
            />
            <Button
              disabled={!organizationId || mutation.isPending}
              onClick={() => onExecute(item.action, true)}
            >
              Execute {item.title}
            </Button>
          </CardContent>
        </Card>
      ))}

      {metadata && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Response Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              success:{" "}
              <span className="font-mono">{String(metadata.success)}</span>
            </p>
            <p>
              code: <span className="font-mono">{metadata.code}</span>
            </p>
            <p>
              message: <span className="font-mono">{metadata.message}</span>
            </p>
            <p>
              correlation_id:{" "}
              <span className="font-mono">{metadata.correlation_id}</span>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Response Envelope</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[420px] overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-100">
            {result || "No response yet."}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default OdooModule;
