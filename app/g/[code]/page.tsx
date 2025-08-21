import SectionCard from "../../components/SectionCard";
import StatusBanner from "../../components/StatusBanner";
import OfflineBadge from "../../components/OfflineBadge";
import GuideHero from "../../components/GuideHero";
import { supabase } from "../../../lib/supabase";

// Helpers
type PageRow = { id: string; title: string; position: number };
type BlockRow = {
  id: string;
  page_id: string;
  kind: string;
  content: any;
  position: number;
};

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

  // 1) Find the guide for this code
  const { data: link, error: linkErr } = await supabase
    .from("access_links")
    .select("guide_id, token, pin, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (linkErr || !link) {
    return (
      <div className="card">
        <h2>Not found</h2>
        <p>There isn’t a guide for code <strong>{code}</strong> yet.</p>
      </div>
    );
  }

  const guideId = link.guide_id as string;

  // 2) Load guide meta
  const { data: guide } = await supabase
    .from("guides")
    .select("id, slug, title, subtitle, theme")
    .eq("id", guideId)
    .single();

  // 3) Load pages + blocks
  const { data: pages = [] } = await supabase
    .from("pages")
    .select("id, title, position")
    .eq("guide_id", guideId)
    .order("position", { ascending: true });

  const pageIds = pages.map((p) => p.id);
  const { data: blocks = [] } = pageIds.length
    ? await supabase
        .from("blocks")
        .select("id, page_id, kind, content, position")
        .in("page_id", pageIds)
        .order("position", { ascending: true })
    : { data: [] as BlockRow[] };

  // Group blocks by page
  const byPage = new Map<string, BlockRow[]>();
  for (const b of blocks) {
    const arr = byPage.get(b.page_id) ?? [];
    arr.push(b);
    byPage.set(b.page_id, arr);
  }

  // 4) Pick an active banner (until in future or null)
  const { data: bannerRows = [] } = await supabase
    .from("banners")
    .select("message, tone, until, is_active")
    .eq("guide_id", guideId)
    .eq("is_active", true);

  const now = Date.now();
  const activeBanner = bannerRows.find((b) => !b.until || Date.parse(b.until as any) > now);
  const untilISO = activeBanner?.until ?? undefined;

  return (
    <>
      <OfflineBadge />

      {activeBanner ? (
        <StatusBanner
          message={activeBanner.message}
          tone={(activeBanner.tone as any) ?? "info"}
          untilISO={untilISO}
        />
      ) : null}

      <GuideHero
        title={guide?.title ?? "Guest Guide"}
        subtitle={guide?.subtitle ?? ""}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {/* Show URL bits as a card so we can confirm params while testing */}
        <SectionCard title="Booking Code" subtitle="From the URL">
          <p>
            <strong>code:</strong> {code}
          </p>
          <p>
            <strong>token:</strong> {token || "—"}
          </p>
          <p>
            <strong>pin:</strong> {pin || "—"}
          </p>
        </SectionCard>

        {/* Render each page with its blocks */}
        {pages.map((p: PageRow) => {
          const items = byPage.get(p.id) ?? [];
          return (
            <SectionCard key={p.id} title={p.title}>
              {items.length === 0 ? (
                <p style={{ opacity: 0.8 }}>No content yet.</p>
              ) : (
                items.map((b) => {
                  if (b.kind === "text") {
                    return <p key={b.id}>{b.content?.html}</p>;
                  }
                  if (b.kind === "wifi") {
                    return (
                      <div key={b.id}>
                        <p>
                          <strong>Network:</strong> {b.content?.network}
                        </p>
                        <p>
                          <strong>Password:</strong> {b.content?.password}
                        </p>
                      </div>
                    );
                  }
                  if (b.kind === "checkin") {
                    return (
                      <div key={b.id}>
                        <p>
                          <strong>Address:</strong> {b.content?.address}
                        </p>
                        <p>
                          <strong>Time:</strong> {b.content?.time}
                        </p>
                        <p>
                          <strong>Door code:</strong> {b.content?.door_code}
                        </p>
                      </div>
                    );
                  }
                  // Fallback for unknown kinds
                  return (
                    <pre key={b.id} style={{ whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(b.content, null, 2)}
                    </pre>
                  );
                })
              )}
            </SectionCard>
          );
        })}
      </div>
    </>
  );
}
