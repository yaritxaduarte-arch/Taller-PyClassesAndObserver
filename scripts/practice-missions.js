export const PRACTICE_MARKER = "python-classes-practice";

export const missions = [
  {
    id: 1,
    title: "Preparar entorno virtual",
    summary: "Crearas un entorno virtual local y documentaras como instalar las dependencias.",
    why: "El entorno virtual separa las dependencias de este proyecto de las instaladas en tu sistema.",
    body: `## Objetivo
Crear y activar un entorno virtual para trabajar la practica de Python.

## Pasos sugeridos
- En tu computador, ejecuta \`python3 -m venv .venv\`.
- Activa el entorno con \`source .venv/bin/activate\` o con \`.venv\\Scripts\\activate\` en Windows.
- Instala dependencias con \`pip install -r requirements.txt\`.
- Edita \`README.md\` y revisa la seccion \`Crear el entorno virtual\` con los comandos que usaste.
- Haz commit y push de tu cambio.

## Criterio de cierre
El workflow cerrara este issue cuando el README documente el entorno virtual y las dependencias de la practica.`
  },
  {
    id: 2,
    title: "Crear estructura del paquete Python",
    summary: "Crearas los archivos base donde viviran las clases de la practica.",
    why: "Una estructura de paquete ordenada evita imports fragiles y facilita ejecutar pruebas.",
    body: `## Objetivo
Crear la estructura principal del codigo Python.

## Antes de empezar
En Python, un proyecto se puede organizar en archivos y carpetas:

- Un archivo \`.py\` se llama modulo.
- Una carpeta con \`__init__.py\` se puede usar como paquete.
- Un paquete permite importar codigo usando rutas como \`observer_practice.canal\`.
- La carpeta \`src\` separa el codigo de la aplicacion de las pruebas y otros archivos del repositorio.

En esta practica, el paquete se llamara \`observer_practice\`.

## Pasos sugeridos
- Crea la carpeta \`src/observer_practice\` si todavia no existe.
- Crea \`src/observer_practice/__init__.py\`. Puede quedar vacio; su presencia ayuda a Python a reconocer la carpeta como paquete.
- Crea \`src/observer_practice/observer.py\`. Aqui ira el contrato de lo que significa ser observador.
- Crea \`src/observer_practice/suscriptores.py\`. Aqui iran las clases de personas o canales que reciben mensajes.
- Crea \`src/observer_practice/canal.py\`. Aqui ira la clase que publica noticias.
- Revisa que los nombres esten escritos exactamente igual. En Python, \`Canal.py\` y \`canal.py\` no son lo mismo en todos los sistemas.
- Haz commit y push.

## Comandos utiles
\`\`\`bash
mkdir -p src/observer_practice
touch src/observer_practice/__init__.py
touch src/observer_practice/observer.py
touch src/observer_practice/suscriptores.py
touch src/observer_practice/canal.py
git status
\`\`\`

## Criterio de cierre
El workflow cerrara este issue cuando existan los archivos base del paquete.`
  },
  {
    id: 3,
    title: "Crear la clase SuscriptorEmail",
    summary: "Implementaras una primera clase con atributos, estado interno y un metodo de actualizacion.",
    why: "Antes de usar patrones de diseno, necesitas dominar como una clase guarda datos y expone comportamiento.",
    body: `## Objetivo
Crear una clase \`SuscriptorEmail\` en \`src/observer_practice/suscriptores.py\`.

## Que es una clase
Una clase es un molde para crear objetos. El molde define:

- que datos tendra cada objeto;
- que acciones podra realizar;
- como se inicializa cuando lo creas.

Por ejemplo, \`SuscriptorEmail\` sera el molde. Cuando escribas \`SuscriptorEmail("Ana")\`, crearas un objeto concreto que representa a Ana.

## Partes importantes
- \`class SuscriptorEmail:\` crea la clase.
- \`__init__\` es un metodo especial que se ejecuta automaticamente al crear el objeto.
- \`self\` representa el objeto actual. Si el objeto es Ana, \`self.nombre\` sera el nombre de Ana.
- \`self.mensajes = []\` crea una lista propia para ese objeto.
- \`actualizar\` sera el metodo que el canal llamara cuando haya una noticia nueva.
- \`__str__\` permite que el objeto tenga una representacion legible cuando se convierte a texto.

## Implementacion sugerida
Puedes usar esta base y leer cada linea antes de copiarla:

\`\`\`python
class SuscriptorEmail:
    def __init__(self, nombre):
        self.nombre = nombre
        self.canal = "email"
        self.mensajes = []

    def actualizar(self, mensaje):
        self.mensajes.append(mensaje)

    def __str__(self):
        return f"{self.nombre} por {self.canal}"
\`\`\`

## Que hace cada linea
- \`self.nombre = nombre\`: guarda el nombre recibido al crear el objeto.
- \`self.canal = "email"\`: indica que este suscriptor recibe mensajes por email.
- \`self.mensajes = []\`: prepara una lista vacia para guardar las noticias recibidas.
- \`self.mensajes.append(mensaje)\`: agrega el mensaje nuevo al final de la lista.
- \`return f"{self.nombre} por {self.canal}"\`: devuelve un texto facil de leer.

## Pasos sugeridos
- Abre \`src/observer_practice/suscriptores.py\`.
- Escribe la clase \`SuscriptorEmail\`.
- Guarda los atributos \`nombre\`, \`canal\` y \`mensajes\` dentro de \`__init__\`.
- Usa \`canal = "email"\`.
- Crea \`actualizar(self, mensaje)\` para agregar mensajes a la lista.
- Agrega \`__str__\` para representar el suscriptor de forma legible.
- Ejecuta una prueba manual con \`python\` si quieres comprobarlo:

\`\`\`python
from observer_practice.suscriptores import SuscriptorEmail

ana = SuscriptorEmail("Ana")
ana.actualizar("Primera noticia")
print(ana.mensajes)
print(ana)
\`\`\`

- Haz commit y push.

## Criterio de cierre
El workflow cerrara este issue cuando pueda crear un \`SuscriptorEmail\` y verificar que guarda mensajes.`
  },
  {
    id: 4,
    title: "Agregar contrato de observador y SuscriptorSMS",
    summary: "Expresaras el contrato de un observador y crearas una segunda clase de suscriptor.",
    why: "Observer funciona mejor cuando todos los observadores comparten una misma operacion esperada.",
    body: `## Objetivo
Crear un contrato para observadores y una clase \`SuscriptorSMS\`.

## Que es un observador
En el patron Observer, un observador es cualquier objeto que puede recibir una notificacion.

Para esta practica, todos los observadores deben entender este mensaje:

\`\`\`python
actualizar(mensaje)
\`\`\`

Eso significa que no importa si el observador es de email, SMS u otro tipo: si tiene un metodo \`actualizar\`, el canal podra avisarle.

## Que es un contrato
Un contrato describe que metodos debe tener una clase para participar en una relacion. En Python puedes expresarlo con \`Protocol\`:

\`\`\`python
from typing import Protocol


class Observador(Protocol):
    def actualizar(self, mensaje):
        ...
\`\`\`

La linea \`...\` significa "este metodo existe, pero aqui no escribimos su implementacion". Cada clase concreta lo implementara a su manera.

## Crear una segunda clase
\`SuscriptorSMS\` sera muy parecido a \`SuscriptorEmail\`, pero con \`canal = "sms"\`. Repetir esta clase al inicio es normal: te ayuda a ver que dos objetos distintos pueden compartir el mismo metodo \`actualizar\`.

Ejemplo:

\`\`\`python
class SuscriptorSMS:
    def __init__(self, nombre):
        self.nombre = nombre
        self.canal = "sms"
        self.mensajes = []

    def actualizar(self, mensaje):
        self.mensajes.append(mensaje)

    def __str__(self):
        return f"{self.nombre} por {self.canal}"
\`\`\`

## Pasos sugeridos
- En \`observer.py\`, define un \`Protocol\` o una clase base abstracta con el metodo \`actualizar(self, mensaje)\`.
- En \`suscriptores.py\`, crea \`SuscriptorSMS\`.
- Usa \`canal = "sms"\`.
- Reutiliza la misma idea de \`mensajes\` y \`actualizar\`.
- Verifica que tanto \`SuscriptorEmail\` como \`SuscriptorSMS\` tengan un metodo llamado exactamente \`actualizar\`.
- Haz commit y push.

## Criterio de cierre
El workflow cerrara este issue cuando existan el contrato de observador y la clase SMS con comportamiento equivalente.`
  },
  {
    id: 5,
    title: "Crear la clase CanalNoticias",
    summary: "Implementaras el sujeto observable que administrara una lista de observadores.",
    why: "El sujeto observable concentra los cambios y evita que cada observador tenga que preguntar por novedades.",
    body: `## Objetivo
Crear \`CanalNoticias\` en \`src/observer_practice/canal.py\`.

## Que representa esta clase
\`CanalNoticias\` sera el sujeto observable. Eso significa que:

- guarda una lista de observadores;
- permite suscribir nuevos observadores;
- permite quitar observadores;
- mas adelante avisara a todos cuando publique una noticia.

En esta mision solo prepararas la clase para administrar la lista. La notificacion completa vendra en la siguiente mision.

## Atributos que debes crear
- \`self.nombre\`: nombre del canal, por ejemplo \`"Python al dia"\`.
- \`self.observadores\`: lista donde se guardan los objetos suscritos.
- \`self.ultimo_mensaje\`: el ultimo mensaje publicado. Al comienzo debe ser \`None\` porque todavia no hay noticias.

## Metodos que debes crear
- \`suscribir(self, observador)\`: recibe un objeto y lo agrega a la lista.
- \`desuscribir(self, observador)\`: recibe un objeto y lo quita de la lista si estaba suscrito.

Es importante evitar duplicados. Si el mismo observador se suscribe dos veces, solo debe quedar una vez en la lista.

## Implementacion sugerida
\`\`\`python
class CanalNoticias:
    def __init__(self, nombre):
        self.nombre = nombre
        self.observadores = []
        self.ultimo_mensaje = None

    def suscribir(self, observador):
        if observador not in self.observadores:
            self.observadores.append(observador)

    def desuscribir(self, observador):
        if observador in self.observadores:
            self.observadores.remove(observador)
\`\`\`

## Que hace cada parte
- \`observadores = []\`: crea una lista vacia de personas o servicios que quieren recibir noticias.
- \`if observador not in self.observadores\`: evita guardar el mismo objeto dos veces.
- \`append\`: agrega un observador al final de la lista.
- \`remove\`: elimina un observador de la lista.
- \`None\`: representa la ausencia de valor; aqui significa que todavia no se ha publicado ningun mensaje.

## Pasos sugeridos
- Define \`__init__(self, nombre)\`.
- Guarda \`nombre\`, \`observadores\` y \`ultimo_mensaje\`.
- Implementa \`suscribir(self, observador)\`.
- Implementa \`desuscribir(self, observador)\`.
- Evita duplicar el mismo observador.
- Haz commit y push.

## Criterio de cierre
El workflow cerrara este issue cuando la clase pueda suscribir y desuscribir observadores.`
  },
  {
    id: 6,
    title: "Implementar notificacion Observer",
    summary: "Conectaras el canal con sus observadores mediante los metodos notificar y publicar.",
    why: "Este es el corazon del patron: el sujeto avisa a todos los observadores sin conocer sus detalles internos.",
    body: `## Objetivo
Completar el comportamiento Observer.

## Como se conecta todo
Ya tienes observadores con un metodo \`actualizar(mensaje)\` y tienes un canal con una lista de observadores. Ahora falta que el canal recorra esa lista y avise a cada uno.

La idea central es esta:

- El canal no necesita saber si el observador es email o SMS.
- El canal solo necesita confiar en que cada observador tiene \`actualizar\`.
- Cada observador decide como guardar o procesar el mensaje.

## Metodos nuevos
- \`notificar(self, mensaje)\`: recorre \`self.observadores\` y llama \`observador.actualizar(mensaje)\`.
- \`publicar(self, mensaje)\`: guarda el mensaje en \`self.ultimo_mensaje\` y luego llama \`self.notificar(mensaje)\`.

## Implementacion sugerida
\`\`\`python
def notificar(self, mensaje):
    for observador in self.observadores:
        observador.actualizar(mensaje)

def publicar(self, mensaje):
    self.ultimo_mensaje = mensaje
    self.notificar(mensaje)
\`\`\`

## Que hace el ciclo \`for\`
Si \`self.observadores\` tiene dos objetos, por ejemplo Ana y Luis, el ciclo hace esto internamente:

\`\`\`python
ana.actualizar(mensaje)
luis.actualizar(mensaje)
\`\`\`

Ese recorrido es lo que convierte la publicacion en una notificacion para todos.

## Pasos sugeridos
- En \`CanalNoticias\`, crea \`notificar(self, mensaje)\`.
- Recorre los observadores y llama \`actualizar(mensaje)\`.
- Crea \`publicar(self, mensaje)\`.
- Guarda el mensaje en \`ultimo_mensaje\`.
- Llama \`notificar(mensaje)\`.
- Haz commit y push.

## Criterio de cierre
El workflow cerrara este issue cuando un canal pueda publicar mensajes a varios suscriptores y dejar de notificar a quienes fueron desuscritos.`
  },
  {
    id: 7,
    title: "Crear demo ejecutable",
    summary: "Construiras un script pequeno que demuestre el patron funcionando.",
    why: "Una demo concreta permite comprobar el flujo sin leer todas las pruebas.",
    body: `## Objetivo
Crear \`src/main.py\` con una demostracion ejecutable.

## Pasos sugeridos
- Importa \`CanalNoticias\`, \`SuscriptorEmail\` y \`SuscriptorSMS\`.
- Crea un canal.
- Crea al menos dos suscriptores.
- Suscribe ambos al canal.
- Publica un mensaje.
- Imprime los mensajes recibidos.
- Ejecuta \`python src/main.py\`.
- Haz commit y push.

## Criterio de cierre
El workflow cerrara este issue cuando \`src/main.py\` exista y pueda ejecutarse sin errores.`
  },
  {
    id: 8,
    title: "Ejecutar pruebas con pytest",
    summary: "Usaras las pruebas automatizadas para confirmar el comportamiento esperado.",
    why: "Las pruebas convierten la descripcion del patron en criterios verificables.",
    body: `## Objetivo
Lograr que todas las pruebas pasen.

## Pasos sugeridos
- Activa tu entorno virtual.
- Ejecuta \`python -m pytest\`.
- Corrige las clases hasta que la salida muestre pruebas exitosas.
- Haz commit y push.

## Criterio de cierre
El workflow cerrara este issue cuando las pruebas de \`tests/test_observer.py\` pasen correctamente.`
  },
  {
    id: 9,
    title: "Completar README final",
    summary: "Documentaras como instalar, ejecutar, probar y explicar la solucion.",
    why: "Un proyecto con buen codigo tambien debe poder ser entendido y ejecutado por otra persona.",
    body: `## Objetivo
Completar el README con la explicacion final del proyecto.

## Pasos sugeridos
- Revisa que el README conserve la guia completa para estudiantes.
- Explica o ajusta con tus palabras las clases principales.
- Explica quien es el sujeto y quienes son los observadores dentro de \`Implementar Observer paso a paso\`.
- Indica como ejecutar \`python src/main.py\`.
- Indica como ejecutar \`python -m pytest\`.
- Reemplaza el autor pendiente por tus datos.
- Haz commit y push.

## Criterio de cierre
El workflow cerrara este issue cuando el README tenga contenido suficiente y no conserve textos pendientes.`
  },
  {
    id: 10,
    title: "Revisar calificacion sobre 100",
    summary: "Recibiras una calificacion automatica basada en una rubrica de 100 puntos.",
    why: "La calificacion final te muestra que aspectos tecnicos ya estan completos y cuales podrias mejorar.",
    body: `## Objetivo
Consultar la calificacion automatica final de la practica.

## Pasos sugeridos
- Ejecuta manualmente el workflow **Validar progreso de misiones** si este issue no se actualiza solo.
- Revisa el comentario automatico con la rubrica.
- Si el puntaje no llega a 100, corrige los puntos pendientes y vuelve a ejecutar el workflow.

## Criterio de cierre
El workflow cerrara este issue cuando la calificacion automatica sea 100/100. Si el puntaje es menor, dejara el issue abierto con retroalimentacion.`
  }
];

export function missionNumber(id) {
  return String(id).padStart(2, "0");
}

export function missionMarker(id) {
  return `<!-- ${PRACTICE_MARKER}:mission=${id} -->`;
}

export function missionIssueTitle(mission) {
  return `[Mision ${missionNumber(mission.id)}] ${mission.title}`;
}

export function missionIssueBody(mission) {
  return `${missionMarker(mission.id)}

## Resumen rapido
- **Que haras:** ${mission.summary}
- **Por que importa:** ${mission.why}

${mission.body}

## Seguimiento automatico
Cuando avances en esta mision, el workflow **Validar progreso de misiones** intentara revisar los criterios verificables. Si cumple, comentara el resultado, cerrara este issue y creara la siguiente mision. Si no cumple todavia, dejara una checklist breve con lo que falta.

No cierres este issue manualmente. Si se cierra desde la interfaz de GitHub o desde un Pull Request, el workflow **Proteger cierre de misiones** lo reabrira.

---
Practica guiada de clases en Python y patron Observer. Identificador interno: mision ${mission.id}.`;
}

export function getMissionById(id) {
  return missions.find((mission) => mission.id === Number(id));
}

export function getNextMission(id) {
  return getMissionById(Number(id) + 1);
}

export function extractMissionId(text = "") {
  const markerMatch = text.match(/python-classes-practice:mission=(\d+)/i);
  if (markerMatch) {
    return Number(markerMatch[1]);
  }

  const titleMatch = text.match(/\[?Misi[oó]n\s+0?(\d+)\]?/i);
  if (titleMatch) {
    return Number(titleMatch[1]);
  }

  const asciiTitleMatch = text.match(/\[?Mision\s+0?(\d+)\]?/i);
  if (asciiTitleMatch) {
    return Number(asciiTitleMatch[1]);
  }

  return null;
}
