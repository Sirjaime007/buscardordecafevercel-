export default async function handler(req, res) {
  // Solo aceptamos peticiones POST (seguridad)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Recibimos el mensaje del usuario y la lista de cafés desde tu web
  const { mensaje, contextoCafes } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la llave de Gemini en Vercel' });
  }

  try {
    // Le damos una personalidad a COFI y le inyectamos tu base de datos
    const prompt = `Sos COFI, el asistente virtual experto en café de especialidad de la página COFITECA en Argentina.
    Sos amigable, usás un tono argentino sutil (usás "vos", "che", etc.) y respuestas concisas (no más de 2 o 3 párrafos cortos). 
    
    ACLARACIÓN IMPORTANTE: Solo podés recomendar cafeterías que estén en la siguiente lista de nuestra base de datos. Si te preguntan por un café que no está acá, decí que aún no lo tenemos mapeado.
    
    BASE DE DATOS DE COFITECA:
    ${contextoCafes}
    
    Pregunta del usuario: "${mensaje}"
    `;

    // CAMBIO CLAVE: Usamos gemini-1.5-flash-latest
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await geminiRes.json();
    
    if (!geminiRes.ok) {
       throw new Error(data.error?.message || 'Error al conectar con Gemini');
    }

    // Le devolvemos la respuesta de Gemini a tu página
    const respuestaTexto = data.candidates[0].content.parts[0].text;
    res.status(200).json({ respuesta: respuestaTexto });

  } catch (error) {
    console.error("Error del servidor:", error);
    res.status(500).json({ error: 'Uy, los granos se atascaron. Intentá de nuevo en un ratito.' });
  }
}
