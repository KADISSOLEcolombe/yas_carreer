export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 640,
        margin: "80px auto",
        padding: "0 24px",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ marginBottom: 4 }}>YasCareer API</h1>
      <p style={{ color: "#555" }}>
        Backend de la plateforme de recrutement Yas Togo. Cette application
        n’expose que des endpoints JSON sous <code>/api</code>.
      </p>
      <ul>
        <li>
          <code>GET /api</code> — informations de version
        </li>
        <li>
          <code>POST /api/auth/login</code> — authentification
        </li>
        <li>
          <code>GET /api/offers</code> — offres publiées
        </li>
      </ul>
      <p style={{ color: "#888", fontSize: 14 }}>
        Consultez le <code>README.md</code> pour la liste complète des routes.
      </p>
    </main>
  );
}
