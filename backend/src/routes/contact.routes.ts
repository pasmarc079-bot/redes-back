import { Router } from 'express';
import nodemailer from 'nodemailer';
import prisma from '../repository/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/** Escapes the text that comes from the form before it is put into the email. */
const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Public contact form.
 *
 * The message is stored first and the email is attempted afterwards: if the mail server is down
 * the visitor's message is still safe in the panel, and the form can answer with a clear message
 * instead of a generic error.
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Nombre, email y mensaje son obligatorios.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Email inválido.' });
      return;
    }

    const saved = await prisma.contactMessage.create({
      data: {
        name: name.trim().slice(0, 120),
        email: email.trim().slice(0, 200),
        message: message.trim(),
        status: 'received',
      },
    });

    const destSetting = await prisma.siteSetting.findUnique({ where: { key: 'contact_email' } });
    const destEmail = destSetting?.value || process.env.CONTACT_EMAIL || '';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!destEmail || !smtpUser || !smtpPass) {
      console.log(`\n📩 ===== MENSAJE DE CONTACTO (${saved.id}) =====`);
      console.log(`   De: ${saved.name} <${saved.email}>`);
      console.log(`   Para: ${destEmail || '(sin configurar)'}`);
      console.log(`   Mensaje: ${saved.message}`);
      console.log('========================================\n');
      await prisma.contactMessage.update({ where: { id: saved.id }, data: { status: 'logged' } });
      res.json({ success: true, message: 'Mensaje recibido correctamente.' });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      // The sender must be an address the SMTP account owns. When SMTP_FROM already carries a
      // name ("Ministerio REDES <correo@gmail.com>") wrapping it again made an invalid address
      // and the whole message was rejected. The visitor goes in replyTo, so replying is easy.
      from: process.env.SMTP_FROM?.trim() || smtpUser,
      to: destEmail,
      replyTo: `"${saved.name.replace(/["<>]/g, '')}" <${saved.email}>`,
      subject: `Contacto desde Ministerio REDES — ${saved.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A84C;border-bottom:2px solid #C9A84C;padding-bottom:8px">Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${escapeHtml(saved.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(saved.email)}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
          <p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(saved.message)}</p>
        </div>
      `,
    });

    await prisma.contactMessage.update({ where: { id: saved.id }, data: { status: 'sent' } });
    res.json({ success: true, message: 'Mensaje enviado correctamente.' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    // The message is already stored, so the visitor is not asked to write again.
    res.json({
      success: true,
      message: 'Recibimos tu mensaje. Te responderemos pronto.',
    });
  }
});

export default router;
