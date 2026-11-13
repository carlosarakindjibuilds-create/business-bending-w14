export default function AboutPage() {
  return (
    <main className="content-shell">
      <section className="page-heading">
        <p className="eyebrow">Validator of the Trade · Value Memo</p>
        <h1>The 10:1 Value Memo</h1>
        <p className="intro">
          A verified cash-flow profile can replace costly field work while
          reducing avoidable credit and reconciliation losses.
        </p>
      </section>

      <div className="memo-grid">
        <article className="memo-card">
          <h2>What Our User Does Today</h2>
          <p>
            Merchants extend blind <em>fiado</em>, or route supervisors conduct
            manual field audits. Credit Bureau and Belvo return empty JSON for
            merchants who operate entirely in cash.
          </p>
        </article>
        <article className="memo-card">
          <h2>What It Truly Costs Today</h2>
          <ul>
            <li>More than $150 MXN per manual field visit.</li>
            <li>$180 MXN per week in average route losses from blind <em>fiado</em> defaults and reconciliation errors.</li>
            <li>$1,500–$3,000 MXN lost on a single unpaid delivery.</li>
          </ul>
        </article>
        <article className="memo-card">
          <h2>Our Price</h2>
          <ul>
            <li>$0 MXN for the merchant’s WhatsApp capture.</li>
            <li>$30 MXN per validated profile (Tier 2).</li>
            <li>$15,000 MXN/month + $15 MXN/profile (Tier 3).</li>
          </ul>
        </article>
        <article className="memo-card memo-card--highlight">
          <h2>Why 10:1 Holds</h2>
          <p>
            A $30 MXN profile replaces a $150+ MXN manual visit (5x savings)
            and can prevent $300–$1,500+ MXN in weekly operating losses and
            defaults, a 10x–50x value ratio.
          </p>
        </article>
      </div>
      <p className="disclaimer">
        Illustrative operating estimates; actual savings depend on customer
        workflows and outcomes.
      </p>
    </main>
  );
}
