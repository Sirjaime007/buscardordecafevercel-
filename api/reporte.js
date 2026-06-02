const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // 1. Cabeceras CORS obligatorias para navegadores móviles (Brave, Safari)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Respuesta rápida al Pre-flight de seguridad
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    // 3. Lectura de credenciales directa (A salvo del compilador de Vercel)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
        return res.status(500).send('Configuración del servidor incompleta: Faltan las variables en el panel de Vercel.FUNCIONAAAA');
    }

    // 4. Captura de datos del formulario (URLSearchParams)
    const tipo = req.body.tipo || 'No especificado';
    const local = req.body.local || 'No especificado';
    const detalle = req.body.detalle || 'Sin detalles extra aportados.';

    // 5. Configuración de envío
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
        subject: `🚨 Reporte: ${tipo} - ${local}`,
        html: `
            <div style="font-family: sans-serif; padding: 25px; background-color: #F8FAFC; color: #1E293B; max-width: 600px; border-radius: 16px; border: 1px solid #E2E8F0;">
                <h2 style="color: #5D4037; margin-top: 0; font-size: 1.5rem; border-bottom: 2px solid #E2E8F0; padding-bottom: 10px;">☕ Nuevo Reporte</h2>
                <p style="margin: 15px 0;"><strong style="color: #475569;">Novedad:</strong> <span style="background-color: #E2E8F0; padding: 4px 8px; border-radius: 6px; font-weight: bold;">${tipo}</span></p>
                <p style="margin: 15px 0;"><strong style="color: #475569;">Local / Ciudad:</strong> ${local}</p>
                <div style="margin-top: 20px; padding: 15px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0;">
                    <strong style="color: #475569; display: block; margin-bottom: 5px;">Detalles extras:</strong>
                    <p style="margin: 0; font-style: italic; color: #64748B;">${detalle}</p>
                </div>
            </div>
        `
    };

    // 6. Ejecución del envío
    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error crítico de Nodemailer:", error);
        return res.status(500).send(`Error al comunicarse con Google: ${error.message}`);
    }
};
