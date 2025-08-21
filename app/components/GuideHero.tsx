type Props = {
  title: string;
  subtitle?: string;
};

export default function GuideHero({ title, subtitle }: Props) {
  return (
    <section
      className="card"
      style={{
        padding: 28,
        borderRadius: 20,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.02))',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--font-headline), Georgia, serif',
          fontSize: 40,
          lineHeight: 1.1,
          letterSpacing: 0.2,
        }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          style={{
            marginTop: 8,
            opacity: 0.8,
            fontSize: 16,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </section>
  );
}
