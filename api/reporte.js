import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // Cabeceras CORS globales para que los celulares entren sin restricciones
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Resolver la verificación obligatoria OPTIONS de los navegadores móviles
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { tipo, local, detalle } = req.body;
    
    // Leemos las credenciales seguras desde las variables de entorno de Vercel
    const emailUser = process.env.EMAIL_USER; 
    const emailPass = process.env.EMAIL_PASS; 

    if (!emailUser || !emailPass) {
        console.error("ERROR: Faltan las variables de entorno de email en Vercel.");
        return res.status(500).json({ error: 'Configuración del servidor incompleta.' });
    }

    // Configuración del transporte seguro de Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass // Tu Contraseña de Aplicación generada en Google
        }
    });

    // Diseño del correo electrónico que vas a recibir
    const mailOptions = {
        from: `"Buscador de Café" <${emailUser}>`,
        to: 'buscadordecafe@gmail.com',
        subject: `🚨 Nuevo Reporte: ${tipo} - ${local}`,
        text: `Nuevo reporte recibido:\n\nTipo: ${tipo}\nLocal/Ciudad: ${local}\nDetalles: ${detalle || "Sin detalles extra"}`,
        html: `
            <div style="font-family: sans-serif; padding: 25px; background-color: #F8FAFC; color: #1E293B; max-width: 600px; border-radius: 16px; border: 1px solid #E2E8F0;">
                <h2 style="color: #5D4037; margin-top: 0; font-size: 1.5rem; border-bottom: 2px solid #E2E8F0; padding-bottom: 10px;">☕ Nuevo Reporte en la Plataforma</h2>
                <p style="margin: 15px 0;"><strong style="color: #475569;">Tipo de novedad:</strong> <span style="background-color: #E2E8F0; padding: 4px 8px; border-radius: 6px; font-weight: bold;">${tipo}</span></p>
                <p style="margin: 15px 0;"><strong style="color: #475569;">Local / Ciudad:</strong> ${local}</p>
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
        console.error("ERROR ENVIANDO EL EMAIL:", error);
        return res.status(500).json({ error: 'Error interno al procesar el correo', detalles: error.message });
    }
}
