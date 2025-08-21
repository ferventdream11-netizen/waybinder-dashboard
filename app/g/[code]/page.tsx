import SectionCard from "../../components/SectionCard";
import StatusBanner from "../../components/StatusBanner";
import OfflineBadge from "../../components/OfflineBadge";

export default async function GuidePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code } = await params;
  const sp = (await searchParams) ?? {};
  const token = typeof sp.token === "string" ? sp.token : "";
  const pin = typeof sp.pin === "string" ? sp.pin : "";

  const untilISO = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  return (
    <>
      {/* Offline badge at top-right */}
      <OfflineBadge />

      {/* Status banner */}
      <StatusBanner
        message="Heads up: Quiet hours after 10pm. Thanks!"
        tone="info"
        untilISO={untilISO}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <SectionCard title="Booking Code" subtitle="From the URL">
          <p><strong>code:</strong> {code}</p>
          <p><strong>token:</strong> {token || "—"}</p>
          <p><strong>pin:</strong> {pin || "—"}</p>
        </SectionCard>

        <SectionCard title="Welcome">
          <p>Thanks for staying with us. Everything you need for check-in and the home is below.</p>
        </SectionCard>

        <SectionCard title="Wi-Fi">
          <p><strong>Network:</strong> Waybinder-Guest</p>
          <p><strong>Password:</strong> staycozy</p>
        </SectionCard>

        <SectionCard title="Check-in">
          <p><strong>Address:</strong> 123 Palm Ave, Bellflower, CA</p>
          <p><strong>Time:</strong> 3:00 pm</p>
          <p><strong>Door code:</strong> 0426</p>
        </SectionCard>
      </div>
    </>
  );
}
