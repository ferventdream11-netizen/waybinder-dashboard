import SectionCard from "../../components/SectionCard";

// Minimal types that match Next.js App Router
export default function GuidePage(
  {
    params,
    searchParams,
  }: {
    params: { code: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }
) {
  const code = params.code;
  const token = typeof searchParams?.token === "string" ? searchParams.token : "";
  const pin = typeof searchParams?.pin === "string" ? searchParams.pin : "";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      {/* Status banner placeholder */}
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
          This is your public link. Next we’ll validate token + PIN, add an offline badge,
          and render real sections.
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
