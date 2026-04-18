import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link href="/" className="brand">Vonk</Link>
        <nav className="nav">
          <Link href="/how-it-works">Hoe het werkt</Link>
          <Link href="/premium">Premium</Link>
          <Link href="/safety">Veiligheid</Link>
          <Link href="/login" className="btn btn-secondary">Inloggen</Link>
          <Link href="/register" className="btn btn-primary">Start gratis</Link>
        </nav>
      </div>
    </header>
  );
}
