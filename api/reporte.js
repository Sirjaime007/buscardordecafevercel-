import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Cabeceras CORS globales necesarias para entornos móviles
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Resolver verificación OPTIONS de navegadores paranoicos
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    // Vercel parsea automáticamente tanto JSON como formularios urlencoded en req.body
    const { tipo, local, detalle } = req.body;

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    // Validación estricta de credenciales en el entorno de ejecución
    if (!emailUser || !emailPass) {
        console.error("ERROR: Credenciales no detectadas en el servidor Vercel.");
        return res.status(500).send('Configuración del servidor incompleta: Faltan las variables de entorno en el panel de Vercel.');
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    const mailOptions = {
        from: `"Buscador de Café" <${emailUser}>`,
        to: 'buscadordecafe@gmail.com',
        subject: `🚨 Nuevo Reporte: ${tipo || 'General'} - ${local || 'Sin especificar'}`,
        html: `
            <div style="font-family: sans-serif; padding: 25px; background-color: #F8FAFC; color: #1E293B; max-width: 600px; border-radius: 16px; border: 1px solid #E2E8F0;">
                <h2 style="color: #5D4037; margin-top: 0; font-size: 1.5rem; border-bottom: 2px solid #E2E8F0; padding-bottom: 10px;">☕ Nuevo Reporte en la Plataforma</h2>
                <p style="margin: 15px 0;"><strong style="color: #475569;">Tipo de novedad:</strong> <span style="background-color: #E2E8F0; padding: 4px 8px; border-radius: 6px; font-weight: bold;">${tipo || 'No especificado'}</span></p>
                <p style="margin: 15px 0;"><strong style="color: #475569;">Local / Ciudad:</strong> ${local || 'No especificado'}</p>
                <div style="margin-top: 20px; padding: 15px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0;">
                    <strong style="color: #475569; display: block; margin-bottom: 5px;">Detalles extras aportados:</strong>
                    <p style="margin: 0; font-style: italic; color: #64748B;">${detalle || "No se especificaron detalles adicionales."}</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error en Nodemailer:", error);
        return res.status(500).send(`Error al enviar el correo: ${error.message}`);
    }
}
