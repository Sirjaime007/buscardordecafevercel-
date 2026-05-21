export default async function handler(req, res) {
    // Solo permitimos que se envíen datos (método POST)
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { tipo, local, detalle } = req.body;
    
    // El código lee las claves secretas desde la "caja fuerte" de Vercel
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Validación de seguridad por si te olvidaste de cargar las variables en Vercel
    if (!botToken || !chatId) {
        console.error("ERROR CRÍTICO: Faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID en las variables de entorno de Vercel.");
        return res.status(500).json({ error: 'Configuración de seguridad faltante en el servidor (Vercel).' });
    }

    // Armamos el mensaje para Telegram
    const mensaje = `🚨 *Nuevo Reporte en el Buscador*\n\n*Tipo:* ${tipo}\n*Local/Ciudad:* ${local}\n*Detalle:* ${detalle || "Sin detalles extra"}`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: 'Markdown' })
        });

        const data = await response.json();

        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            console.error("TELEGRAM API REJECTED MESSAGE:", data);
            res.status(500).json({ error: 'Telegram rechazó el pedido', detalles: data });
        }
    } catch (error) {
        console.error("INTERNAL SERVER ERROR:", error);
        res.status(500).json({ error: 'Error del servidor' });
    }
}

