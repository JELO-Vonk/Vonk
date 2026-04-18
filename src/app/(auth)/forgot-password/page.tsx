import { SectionTitle } from "@/components/ui/SectionTitle";

export default function Page() {
  return (
    <div className="surface stack">
      <SectionTitle title="Wachtwoord vergeten" description="Voorbeeldscherm voor resetflow." />
      <form className="stack">
        <input className="input" type="email" name="email" placeholder="E-mailadres" />
        <button className="btn btn-primary" type="submit">Reset link aanvragen</button>
      </form>
    </div>
  );
}
