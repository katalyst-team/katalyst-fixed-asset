"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

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

import { usePenerimaanLogForm } from "./usePenerimaanLogForm";

const CreatePenerimaanLog = () => {
  const { t } = useTranslation(["inbound", "common"]);
  const router = useRouter();

  const form = usePenerimaanLogForm();

  const onSubmit = async () => {
    const success = await form.handleSubmit();
    if (success) {
      router.push("/dashboard/st-penerimaan-log-log");
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
          onClick={() => router.push("/dashboard/st-penerimaan-log-log")}
        >
          {t("common:cancel", "Cancel")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
          <CardDescription>
            Pilih store dan tipe stock movement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Combobox
            isRequired
            label="Store"
            options={form.storeOptions}
            placeholder={
              form.isLoadingStores ? "Loading..." : "Pilih store..."
            }
            value={form.selectedStoreId}
            onSelect={(value) => form.setSelectedStoreId(value || "")}
          />

          <div className="space-y-2">
            <Label>Nomor RIT / Referensi</Label>
            <Input
              placeholder="Auto-generate atau masukkan manual..."
              value={form.referenceNumber}
              onChange={(e) => form.setReferenceNumber(e.target.value)}
            />
          </div>

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
          <CardTitle>Tambah Item Log</CardTitle>
          <CardDescription>
            Pilih jenis kayu, grade, dan SKU untuk menambah item
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Combobox
              isRequired
              label="Jenis Kayu"
              options={form.parentCategoryOptions}
              placeholder="Pilih jenis kayu..."
              value={form.selectedParentCategoryId}
              onSelect={(value) =>
                form.setSelectedParentCategoryId(value || "")
              }
            />
            <Combobox
              isRequired
              disabled={!form.selectedParentCategoryId}
              label="Grade"
              options={form.subcategoryOptions}
              placeholder={
                !form.selectedParentCategoryId
                  ? "Pilih jenis kayu dulu"
                  : "Pilih grade..."
              }
              value={form.selectedSubcategoryId}
              onSelect={(value) => form.setSelectedSubcategoryId(value || "")}
            />
            <Combobox
              isRequired
              disabled={!form.selectedSubcategoryId}
              label="SKU / Panjang"
              options={form.skuOptions}
              placeholder={
                !form.selectedSubcategoryId ? "Pilih grade dulu" : "Pilih SKU..."
              }
              value={form.selectedSkuId}
              onSelect={(value) => form.setSelectedSkuId(value || "")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
            <div className="space-y-2">
              <Label>EPC / RFID Tag (opsional)</Label>
              <Input
                placeholder="Scan atau masukkan EPC..."
                value={form.epcInput}
                onChange={(e) => form.setEpcInput(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                disabled={!form.selectedSkuId}
                type="button"
                variant="secondary"
                onClick={() => form.handleAddItem()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Item
              </Button>
            </div>
          </div>

          {form.itemRows.length > 0 && (
            <div className="border rounded-md">
              <div className="grid grid-cols-[1fr_80px_1fr_40px] gap-4 p-3 bg-muted/50 text-sm font-medium">
                <span>SKU</span>
                <span>Qty</span>
                <span>EPC / RFID</span>
                <span></span>
              </div>
              {form.itemRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_80px_1fr_40px] gap-4 p-3 border-t items-center"
                >
                  <span className="text-sm truncate">{row.skuName}</span>
                  <span className="text-sm">{row.quantity}</span>
                  <Input
                    className="h-8 text-sm"
                    placeholder="Masukkan EPC..."
                    value={row.epc}
                    onChange={(e) =>
                      form.handleItemEpcChange(row.id, e.target.value)
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => form.handleRemoveItem(row.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {form.itemRows.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada item ditambahkan. Pilih SKU dan klik &quot;Tambah
              Item&quot; untuk menambah log.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/st-penerimaan-log-log")}
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
