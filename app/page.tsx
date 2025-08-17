import SectionCard from "./components/SectionCard";

export default function Home() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
      }}
    >
      <SectionCard title="Welcome" subtitle="Make yourself at home">
        <p>Waybinder is live. This page will render your guide sections as clean cards.</p>
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

      <SectionCard title="Parking">
        <p>Use the driveway. Please leave space for the trash bins on pickup day.</p>
      </SectionCard>

      <SectionCard title="Trash day">
        <p>Blue and black bins go out Sunday night. Bring them back by noon Monday.</p>
      </SectionCard>
    </div>
  );
}
