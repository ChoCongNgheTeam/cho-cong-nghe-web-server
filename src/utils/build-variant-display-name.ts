const ATTR_ORDER = ["ram", "storage", "gpu", "capacity_cooling", "capacity_washing", "capacity_fridge", "connection"];

const ATTR_FORMAT: Record<string, (label: string) => string> = {
  ram: (label) => label.toUpperCase(), // "8gb" → "8GB"
  storage: (label) => label.toUpperCase(), // "256gb" → "256GB"
  gpu: (label) => `${label}-core GPU`, // "8core" → "8-core GPU"
  capacity_cooling: (label) => label, // "1HP" → "1HP"
  capacity_washing: (label) => label, // "9kg" → "9kg"
  capacity_fridge: (label) => label,
  connection: (label) => label, // "USB-C" → "USB-C"
  // color: bỏ qua — không append vào name
};

export const buildVariantDisplayName = (
  productName: string,
  variantAttributes:
    | Array<{
        attributeOption: {
          label: string;
          attribute: { code: string };
        };
      }>
    | undefined
    | null,
): string => {
  // Guard: trả về productName nếu không có variantAttributes
  if (!variantAttributes?.length) return productName;

  // Map code → label
  const attrMap = new Map(variantAttributes.map((va) => [va.attributeOption.attribute.code, va.attributeOption.label]));

  const parts: string[] = [productName];

  for (const code of ATTR_ORDER) {
    const label = attrMap.get(code);
    if (!label) continue;

    const formatter = ATTR_FORMAT[code];
    if (formatter) parts.push(formatter(label));
  }

  return parts.join(" ");
  // "OPPO A3" + ram "6gb" → "OPPO A3 6GB"
  // "MacBook Air 13 M4" + ram "16gb" + storage "256gb" + gpu "8core" → "MacBook Air 13 M4 16GB 256GB 8-core GPU"
};
