export default function AboutPage() {
  return (
    <main className="content-shell">
      <section className="page-heading">
        <p className="eyebrow">Validador del Comercio · Memo de valor</p>
        <h1>El Memo de Valor 10:1</h1>
        <p className="intro">
          Un perfil verificado del flujo de efectivo puede sustituir costosas
          visitas de campo y reducir pérdidas evitables por crédito y errores
          de conciliación.
        </p>
      </section>

      <div className="memo-grid">
        <article className="memo-card">
          <h2>Lo que hace hoy nuestro usuario</h2>
          <p>
            Los comerciantes dan <em>fiado</em> a ciegas o reciben auditorías
            manuales de los supervisores de ruta. Buró de Crédito y Belvo
            devuelven respuestas JSON vacías para quienes operan únicamente
            con efectivo.
          </p>
        </article>
        <article className="memo-card">
          <h2>Lo que realmente le cuesta hoy</h2>
          <ul>
            <li>Más de $150 MXN por cada visita manual de campo.</li>
            <li>$180 MXN semanales en pérdidas promedio por ruta, debido al <em>fiado</em> a ciegas y a errores de conciliación.</li>
            <li>Entre $1,500 y $3,000 MXN perdidos por una sola entrega sin pagar.</li>
          </ul>
        </article>
        <article className="memo-card">
          <h2>Nuestro precio</h2>
          <ul>
            <li>$0 MXN por la captura de voz por WhatsApp para el comerciante.</li>
            <li>$30 MXN por perfil validado (Nivel 2).</li>
            <li>$15,000 MXN al mes + $15 MXN por perfil (Nivel 3).</li>
          </ul>
        </article>
        <article className="memo-card memo-card--highlight">
          <h2>Por qué se cumple la relación 10:1</h2>
          <p>
            Un perfil de $30 MXN sustituye una visita manual de más de $150 MXN
            (ahorro de 5 veces) y puede evitar entre $300 y más de $1,500 MXN
            en pérdidas operativas semanales e impagos: un valor de 10 a 50
            veces el precio.
          </p>
        </article>
      </div>
      <p className="disclaimer">
        Son estimaciones ilustrativas; el ahorro real depende de los procesos y
        resultados de cada cliente.
      </p>
    </main>
  );
}
