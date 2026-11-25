from pathlib import Path
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
ROOT=Path(__file__).resolve().parents[1]
out=ROOT/'private/checklist-4-pilares.pdf';c=Canvas(str(out),pagesize=(595,842));c.setTitle('Checklist de los 4 pilares | Maye Gómez');c.setAuthor('Maye Gómez')
TEAL=HexColor('#004B5F');PINK=HexColor('#C39D96');INK=HexColor('#233C46');MUTED=HexColor('#52666E');LIGHT=HexColor('#F8EFED')
def text(x,y,value,size=11,color=INK,font='Helvetica',width=485):
 c.setFillColor(color);c.setFont(font,size)
 for line in simpleSplit(value,font,size,width):c.drawString(x,y,line);y-=size*1.5
 return y

def base(n,kicker,title,subtitle):
 c.setFillColor(HexColor('#FFFFFF'));c.rect(0,0,595,842,fill=1,stroke=0)
 c.drawImage(str(ROOT/'propuestas/assets/logo-maye-gomez.png'),48,755,width=65,height=47,mask='auto',preserveAspectRatio=True)
 text(355,779,'CONSULTORA DE EMPRESAS',8,MUTED,width=200)
 text(48,719,kicker.upper(),9,TEAL)
 y=text(48,683,title,29,TEAL,'Times-Roman');text(48,y-10,subtitle,11,MUTED)
 c.setStrokeColor(PINK);c.line(48,58,547,58);text(48,39,'Maye Gómez · Conocimiento, documentos y tecnología',8,MUTED);text(515,39,f'{n} / 4',8,MUTED)

def block(y,number,title,questions):
 c.setFillColor(LIGHT);c.roundRect(48,y-31,499,38,8,fill=1,stroke=0);text(61,y-16,number+'  '+title,16,TEAL,'Times-Roman')
 y-=55
 for q in questions:
  y=text(53,y,q,10.5,width=485)
  c.setStrokeColor(HexColor('#9FAEB2'))
  for x,label in [(57,'Sí'),(143,'A medias'),(267,'Pendiente')]:
   c.rect(x,y-6,9,9,fill=0,stroke=1);text(x+16,y-5,label,9,MUTED)
  y-=36
 return y
base(1,'Recurso gratuito · punto de partida','Mira tu negocio con claridad.','Marca lo que ya existe, lo que está a medias y lo que necesitas ordenar. Responde según lo que el equipo puede usar hoy, no solo lo que tú sabes.')
y=block(575,'01','Personas',[
'Cada persona puede explicar sus responsabilidades principales.',
'El equipo sabe a quién acudir cuando tiene una duda o un bloqueo.',
'Quien se incorpora tiene una ruta de aprendizaje para su cargo.',
'Los procedimientos y materiales de formación están disponibles para el equipo.'])
text(48,y-8,'Antes de continuar',16,TEAL,'Times-Roman');text(48,y-37,'Busca una evidencia: una descripción de cargo, una guía o una ruta de formación. Si solo existe en tu memoria, marca «A medias».',11,MUTED)
c.showPage()
base(2,'Revisión práctica','Clientes y dinero.','La información organizada facilita el seguimiento y las decisiones de cada día.')
y=block(579,'02','Clientes',[
'Hay un paso claro para recibir y registrar una consulta.',
'El equipo conoce qué información reunir antes de preparar una propuesta.',
'La persona responsable del seguimiento está definida.',
'Los acuerdos, cambios y comentarios del cliente quedan registrados.'])
block(y-8,'03','Dinero',[
'Los cobros pendientes se pueden consultar en un solo lugar.',
'Los ingresos y gastos se registran con una frecuencia definida.',
'Existe una persona responsable de mantener esa información al día.',
'Revisas la información del negocio antes de comprometer nuevos gastos.'])
c.showPage()
base(3,'Revisión práctica','Operaciones que se pueden repetir.','El objetivo es encontrar una prioridad concreta para compartir mejor el conocimiento del negocio.')
y=block(579,'04','Operaciones',[
'Las tareas frecuentes tienen pasos que el equipo puede consultar.',
'El estándar de calidad está explicado con ejemplos o criterios concretos.',
'Cada servicio tiene una forma de comprobar que el trabajo se completó.',
'Cuando algo cambia, hay una manera de actualizarlo y comunicarlo.'])
text(48,y-3,'Elige por dónde empezar',18,TEAL,'Times-Roman')
y=text(48,y-35,'Revisa tus respuestas «A medias» y «Pendiente». Elige una que se repita con frecuencia, afecte el trabajo de otras personas y puedas empezar a ordenar esta semana.',11,MUTED)
text(48,y-15,'Mi prioridad es:',10,TEAL);c.setStrokeColor(PINK)
for yy in [y-42,y-68]:c.line(48,yy,547,yy)
c.showPage()
base(4,'Tu siguiente paso','Una mejora pequeña, bien definida.','Convierte la prioridad elegida en una acción que puedas compartir con tu equipo.')
y=573
for title,detail in [
('Qué voy a ordenar','Nombra una tarea, decisión o información concreta.'),
('Qué recurso hace falta','Por ejemplo: una guía breve, un registro o una lista de verificación.'),
('Quién lo prepara y quién lo usa','Define responsable y personas que necesitan consultarlo.'),
('Cuándo lo revisaremos','Pon una fecha y observa si el recurso ayuda en la práctica.')]:
 text(48,y,title,16,TEAL,'Times-Roman');text(48,y-23,detail,10,MUTED);c.setStrokeColor(PINK);c.line(48,y-54,547,y-54);y-=99
c.setFillColor(LIGHT);c.roundRect(48,97,499,70,10,fill=1,stroke=0)
text(62,145,'¿Quieres ordenar esta prioridad con acompañamiento?',13,TEAL,'Times-Roman')
text(62,122,'Conversa con Maye por WhatsApp: +58 412 478 4922',10,INK)
c.linkURL('https://wa.me/584124784922?text=Hola%20Maye%2C%20revis%C3%A9%20la%20checklist%20y%20quiero%20conversar%20sobre%20mi%20prioridad.',(48,97,547,167),relative=0)
c.save();print(out)
