/**
 * ZONBAT · Backend – Node.js + Express + Google Calendar API
 *
 * Endpoints:
 *   POST /api/booking  →  Crea evento en Google Calendar y envía email
 *
 * Setup:
 *   1. npm install
 *   2. Crea credenciales OAuth2 en Google Cloud Console
 *   3. Completa .env con tus valores
 *   4. node server.js
 */

require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const { google }   = require('googleapis');
const nodemailer   = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── MIDDLEWARES ─────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));  // Sirve index.html, styles.css, app.js

/* ── GOOGLE OAUTH2 CLIENT ───────────────── */
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI  // e.g. http://localhost:3000/oauth2callback
);

// Tokens guardados en memoria (en producción usa una BD o Secret Manager)
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/* ── NODEMAILER ─────────────────────────── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,  // App Password de Google (no tu contraseña normal)
  },
});

/* ── HELPERS ────────────────────────────── */
const SESSION_LABELS = {
  individual: 'Sesión Individual (60 min)',
  grupal:     'Sesión Grupal (90 min)',
  retiro:     'Retiro de un Día (6 horas)',
};

const SESSION_DURATIONS = {
  individual: 60,
  grupal:     90,
  retiro:     360,
};

function buildEventDateTime(dateStr, timeStr, durationMinutes) {
  const startISO = `${dateStr}T${timeStr}:00`;
  const start    = new Date(startISO);
  const end      = new Date(start.getTime() + durationMinutes * 60_000);

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

  return {
    start: { dateTime: toISO(start), timeZone: 'America/Bogota' },
    end:   { dateTime: toISO(end),   timeZone: 'America/Bogota' },
  };
}

/* ── POST /api/booking ──────────────────── */
app.post('/api/booking', async (req, res) => {
  const { firstName, lastName, email, phone, sessionType, date, time, notes } = req.body;

  // Validación de campos requeridos
  if (!firstName || !email || !sessionType || !date || !time) {
    return res.status(400).json({ message: 'Faltan campos requeridos.' });
  }

  const fullName    = `${firstName} ${lastName}`.trim();
  const sessionLabel = SESSION_LABELS[sessionType] || sessionType;
  const duration     = SESSION_DURATIONS[sessionType] || 60;
  const { start, end } = buildEventDateTime(date, time, duration);

  /* 1 ── Crear evento en Google Calendar ── */
  const calendarEvent = {
    summary: `🎵 Sound Healing – ${fullName}`,
    description: [
      `Sesión: ${sessionLabel}`,
      `Cliente: ${fullName}`,
      `Email: ${email}`,
      phone ? `Teléfono: ${phone}` : null,
      notes ? `\nNotas: ${notes}` : null,
      '',
      '──────────────────────────────',
      'Centro de Bienestar Sound Healing',
      'Calle 93 #15-47, Bogotá',
    ]
      .filter(Boolean)
      .join('\n'),
    location:  'Centro de Bienestar Sound Healing, Calle 93 #15-47, Bogotá, Colombia',
    start,
    end,
    attendees: [
      { email, displayName: fullName },
      { email: process.env.ZONBAT_CALENDAR_EMAIL || process.env.EMAIL_USER },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email',  minutes: 60 * 24 },  // 24h antes
        { method: 'popup',  minutes: 60 },         // 1h antes
      ],
    },
    colorId: '3',  // lavanda en Google Calendar
  };

  let eventLink = '';

  try {
    const calResponse = await calendar.events.insert({
      calendarId: process.env.ZONBAT_CALENDAR_ID || 'primary',
      resource:   calendarEvent,
      sendUpdates: 'all',  // Google envía invitación automáticamente al asistente
    });
    eventLink = calResponse.data.htmlLink;
  } catch (calErr) {
    console.error('Error Google Calendar:', calErr.message);
    return res.status(500).json({
      message: 'No se pudo crear el evento en Google Calendar. Verifica tus credenciales.',
      detail:  calErr.message,
    });
  }

  /* 2 ── Enviar email de confirmación al cliente ── */
  const clientMail = {
    from:    `"Sound Healing" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: `🎵 Tu reserva en Sound Healing está confirmada – ${sessionLabel}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#faf5ff;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(124,58,237,0.1);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#7c3aed,#a855f7,#e879a0);padding:48px 40px;text-align:center;">
                  <div style="font-size:2.5rem;margin-bottom:8px;">🎵</div>
                  <h1 style="color:white;margin:0;font-size:1.8rem;font-weight:700;">Sound Healing</h1>
                  <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Tu reserva está confirmada</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <p style="color:#4c1d95;font-size:1rem;margin-bottom:24px;">Hola <strong>${firstName}</strong>, ¡estamos encantados de recibirte! 🌟</p>

                  <div style="background:#faf5ff;border-radius:16px;padding:28px;margin-bottom:28px;border:1px solid #e9d5ff;">
                    <h2 style="color:#7c3aed;font-size:1rem;margin:0 0 20px;text-transform:uppercase;letter-spacing:0.08em;">Detalles de tu sesión</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:0.875rem;width:40%;">📅 Fecha</td>
                        <td style="padding:8px 0;color:#1e1b4b;font-weight:600;font-size:0.875rem;">${new Date(date + 'T12:00:00').toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:0.875rem;">🕐 Hora</td>
                        <td style="padding:8px 0;color:#1e1b4b;font-weight:600;font-size:0.875rem;">${time}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:0.875rem;">🎵 Tipo</td>
                        <td style="padding:8px 0;color:#1e1b4b;font-weight:600;font-size:0.875rem;">${sessionLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:0.875rem;">📍 Lugar</td>
                        <td style="padding:8px 0;color:#1e1b4b;font-weight:600;font-size:0.875rem;">Calle 93 #15-47, Bogotá</td>
                      </tr>
                    </table>
                  </div>

                  ${eventLink ? `
                  <div style="text-align:center;margin-bottom:32px;">
                    <a href="${eventLink}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#e879a0);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:0.95rem;">
                      📅 Ver en Google Calendar
                    </a>
                  </div>
                  ` : ''}

                  <div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
                    <h3 style="color:#ea580c;margin:0 0 8px;font-size:0.875rem;">¿Qué llevar?</h3>
                    <p style="color:#6b7280;margin:0;font-size:0.875rem;line-height:1.6;">Ropa cómoda y suelta. Tapete de yoga (opcional, tenemos disponibles). Llegá 10 minutos antes. Nosotros ponemos todo lo demás. ✨</p>
                  </div>

                  <p style="color:#6b7280;font-size:0.875rem;line-height:1.7;">
                    Si necesitas cambiar o cancelar tu cita, escríbenos por WhatsApp al <strong>+57 300 123 4567</strong> con al menos 24 horas de antelación.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#faf5ff;padding:28px 40px;text-align:center;border-top:1px solid #e9d5ff;">
                  <p style="color:#7c3aed;font-weight:700;margin:0 0 4px;">Sound Healing</p>
                  <p style="color:#9ca3af;font-size:0.8rem;margin:0;">Calle 93 #15-47, Bogotá · +57 300 123 4567</p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(clientMail);
  } catch (mailErr) {
    console.warn('Aviso: email no enviado →', mailErr.message);
    // No bloqueamos la respuesta si el mail falla
  }

  /* 3 ── Respuesta exitosa ── */
  return res.status(200).json({
    success: true,
    message: 'Reserva creada exitosamente',
    eventLink,
  });
});

/* ── RUTA OAUTH2 CALLBACK (solo para obtener refresh_token 1ª vez) ── */
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Falta el código de autorización.');
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  console.log('\n✅ REFRESH TOKEN (guárdalo en .env):\n', tokens.refresh_token, '\n');
  res.send('<h1>✅ Autorización exitosa. Revisa la consola para copiar tu refresh_token.</h1>');
});

/* ── RUTA PARA GENERAR URL DE AUTH (solo primera vez) ── */
app.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt:      'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
  res.redirect(url);
});

/* ── START ──────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🎵 Sound Healing server corriendo en http://localhost:${PORT}`);
  console.log(`   Primera vez? Visita http://localhost:${PORT}/auth para autorizar Google Calendar\n`);
});
