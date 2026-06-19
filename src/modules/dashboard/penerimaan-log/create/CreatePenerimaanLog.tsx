"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { ImageUploadWithCamera } from "@/components/ui/image-upload-with-camera";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import PenerimaanLogItemRow from "./PenerimaanLogItemRow";
import { usePenerimaanLogForm } from "./usePenerimaanLogForm";

const CreatePenerimaanLog = () => {
  const router = useRouter();

  const form = usePenerimaanLogForm();

  const onSubmit = async () => {
    const success = await form.handleSubmit();
    if (success) {
      router.push("/dashboard/penerimaan-log");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buat Penerimaan Log</h1>
          <p className="text-sm text-muted-foreground">
            Buat inbound stock movement baru untuk penerimaan log
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/penerimaan-log")}
        >
          Batal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
          <CardDescription>Pilih store dan nomor referensi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Combobox
            isRequired
            label="Store"
            options={form.storeOptions}
            placeholder={form.isLoadingStores ? "Loading..." : "Pilih store..."}
            value={form.selectedStoreId}
            onSelect={(value) => form.setSelectedStoreId(value || "")}
          />

          {form.ritEnabled && (
            <div className="space-y-2">
              <Label>Nomor RIT / Referensi</Label>
              <Input
                placeholder="Auto-generate atau masukkan manual..."
                value={form.referenceNumber}
                onChange={(e) => form.setReferenceNumber(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Catatan</Label>
            <Input
              placeholder="Delivery note, catatan penerimaan..."
              value={form.note}
              onChange={(e) => form.setNote(e.target.value)}
            />
          </div>

          <ImageUploadWithCamera
            featureId="penerimaan-log"
            label="Bukti Foto"
            maxImages={5}
            onImagesChange={(urls) => form.setImageUrls(urls)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Item</CardTitle>
              <CardDescription>
                Tambah setiap batang dengan EPC, SKU, grade, dan metadata
              </CardDescription>
            </div>
            <Button size="sm" type="button" onClick={() => form.handleAddRow()}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.itemRows.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada item ditambahkan. Klik &quot;Tambah Item&quot; untuk menambah item.
            </p>
          )}

          {form.itemRows.map((row, index) => (
            <PenerimaanLogItemRow
              key={row.id}
              epcOptions={form.epcOptions}
              index={index}
              organizationId={form.organizationId}
              parentCategoryOptions={form.parentCategoryOptions}
              row={row}
              onRemove={(id) => form.handleRemoveRow(id)}
              onUpdate={(id, field, value) => form.handleUpdateRow(id, field, value)}
              onUpdateAttribute={(id, attrId, value) =>
                form.handleAttributeValueUpdate(id, attrId, value)
              }
              onUpdateMetadata={(id, key, value) =>
                form.handleMetadataUpdate(id, key, value)
              }
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/penerimaan-log")}
        >
          Batal
        </Button>
        <Button
          disabled={!form.isFormValid || form.isSubmitting}
          onClick={onSubmit}
        >
          {form.isSubmitting ? "Menyimpan..." : "Buat Penerimaan Log"}
        </Button>
      </div>
    </div>
  );
};

export default CreatePenerimaanLog;
