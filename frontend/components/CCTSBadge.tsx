export default function CCTSBadge({ schemeType }: { schemeType: 'Compliance' | 'Offset' }) {
  const isCompliance = schemeType === 'Compliance';
  return (
    <span
      className={`px-3 py-1 rounded-none text-xs font-semibold border ${
        isCompliance
          ? 'bg-blue-600 text-white border-blue-400'
          : 'bg-emerald-600 text-white border-emerald-400'
      }`}
      title={`India CCTS 2026 ${schemeType} Market Approved`}
    >
      CCTS {schemeType} Verified
    </span>
  );
}
