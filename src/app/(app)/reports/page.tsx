import { requireOnboardingUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { SectionTitle } from "@/components/ui/SectionTitle";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const [user, query] = await Promise.all([requireOnboardingUser(), searchParams]);
  const reports = await prisma.report.findMany({
    where: { reporterUserId: user.id },
    include: {
      reportedUser: { include: { profile: true } },
      reportedProfile: true,
      reportedMessage: true,
      reportedVideoCall: true
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="surface stack">
      <SectionTitle title="Mijn meldingen" description="Overzicht van meldingen die jij hebt ingediend." />
      {query.sent ? <div className="alert alert-success">Je melding is opgeslagen.</div> : null}
      <div className="list">
        {reports.length ? reports.map((report) => (
          <div key={report.id} className="card stack">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <strong>{report.reasonCode.replaceAll("_", " ")}</strong>
              <span className="badge">{report.status}</span>
            </div>
            <div className="muted">
              Context: {report.contextType} {report.reportedUser?.profile?.displayName ?? report.reportedUser?.email ?? report.reportedProfile?.displayName ?? report.reportedMessage?.id ?? report.reportedVideoCall?.id ?? "-"}
            </div>
            {report.notes ? <p style={{ margin: 0 }}>{report.notes}</p> : null}
            <div className="muted">{new Date(report.createdAt).toLocaleString("nl-NL")}</div>
          </div>
        )) : <p className="muted" style={{ margin: 0 }}>Je hebt nog geen meldingen gedaan.</p>}
      </div>
    </div>
  );
}
