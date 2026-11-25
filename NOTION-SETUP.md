# Guía de Conexión: Notion CRM + Resend para Maye Gómez

Esta guía te explica cómo conectar tu base de datos de Notion para recibir automáticamente a cada clienta que descargue la checklist o se suscriba a la newsletter desde tu web alojada en Vercel.

---

## Paso 1: Crear tu Base de Datos en Notion

1. Abre tu espacio de Notion y crea una nueva página llamada **"Leads Maye Gómez"** (o el nombre que prefieras).
2. Elige la opción **"Tabla" (Table)** -> **"Nueva base de datos" (New database)**.
3. Asegúrate de que las columnas (propiedades) tengan exactamente estos nombres y tipos:

| Nombre de la Columna | Tipo de Propiedad en Notion | Descripción |
| :--- | :--- | :--- |
| **Nombre** | `Título` (Title - viene por defecto) | El nombre de la persona |
| **Email** | `Email` | Su correo electrónico |
| **Tipo** | `Selección` (Select) | Opciones automáticas: *Checklist 4 Pilares* o *Newsletter* |
| **Fecha** | `Fecha` (Date) | Fecha y hora exacta del registro |
| **Estado** | `Selección` (Select) | Puedes añadir opciones como: *Nuevo Lead*, *Contactada*, *Cliente Cerrado* |

---

## Paso 2: Crear tu Integración en Notion (API Key)

1. Ve a [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations).
2. Haz clic en **"+ New integration"** (Nueva integración).
3. Configúrala así:
   * **Name:** `Web Maye Gómez`
   * **Associated workspace:** Selecciona tu espacio de Notion.
   * **Capabilities:** Asegúrate de que tenga permisos de lectura, escritura e inserción de contenido (vienen marcados por defecto).
4. Haz clic en **Save** / **Submit**.
5. Copia el **"Internal Integration Secret"** (comienza por `secret_...`). Este es tu `NOTION_API_KEY`.

---

## Paso 3: Conectar la Integración a tu Tabla

> **IMPORTANTE:** Por seguridad, Notion no permite que nadie acceda a una tabla a menos que tú la invites explícitamente.

1. Vuelve a tu tabla de Notion creada en el Paso 1.
2. Arriba a la derecha, haz clic en los **tres puntos (`...`)** o en el botón **"Share" (Compartir)**.
3. Busca la opción **"Connections"** (Conexiones) o **"Add connections"**.
4. Selecciona tu integración **"Web Maye Gómez"** y confirma el acceso.

---

## Paso 4: Obtener el `NOTION_DATABASE_ID`

1. Con tu tabla abierta en Notion, haz clic arriba a la derecha en **"Share"** -> **"Copy link"** (Copiar enlace).
2. El enlace tendrá una estructura como esta:
   ```
   https://www.notion.so/tu-usuario/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6?v=...
   ```
3. El ID de la base de datos es la serie de **32 caracteres** entre la última barra `/` y el signo de interrogación `?`:
   * Ejemplo de ID: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   *(Si el enlace tiene guiones, puedes copiarlo con guiones o sin guiones; ambos funcionan).*

---

## Paso 5: Configurar Resend (Para envío de correos)

1. Entra a [https://resend.com](https://resend.com) y crea tu cuenta gratuita.
2. Ve a la pestaña **"API Keys"** y haz clic en **"Create API Key"**.
3. Dale de nombre `Web Maye` y copia la clave generada (`re_...`).

*(Nota: En el plan gratuito de Resend, para pruebas iniciales puedes enviar desde `onboarding@resend.dev` hacia tu propio correo. Cuando quieras enviar desde tu dominio propio como `hola@mayegomez.com`, solo agregas tu dominio en la pestaña "Domains" de Resend).*

---

## Paso 6: Agregar las Variables en Vercel

Cuando importes tu repositorio de GitHub en Vercel:

1. En la pantalla de configuración del proyecto en Vercel (o en **Project Settings** -> **Environment Variables**), agrega estas 5 variables:

```bash
RESEND_API_KEY = re_tu_clave_de_resend
MAIL_FROM = Maye Gómez <onboarding@resend.dev>
NOTION_API_KEY = secret_tu_clave_de_notion
NOTION_DATABASE_ID = tu_id_de_tabla_de_notion
SITE_URL = https://tu-proyecto.vercel.app
```

2. Haz clic en **Deploy**.

¡Y listo! A partir de ese momento, cada vez que una clienta descargue la checklist en tu web o se suscriba a la newsletter:
1. Verás aparecer su fila inmediatamente en tu tabla de **Notion**.
2. **Resend** le enviará el correo con el botón de descarga del PDF al instante.
3. Tu web seguirá siendo 100% **HTML puro, sin perder estilos, animaciones ni velocidad**.
