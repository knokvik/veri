export default function CCTSBadge({ schemeType }: { schemeType: 'Compliance' | 'Offset' }) {
  const isCompliance = schemeType === 'Compliance';
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        isCompliance
          ? 'bg-blue-900/40 border-blue-500 text-blue-300'
          : 'bg-green-900/40 border-green-500 text-green-300'
      }`}
      title={`India CCTS 2026 ${schemeType} Market Approved`}
    >
      CCTS {schemeType} Verified
    </span>
  );
}
