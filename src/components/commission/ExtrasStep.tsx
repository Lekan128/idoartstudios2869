import type { CommissionData } from "../../types";

interface Props {
  data: CommissionData;
  value: string;
  onChange: (value: string) => void;
}

export default function ExtrasStep({ data, value, onChange }: Props) {
  return (
    <div>
      <label htmlFor="commission-extras" className="sr-only">
        {data.extrasStepTitle}
      </label>
      <textarea
        id="commission-extras"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={data.extrasPlaceholder}
        className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none transition-colors focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
      />
      <p className="mt-3 rounded-xl bg-pink-50 p-4 text-sm text-neutral-700 ring-1 ring-pink-100">
        {data.extrasPriceNotice}
      </p>
    </div>
  );
}
