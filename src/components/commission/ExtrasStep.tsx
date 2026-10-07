import type { CommissionData } from "../../types";

interface Props {
  data: CommissionData;
  value: string;
  onChange: (value: string) => void;
}

export default function ExtrasStep({ data, value, onChange }: Props) {
  return (
    <div>
      <label htmlFor="commission-extras" className="block text-sm font-semibold text-neutral-800">
        Describe the extras <span className="font-normal text-neutral-500">(optional — you can tell us on WhatsApp)</span>
      </label>
      <textarea
        id="commission-extras"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={data.extrasPlaceholder}
        className="mt-2 w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none transition-colors focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
      />
      <p className="mt-3 rounded-xl bg-pink-50 p-4 text-sm text-neutral-700">{data.extrasPriceNotice}</p>
    </div>
  );
}
