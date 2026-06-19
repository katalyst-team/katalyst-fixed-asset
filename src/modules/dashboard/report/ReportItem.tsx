import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import BadgeStatus from "@/components/shared/BadgeStatus";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReportItem as ReportItemType } from "@/types/report";
import { formatDate } from "@/utils/exportUtils";

interface ReportItemProps {
  item: ReportItemType;
  index: number;
}

const ReportItem: React.FC<ReportItemProps> = ({ item, index }) => {
  const [imageError, setImageError] = useState(false);

  const categories = useMemo(() => {
    if (!item.sku.categories || item.sku.categories.length === 0) return "";
    return item.sku.categories.map((cat) => cat.name).join(", ");
  }, [item.sku.categories]);

  const editorName = useMemo(() => {
    if (!item.editor) return "-";
    return `${item.editor.first_name} ${item.editor.last_name}`;
  }, [item.editor]);

  const productImage = useMemo(() => {
    if (item.sku.image_urls && item.sku.image_urls.length > 0) {
      return item.sku.image_urls[0];
    }
    return null;
  }, [item.sku.image_urls]);

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Index Number (hidden on mobile for spacing) */}
          <div className="hidden sm:flex items-start justify-center sm:w-8 pt-2 text-sm font-medium text-muted-foreground">
            {index + 1}
          </div>

          {/* Product Image */}
          <div className="flex-shrink-0">
            {productImage && !imageError ? (
              <Image
                alt={item.sku.name}
                className="rounded-md object-cover"
                height={80}
                src={productImage}
                width={80}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold font-heading text-base">{item.sku.name}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">EPC:</span>
                <span className="ml-2 font-mono">{item.epc}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Internal Code:</span>
                <span className="ml-2 font-mono">
                  {item.sku.internal_code || "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2">
                  <BadgeStatus status={item.status.name} />
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Section:</span>
                <span className="ml-2">{item.section?.name || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-2">{categories || "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">RFID Type:</span>
                <Badge className="ml-2" variant="secondary">
                  {item.rfid_detail?.type || "-"}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">RFID Category:</span>
                <Badge className="ml-2" variant="secondary">
                  {item.rfid_detail?.category || "-"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
              <div>
                <span>Last Updated:</span>
                <span className="ml-2">{formatDate(item.updated_at)}</span>
              </div>
              <div>
                <span>Editor:</span>
                <span className="ml-2">{editorName}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportItem;
