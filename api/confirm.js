export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Confirmación exitosa y entrega del enlace de descarga
  return res.status(200).json({
    ok: true,
    download: '/api/download'
  });
}
