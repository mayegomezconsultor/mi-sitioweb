/**
 * Vercel Serverless Function: /api/subscribe
 * Captura leads de la Checklist y de la Newsletter.
 * Sincroniza con Notion (CRM) y envía correos con Resend.
 */

async function saveToNotion({ name, email, kind, marketing }) {
  const token = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) return;

  const typeLabel = kind === 'newsletter' ? 'Newsletter' : 'Checklist 4 Pilares';

  const body = {
    parent: { database_id: databaseId },
    properties: {
      Nombre: {
        title: [{ text: { content: name } }]
      },
      Email: {
        email: email
      },
      Tipo: {
        select: { name: typeLabel }
      },
      Fecha: {
        date: { start: new Date().toISOString() }
      },
      Estado: {
        select: { name: 'Nuevo Lead' }
      }
    }
  };

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Notion API Error:', response.status, errorText);
  }
}

async function sendViaResend({ name, email, kind, siteUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const mailFrom = process.env.MAIL_FROM || 'Maye Gómez <onboarding@resend.dev>';
  const isChecklist = kind === 'checklist';
  const subject = isChecklist
    ? 'Tu checklist de los 4 pilares · Maye Gómez'
    : 'Bienvenida a las cartas de Maye Gómez';

  const downloadUrl = `${siteUrl}/api/download`;
  const unsubUrl = `${siteUrl}/api/unsubscribe`;

  const emailHtml = isChecklist
    ? `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #233c46; max-width: 580px; margin: 30px auto; line-height: 1.7; padding: 24px; border: 1px solid #e5eaeb; border-radius: 16px;">
        <p style="font-size: 11px; letter-spacing: 0.1em; color: #004b5f; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Maye Gómez · Consultora de empresas</p>
        <h1 style="font-family: Georgia, serif; color: #004b5f; font-size: 26px; line-height: 1.3; margin-top: 0;">Tu checklist de los 4 pilares está lista</h1>
        <p>Hola <strong>${escapeHtml(name)}</strong>,</p>
        <p>Gracias por solicitar la checklist de 16 preguntas para evaluar los cuatro pilares de tu empresa (personas, clientes, dinero y operaciones).</p>
        <p>Puedes descargar el archivo PDF directamente con el siguiente botón:</p>
        <p style="margin: 28px 0;">
          <a href="${downloadUrl}" style="display: inline-block; background: #004b5f; color: #ffffff; padding: 14px 26px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(0,75,95,0.2);">Descargar Checklist en PDF ↓</a>
        </p>
        <p style="color: #52666e; font-size: 14px;"><strong>Recomendación:</strong> No intentes resolver todo a la vez. Al responder las preguntas, elige una sola prioridad concreta para trabajar esta semana.</p>
        <p style="margin-top: 32px; border-top: 1px solid #eef2f3; padding-top: 18px; font-size: 13px; color: #52666e;">
          Con claridad y estrategia,<br>
          <strong style="color: #004b5f;">Maye Gómez</strong><br>
          <span style="font-size: 12px;">Consultora empresarial · Modalidad remota</span>
        </p>
        <p style="font-size: 11px; color: #8e9ea4; margin-top: 24px;">
          Recibiste este correo porque lo solicitaste en mayegomez.com.<br>
          <a href="${unsubUrl}" style="color: #8e9ea4; text-decoration: underline;">Darme de baja de futuros correos</a>
        </p>
      </div>
    `
    : `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #233c46; max-width: 580px; margin: 30px auto; line-height: 1.7; padding: 24px; border: 1px solid #e5eaeb; border-radius: 16px;">
        <p style="font-size: 11px; letter-spacing: 0.1em; color: #004b5f; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Maye Gómez · Consultora de empresas</p>
        <h1 style="font-family: Georgia, serif; color: #004b5f; font-size: 26px; line-height: 1.3; margin-top: 0;">Bienvenida a las cartas de Maye</h1>
        <p>Hola <strong>${escapeHtml(name)}</strong>,</p>
        <p>Gracias por abrir este espacio en tu bandeja de entrada para mirar tu empresa con más calma y perspectiva.</p>
        <p>Cada quince días compartiré contigo herramientas prácticas, reflexiones honestas y preguntas clave sobre cómo conectar a tu equipo, tus clientes, tus finanzas y tus operaciones para avanzar sin perder la paz.</p>
        <p style="margin: 28px 0;">
          <a href="${siteUrl}/#soluciones" style="display: inline-block; background: #edccc6; color: #19333d; padding: 13px 24px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px;">Explorar soluciones y consultorías →</a>
        </p>
        <p style="margin-top: 32px; border-top: 1px solid #eef2f3; padding-top: 18px; font-size: 13px; color: #52666e;">
          Nos leemos pronto,<br>
          <strong style="color: #004b5f;">Maye Gómez</strong>
        </p>
        <p style="font-size: 11px; color: #8e9ea4; margin-top: 24px;">
          <a href="${unsubUrl}" style="color: #8e9ea4; text-decoration: underline;">Dejar de recibir estas cartas</a>
        </p>
      </div>
    `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: mailFrom,
      to: [email],
      subject: subject,
      html: emailHtml
    })
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const { name, email, website, consent, kind, marketing } = req.body || {};

    // 1. Antispam honeypot trap (el campo website debe estar vacío)
    if (website) {
      return res.status(400).json({ error: 'invalid' });
    }

    // 2. Validación de campos
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!cleanName || cleanName.length > 80) {
      return res.status(400).json({ error: 'invalid_name' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      return res.status(400).json({ error: 'invalid_email' });
    }

    if (consent !== true) {
      return res.status(400).json({ error: 'consent_required' });
    }

    const leadKind = kind === 'newsletter' ? 'newsletter' : 'checklist';
    const siteUrl = process.env.SITE_URL || 'https://' + (req.headers.host || 'mayegomez.com');

    // 3. Guardar en Notion (CRM)
    if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
      try {
        await saveToNotion({
          name: cleanName,
          email: cleanEmail,
          kind: leadKind,
          marketing: marketing || leadKind === 'newsletter'
        });
      } catch (err) {
        console.error('Notion Error:', err.message);
      }
    } else {
      console.log(`[AVISO NOTION] NOTION_API_KEY o NOTION_DATABASE_ID no configurados.`);
    }

    // 4. Enviar correo automático con Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await sendViaResend({
          name: cleanName,
          email: cleanEmail,
          kind: leadKind,
          siteUrl
        });
      } catch (err) {
        console.error('Resend Error:', err.message);
      }
    } else {
      console.log(`[AVISO RESEND] RESEND_API_KEY no configurado. Lead procesado en modo prueba: ${cleanName} <${cleanEmail}>`);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error general en /api/subscribe:', err);
    return res.status(500).json({ error: 'server_error' });
  }
}
