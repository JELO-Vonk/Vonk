export default function SettingsAccountPage() {
  return (
    <div className="surface stack">
      <h1 style={{ margin: 0 }}>Account</h1>
      <input className="input" type="email" placeholder="E-mailadres" />
      <input className="input" type="password" placeholder="Nieuw wachtwoord" />
    </div>
  );
}
