# Backend-Print

Backend mínimo en Node.js + Express que recibe órdenes de impresión desde una PWA y las envía por TCP al puerto 9100 de una impresora térmica en la LAN.

## Instalación y arranque

```bash
npm install
npm start
```

Queda escuchando en `http://localhost:3001`.

## Uso

`POST /print` con body JSON:

```json
{ "printerIP": "10.0.5.247", "data": "Hola mundo\n\n\n" }
```

`data` puede ser:
- un texto (string), por ejemplo con comandos ESC/POS escapados (`"\u001b@Hola\n\u001dV\u0000"`),
- un array de bytes (`[27, 64, 72, 111, 108, 97, 10]`),
- un Buffer serializado (`{ "type": "Buffer", "data": [27, 64, ...] }`).

Respuestas:
- `200 Ticket enviado` si se envió correctamente.
- `400` si faltan `printerIP` o `data`.
- `500` con el mensaje de error (impresora inalcanzable, timeout de 5 s, etc.).

## Ejemplo desde la PWA

```js
const res = await fetch('http://localhost:3001/print', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ printerIP: '10.0.5.247', data: 'Ticket de prueba\n\n\n' })
});
console.log(await res.text());
```

El servidor incluye cabeceras CORS abiertas (`Access-Control-Allow-Origin: *`) para que la PWA pueda llamarlo desde otro origen.
