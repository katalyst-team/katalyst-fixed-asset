import { useQueryClient } from "@tanstack/react-query";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { toast } from "sonner";

import ButtonDelete from "@/components/shared/ButtonDelete";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useUser } from "@/context/user-context";
import useDeleteApiKeyDataMutation from "@/hooks/api/api-key/useDeleteApiKeyDataMutation";
import { KEY_USE_GET_API_KEY_DATA } from "@/hooks/api/api-key/useGetApiKeyDataQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { toastError } from "@/services";
import { ApiKeyItemType } from "@/types/api-key";

import ApiKeyModalAddApiKey from "./ApiKeyModalAddApiKey";

interface ApiKeyItemProps {
  item: ApiKeyItemType;
  num?: number;
}

const ApiKeyItem: React.FC<ApiKeyItemProps> = ({ item, num }) => {
  const { t } = useTranslation(["api-key"]);
  const { tokenPayload } = useUser();
  const { mutateAsync: deleteApiKey } = useDeleteApiKeyDataMutation();
  const queryClient = useQueryClient();
  const [showFullKey, setShowFullKey] = useState(false);
  const { canDelete, canUpdate } = usePermissions();

  const handleDelete = async () => {
    deleteApiKey({
      accountOrganizationID: tokenPayload?.account_organization_role_id || "",
      keyID: item.id,
      organizationID: tokenPayload?.organization_id || "",
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: KEY_USE_GET_API_KEY_DATA(
            tokenPayload?.organization_id || "",
            tokenPayload?.account_organization_role_id || ""
          ),
        });
        toast.success(t("api-key:toast.apiKeyDeleted"));
      })
      .catch((e) => toastError(e));
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(item.key);
    toast.success(t("api-key:toast.keyCopied"));
  };

  const maskedKey = `${item.key.substring(0, 8)}...${item.key.slice(-4)}`;

  return (
    <TableRow>
      <TableCell className="font-medium">{num ?? item.id}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
            {showFullKey ? item.key : maskedKey}
          </code>
          <Button
            size="icon"
            title={showFullKey ? t("api-key:table.hideKey") : t("api-key:table.showKey")}
            variant="outline"
            onClick={() => setShowFullKey(!showFullKey)}
          >
            {showFullKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button 
            size="icon" 
            title={t("api-key:table.copyKey")} 
            variant="outline"
            onClick={handleCopyKey}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={item.status === "ACTIVE" ? "default" : "destructive"}>
          {item.status === "ACTIVE"
            ? t("api-key:table.status.active")
            : t("api-key:table.status.inactive")}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {canUpdate && <ApiKeyModalAddApiKey apiKeyData={item} keyId={item.id} />}
          {canDelete && <ButtonDelete onSubmit={handleDelete} />}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ApiKeyItem;
