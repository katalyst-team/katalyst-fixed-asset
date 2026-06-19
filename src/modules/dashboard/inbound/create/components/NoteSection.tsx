import { useTranslation } from "next-i18next";

import { InputWithLabel } from "@/components/shared/InputWithLabel";

interface NoteSectionProps {
  note: string;
  setNote: (note: string) => void;
}

export function NoteSection({ note, setNote }: NoteSectionProps) {
  const { t } = useTranslation("inbound");

  return (
    <div>
      <InputWithLabel
        label={t("create.form.note.label")}
        placeholder={t("create.form.note.placeholder")}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
    </div>
  );
}