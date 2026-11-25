# Sitio de Maye · puesta en marcha

## Lo que está preparado

- Inicio con separación punteada rosa, márgenes móviles ampliados, newsletter y descarga gratuita.
- Cuatro páginas de servicio en `servicios/`, con llamadas a conversar con Maye por WhatsApp.
- Checklist de cuatro páginas y 16 preguntas en `private/checklist-4-pilares.pdf`.
- Asistente guiado que recomienda una ruta y prepara la pregunta para WhatsApp. La persona decide enviarla. No usa IA ni guarda conversaciones.
- Confirmación del correo antes de activar una suscripción o entregar el PDF.
- Seguimiento opcional de la checklist y baja de comunicaciones.

## Activar el correo

El código está preparado, pero no envía correos hasta completar la configuración. Abrir `index.html` directamente permite revisar el diseño; los formularios necesitan el servidor.

1. Usar Node.js 24 o posterior.
2. Copiar `.env.example` a `.env` y completar los valores localmente. Nunca publicar `.env` ni compartir la clave en un chat.
3. Verificar en Resend el dominio del remitente. Configurar `RESEND_API_KEY`, `MAIL_FROM` (nombre y correo verificado), `MAIL_REPLY_TO`, `SITE_URL` (origen completo, sin barra final) y `CONTACT_POSTAL_ADDRESS` (dirección de contacto que aparecerá al pie de los correos).
4. Ejecutar `npm start` y abrir `http://127.0.0.1:4173` para la revisión local. En producción, `SITE_URL` debe coincidir con el dominio HTTPS público.
5. Hospedar como un servicio Node siempre activo, con almacenamiento persistente para `private/data`. Un alojamiento de archivos estáticos por sí solo no ejecuta los formularios ni la secuencia.
6. Hacer una suscripción real con un correo de prueba autorizado: comprobar confirmación, descarga, bienvenida y baja antes del lanzamiento.

La aplicación usa SQLite y un trabajador de correos cada 30 segundos. Mantener una sola instancia del proceso y conservar copias de seguridad de la base de datos. Si se despliega detrás de un proxy, configurar límites de solicitudes en ese proxy: la aplicación limita por dirección de conexión y no confía en cabeceras reenviadas.

## Recorrido del visitante

| Momento | Acción |
| --- | --- |
| Solicitud | Recibe un enlace de confirmación válido durante 48 horas. |
| Confirmación explícita | Se activa la suscripción elegida; la checklist queda disponible para descargar y se envía su enlace. |
| Día 2, solo con autorización | Idea práctica: documentar una tarea frecuente. |
| Día 5, solo con autorización | Conectar documentos, incorporación y formación del equipo. |
| Día 8, solo con autorización | Invitación a conversar con Maye sobre la prioridad elegida. |
| Baja | Se cancelan seguimientos pendientes y se actualiza el contacto en Resend. |

La newsletter tiene su propio formulario y un correo de bienvenida. Sus futuras ediciones se redactan y envían desde Resend; este proyecto no inventa una periodicidad ni programa publicaciones. El seguimiento de la checklist tiene una autorización independiente: no usar esa lista para la newsletter sin consentimiento adicional.

Los contactos que solo solicitan la checklist se conservan en la base local y no se añaden a los contactos de marketing de Resend. La aplicación registra fecha y versión del consentimiento. Los correos promocionales incluyen enlace de baja. Las preguntas del asistente no se guardan en la base de contactos.

## Verificación realizada

`npm test` comprueba con un proveedor simulado: confirmación previa a la descarga, separación de consentimiento, baja y cancelación de seguimiento, bienvenida de newsletter, caducidad, protección de archivos privados y fallos de envío. No envía mensajes reales.

La clave, el dominio, el remitente y la dirección siguen pendientes de configuración. No se ha publicado el sitio ni probado la entregabilidad de Resend con una cuenta real.

Referencia del proveedor: https://resend.com/docs/api-reference/emails/send-email
