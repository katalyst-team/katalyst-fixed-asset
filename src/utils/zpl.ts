const FIELD_DATA = /\^F[DV][\s\S]*?\^FS/g;
// Must be a char ZPL never carries and the comment stripper never consumes:
// a space delimiter gets eaten by [ \t]* and the token becomes unrestorable.
const SHIELD = "\u0000";

export interface RfidTuning {
  encodePosition?: string;
  rfPower?: string;
}

// only ^FD/^FV data is shielded from comment stripping.
// Binary-carrying commands (~DG et al) would need the same treatment if templates ever use them.
export function sanitizeZpl(zpl: string, tuning: RfidTuning = {}): string {
  const shielded: string[] = [];
  let out = zpl.replace(FIELD_DATA, (match) => {
    shielded.push(match);
    return `${SHIELD}${shielded.length - 1}${SHIELD}`;
  });

  out = out.replace(/^[ \t]*;.*$/gm, "");
  out = out.replace(/([^^~\n]*?)[ \t]*;[^\n]*$/gm, "$1");

  if (/\^RFW/i.test(out)) {
    const position = tuning.encodePosition?.trim();
    const power = tuning.rfPower?.trim();

    out = out.replace(/\^RS([^^~\n]*)/i, (_match, params: string) => {
      const parts = params.split(",");
      while (parts.length < 5) parts.push("");
      if (position) parts[1] = position;
      parts[3] = "0";
      parts[4] = "E";
      return `^RS${parts.join(",")}`;
    });

    if (power && !/\^RW/i.test(out)) out = out.replace(/\^XA/i, `^XA^RW${power}`);
    if (!/\^PR/i.test(out)) out = out.replace(/\^XA/i, "^XA^PR2,2,2");
  }

  return out.replace(
    new RegExp(`${SHIELD}(\\d+)${SHIELD}`, "g"),
    (_match, index: string) => shielded[Number(index)]
  );
}
