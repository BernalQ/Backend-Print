const express = require('express');\
const net = require('net');\
\
const app = express();\
const PORT = 3001;\
const PRINTER_PORT = 9100;\
\
app.use(express.json(\{ limit: '5mb' \}));\
\
// CORS m\'ednimo para que la PWA pueda hacer fetch desde otro origen\
app.use((req, res, next) => \{\
  res.setHeader('Access-Control-Allow-Origin', '*');\
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');\
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');\
  if (req.method === 'OPTIONS') return res.sendStatus(204);\
  next();\
\});\
\
// Acepta texto, un array de bytes o un Buffer serializado (\{ type: 'Buffer', data: [...] \})\
function toBuffer(data) \{\
  if (typeof data === 'string') return Buffer.from(data);\
  if (Array.isArray(data)) return Buffer.from(data);\
  if (data && data.type === 'Buffer' && Array.isArray(data.data)) return Buffer.from(data.data);\
  throw new Error('Formato de data no soportado');\
\}\
\
function sendToPrinter(ip, buffer) \{\
  return new Promise((resolve, reject) => \{\
    const socket = new net.Socket();\
    socket.setTimeout(5000);\
\
    socket.connect(PRINTER_PORT, ip, () => \{\
      socket.end(buffer); // env\'eda y cierra la conexi\'f3n\
    \});\
\
    socket.on('close', (hadError) => \{ if (!hadError) resolve(); \});\
    socket.on('timeout', () => \{\
      socket.destroy();\
      reject(new Error(`Tiempo de espera agotado conectando a $\{ip\}:$\{PRINTER_PORT\}`));\
    \});\
    socket.on('error', reject);\
  \});\
\}\
\
app.post('/print', async (req, res) => \{\
  const \{ printerIP, data \} = req.body || \{\};\
\
  if (!printerIP || data === undefined || data === null) \{\
    return res.status(400).send('Faltan printerIP o data');\
  \}\
\
  try \{\
    await sendToPrinter(printerIP, toBuffer(data));\
    res.send('Ticket enviado');\
  \} catch (err) \{\
    res.status(500).send(err.message);\
  \}\
\});\
\
app.listen(PORT, () => \{\
  console.log(`Backend-Print escuchando en http://localhost:$\{PORT\}`);\
\});\
}