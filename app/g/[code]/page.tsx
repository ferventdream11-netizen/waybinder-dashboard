import SectionCard from "../../components/SectionCard";
import StatusBanner from "../../components/StatusBanner";
import OfflineBadge from "../../components/OfflineBadge";
import GuideHero from "../../components/GuideHero";
import { supabase } from "../../../lib/supabase";

// Row shapes from Supabase
type GuideRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  theme: string | null;
};

type PageRow = { id: string; title: string; position: number };

type BannerRow = {
  message: string;
  tone: "info" | "success" | "warning";
  until: string | null;
  is_active: boolean;
};

type BlockRow = {
  id: string;
  page_id: string;
  kind: "text" | "wifi" | "checkin" | (string & {});
  content: Record<string, unknown> | null;
  position: number;
};

// Content helpers
type TextContent = { html?: string };
type WifiContent = { network?: string; password?: string };
type CheckinContent = { address?: string; time?: string; door_code?: string };

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

  // 1) Resolve access link → guide id
  const { data: link, error: linkErr } = await supabase
    .from("access_links")
    .select("guide_id, token, pin, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (linkErr || !link) {
    return (
      <div className="card">
        <h2>Not found</h2>
        <p>
          There isn’t a guide for code <strong>{code}</strong> yet.
        </p>
      </div>
    );
  }

  const guideId = String(link.guide_id);

  // 2) Guide meta
  const { data: guide } = await supabase
    .from("guides")
    .select("id, slug, title, subtitle, theme")
    .eq("id", guideId)
    .single<GuideRow>();

  // 3) Pages + blocks
  const { data: pages = [] } = await supabase
    .from("pages")
    .select("id, title, position")
    .eq("guide_id", guideId)
    .order("position", { ascending: true }) as { data: PageRow[] | null };

  const pageIds: string[] = (pages ?? []).map((p) => p.id);

  const { data: blocks = [] } = pageIds.length
    ? ((await supabase
        .from("blocks")
        .select("id, page_id, kind, content, position")
        .in("page_id", pageIds)
        .order("position", { ascending: true })) as { data: BlockRow[] | null })
    : ({ data: [] as BlockRow[] });

  // Group blocks by page
  const byPage = new Map<string, BlockRow[]>();
  for (const b of blocks ?? []) {
    const arr = byPage.get(b.page_id) ?? [];
    arr.push(b);
    byPage.set(b.page_id, arr);
  }

  // 4) Active banner
  const { data: bannerRows = [] } = (await supabase
    .from("banners")
    .select("message, tone, until, is_active")
    .eq("guide_id", guideId)
    .eq("is_active", true)) as { data: BannerRow[] | null };

  const now = Date.now();
  const activeBanner =
    (bannerRows ?? []).find((b) => !b.until || Date.parse(b.until) > now) ??
    null;
  const untilISO = activeBanner?.until ?? undefined;

  return (
    <>
      <OfflineBadge />

      {activeBanner ? (
        <StatusBanner
          message={activeBanner.message}
          tone={activeBanner.tone}
          untilISO={untilISO}
        />
      ) : null}

      <GuideHero
        title={guide?.title ?? "Guest Guide"}
        subtitle={guide?.subtitle ?? undefined}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {/* URL bits for testing */}
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
        {(pages ?? []).map((p) => {
          const items = byPage.get(p.id) ?? [];
          return (
            <SectionCard key={p.id} title={p.title}>
              {items.length === 0 ? (
                <p style={{ opacity: 0.8 }}>No content yet.</p>
              ) : (
                items.map((b) => {
                  if (b.kind === "text") {
                    const c = (b.content ?? {}) as TextContent;
                    return <p key={b.id}>{c.html}</p>;
                  }
                  if (b.kind === "wifi") {
                    const c = (b.content ?? {}) as WifiContent;
                    return (
                      <div key={b.id}>
                        <p>
                          <strong>Network:</strong> {c.network}
                        </p>
                        <p>
                          <strong>Password:</strong> {c.password}
                        </p>
                      </div>
                    );
                  }
                  if (b.kind === "checkin") {
                    const c = (b.content ?? {}) as CheckinContent;
                    return (
                      <div key={b.id}>
                        <p>
                          <strong>Address:</strong> {c.address}
                        </p>
                        <p>
                          <strong>Time:</strong> {c.time}
                        </p>
                        <p>
                          <strong>Door code:</strong> {c.door_code}
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
