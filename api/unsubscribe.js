export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  return res.status(200).send(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Baja confirmada · Maye Gómez</title>
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/growth.css">
  <style>
    body {
      display: grid;
      place-items: center;
      min-height: 100vh;
      margin: 0;
      background: #fdfaf9;
      font-family: var(--font-body, -apple-system, BlinkMacSystemFont, sans-serif);
      color: #233c46;
      padding: 24px;
    }
    .unsub-box {
      max-width: 480px;
      width: 100%;
      background: #ffffff;
      border: 1px solid rgba(0, 75, 95, 0.12);
      border-radius: 24px;
      padding: 40px 32px;
      text-align: center;
      box-shadow: 0 12px 35px -20px rgba(0, 75, 95, 0.15);
    }
    h1 {
      font-family: var(--font-display, Georgia, serif);
      color: #004b5f;
      font-size: 1.8rem;
      margin-top: 0;
      margin-bottom: 12px;
    }
    p {
      color: #52666e;
      line-height: 1.6;
      font-size: 0.95rem;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="unsub-box">
    <span class="eyebrow" style="color: #c39d96; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">Confirmación</span>
    <h1>Tu baja está registrada</h1>
    <p>Has sido dada de baja de las cartas y comunicaciones automáticas de Maye Gómez. No recibirás más correos en esta dirección.</p>
    <a class="button button-primary" href="/" style="display: inline-block;">Volver al sitio web →</a>
  </div>
</body>
</html>`);
}
