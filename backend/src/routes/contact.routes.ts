import { Router } from 'express';
import nodemailer from 'nodemailer';
import prisma from '../repository/prisma';

const router = Router();

router.post('/', async (req, res, next) => {
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

    const destSetting = await prisma.siteSetting.findUnique({ where: { key: 'contact_email' } });
    const destEmail = destSetting?.value || process.env.CONTACT_EMAIL || '';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!destEmail || !smtpUser || !smtpPass) {
      console.log(`\n📩 ===== MENSAJE DE CONTACTO =====`);
      console.log(`   De: ${name} <${email}>`);
      console.log(`   Para: ${destEmail || '(no configurado - usa CONTACT_EMAIL o SMTP_USER)'}`);
      console.log(`   Mensaje: ${message}`);
      console.log(`==================================\n`);
      res.json({ success: true, message: 'Mensaje recibido correctamente.' });
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${process.env.SMTP_FROM || smtpUser}>`,
      to: destEmail,
      replyTo: email,
      subject: `Contacto desde Ministerio REDES — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#C9A84C;border-bottom:2px solid #C9A84C;padding-bottom:8px">Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
          <p style="white-space:pre-wrap;line-height:1.6">${message}</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Mensaje enviado correctamente.' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje. Intenta de nuevo.' });
  }
});

export default router;
