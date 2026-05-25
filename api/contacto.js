export default async function handler(req, res) {
    // 1. CABECERAS GLOBALES (La clave para Safari, Brave y Chrome móvil)
    // Se aplican a CUALQUIER respuesta que salga de esta función
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Dejar pasar la "pregunta de seguridad" (OPTIONS) del celular
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Solo permitimos enviar datos (POST)
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    const { tipo, local, detalle } = req.body;
    
    // Leemos las claves secretas desde Vercel
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.error("ERROR: Faltan variables de entorno en Vercel.");
        return res.status(500).json({ error: 'Configuración faltante en el servidor.' });
    }

    const mensaje = `🚨 *Nuevo Reporte en el Buscador*\n\n*Tipo:* ${tipo}\n*Local/Ciudad:* ${local}\n*Detalle:* ${detalle || "Sin detalles extra"}`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: 'Markdown' })
        });

        const data = await response.json();

        // Ya no necesitamos setear el CORS acá porque lo pusimos arriba de todo

        if (response.ok) {
            // Importante usar return para terminar la ejecución
            return res.status(200).json({ success: true });
        } else {
            console.error("API RECHAZÓ EL MENSAJE:", data);
            return res.status(500).json({ error: 'Telegram rechazó el pedido', detalles: data });
        }
    } catch (error) {
        console.error("ERROR DEL SERVIDOR:", error);
        return res.status(500).json({ error: 'Error del servidor interno' });
    }
}
