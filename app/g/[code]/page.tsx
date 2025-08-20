import SectionCard from "../../components/SectionCard";

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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      <section
        className="card"
        style={{
          borderStyle: "dashed",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.02))",
        }}
      >
        <h2>Guest Guide</h2>
        <p style={{ opacity: 0.8 }}>
          This is your public link. Next we’ll validate token + PIN, add an
          offline badge, and render real sections.
        </p>
      </section>

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
  );
}
