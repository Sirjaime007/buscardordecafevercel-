export default async function handler(req, res) {
    // Solo permitimos que se envíen datos, no que se lean
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { tipo, local, detalle } = req.body;
    
    // El código lee las claves secretas desde la caja fuerte de Vercel
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const mensaje = `🚨 *Nuevo Reporte en el Buscador*\n\n*Tipo:* ${tipo}\n*Local/Ciudad:* ${local}\n*Detalle:* ${detalle || "Sin detalles extra"}`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: 'Markdown' })
        });

        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ error: 'Error de Telegram' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error del servidor' });
    }
}
