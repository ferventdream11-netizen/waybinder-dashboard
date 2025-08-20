import SectionCard from "../../components/SectionCard";

type Props = {
  params: { code: string };
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Public guide route
 * URL shape: /g/ABCDE?token=xyz&pin=1234
 * For now this just reads the URL and renders polished cards.
 * Next steps: wire Supabase + real content by code/token.
 */
export default function GuidePage({ params, searchParams }: Props) {
  const { code } = params;
  const token = typeof searchParams.token === "string" ? searchParams.token : "";
  const pin = typeof searchParams.pin === "string" ? searchParams.pin : "";

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
          This is your public link. In the next steps we’ll validate token + PIN,
          show the offline badge, and render real sections.
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
