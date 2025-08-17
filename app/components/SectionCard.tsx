type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function SectionCard({ title, subtitle, children }: Props) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {subtitle ? (
        <p style={{ opacity: 0.8, marginTop: -4, marginBottom: 12 }}>{subtitle}</p>
      ) : null}
      <div>{children}</div>
    </section>
  );
}
