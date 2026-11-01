# Doparti: historia del desarrollo

Este documento cuenta cómo se fue construyendo **Doparti**, etapa por etapa: qué se agregó, qué se decidió y por qué, qué problemas aparecieron y cómo se resolvieron. Sirve para entender el proyecto sin tener que leer todo el código ni el historial de chats.

> **Doparti** es un registro personal y social de fútbol amateur. Cada persona anota los partidos que jugó, acumula sus estadísticas en un solo perfil y las comparte con sus amigos, que pueden confirmar los partidos. **No es una app para organizar partidos**: se juega donde sea y después se registra lo que pasó.

Repositorio: https://github.com/Mategalluzzo22/f5-app

---

## Resumen de etapas

| Etapa | Qué se logró | Estado | Pull requests |
|---|---|---|---|
| 0. Preparación | Herramientas instaladas y proyecto de Expo creado | ✅ | (commit inicial) |
| 1. Anotador personal | Cargar partidos y ver tus estadísticas, en el celu | ✅ | (commit inicial), #1 |
| 2. Diseño y experiencia | Estilo visual, animaciones, vibración | ✅ | #2, #3 |
| 3. Motivación | Récords con festejo y recordatorios | ✅ | #4, #5, #6 |
| 4. Cuentas y nube | Login y partidos guardados en internet | ✅ | #7 |
| 5. Amigos | Buscar, agregar y ver partidos de amigos | ✅ | #8 |
| 6. Identidad Doparti | Nombre, estudio de mercado y login solo con Google | ✅ | #9 |
| 7. Partido compartido | Marcador, equipos, jugadores y confirmaciones | ✅ | #10 |
| 8. Perfil de amigos | Estadísticas de un amigo, mano a mano y comparación | 🔄 En prueba | rama `feature/friend-profile` |
| 9. Publicación | App en TestFlight y en las tiendas | ⏳ Pendiente | — |

Todas las etapas se hicieron el 1 de noviembre de 2026.

---

## Etapa 0: Preparación

**Objetivo:** tener todo listo para programar y probar la app en un iPhone real.

- Se eligió **Expo / React Native**: permite hacer una app de celular de verdad en JavaScript y probarla en el iPhone con la app **Expo Go**, sin necesitar una Mac.
- Se instalaron **Node.js** y **Git** en la compu, y se creó el proyecto en `D:\claude\f5-app`.
- Se creó el repositorio en **GitHub** (público) y se adoptó una regla de trabajo: **nunca commitear directo a `main`**. Cada cambio va en una rama y entra con un pull request.

**Problemas y soluciones**
- *El iPhone no se conectaba con la compu:* Windows tenía la red marcada como "Pública" y bloqueaba las conexiones entrantes. Se cambió a **red Privada**.
- *El QR no siempre abría la app:* se inició sesión en Expo con la misma cuenta en la compu y en Expo Go, y desde entonces la app aparece sola en la lista. El login por navegador de Expo falla en Windows, así que se usa `npx expo login --no-browser`.

---

## Etapa 1: Anotador personal

**Objetivo:** que una persona pueda anotar sus partidos después de jugar y ver sus números.

**Qué se hizo**
- **Cargar un partido:** fecha, rival, resultado (ganado, empatado o perdido) y goles propios.
- **La fecha** se elige con el calendario nativo del iPhone, viene con el día de hoy y **no deja elegir días futuros**.
- **Estadísticas:** partidos jugados, ganados, empatados y perdidos, % de victorias, goles y goles por partido.
- **Guardado** en el mismo celu (AsyncStorage).
- **Rivales sugeridos:** los rivales ya cargados aparecen como botones para no escribirlos de nuevo.
- **Inicio estilo Mercado Pago:** estadísticas en tarjetas grandes y una barra abajo con un **botón redondo verde con un +** en el medio para cargar un partido.
- **Pantalla "Partidos"** (antes "Historial") con la lista, y **detalle** de cada partido con opción de **eliminarlo**, que pide confirmación.

**Decisiones**
- Se descartó escribir la fecha a mano (era tosco) y se usó el calendario nativo.
- Se bloquearon las fechas futuras: un partido que no se jugó ensuciaría las estadísticas. "Agendar partidos" quedó como posible función futura.

---

## Etapa 2: Diseño y experiencia

**Objetivo:** que la app se sienta como una app "de verdad".

**Qué se hizo**
- **Tipografía deportiva** (Barlow Condensed, estilo marcador de estadio) para títulos y números grandes.
- **Franja verde con dibujo de cancha:** rayas de césped, línea del medio y círculo central.
- **Botones que reaccionan:** se achican un poco al tocarlos y vuelven con un rebote.
- **Vibración** al tocar el +, elegir resultado, sumar goles, guardar y eliminar.
- "Nuevo partido" con el mismo estilo que el resto, y la etiqueta "Tus goles" en el detalle.

---

## Etapa 3: Motivación

**Objetivo:** darle a la gente motivos para volver a la app.

**Qué se hizo**
- **Festejo de récord:** si un partido supera tu máximo de goles, aparece una pantalla con trofeo, confeti y tu marca anterior. No salta en el primer partido ni si solo empatás el récord.
- **Tarjeta "Tus récords"** en el Inicio: más goles en un partido y mejor racha de partidos ganados seguidos.
- **Recordatorios** (notificaciones que programa el mismo celu, sin servidor):
  - A los 10 días sin cargar partidos: *"¿Jugaste algún partido estos días y no anotaste el resultado? ⚽"*
  - A los 30 días sin jugar con un grupo frecuente: *"¿Y Los del martes? 🤔"*

**Cómo se probó:** la lógica de los recordatorios se separó (`src/reminders.js`) y se probó con Node simulando fechas. En el iPhone se confirmó el permiso y la programación del aviso.

---

## Etapa 4: Cuentas y nube

**Objetivo:** que los datos no vivan solo en un celu, como base para los amigos.

**Qué se hizo**
- Se eligió **Supabase** como servidor: base de datos y login listos, plan gratis y compatible con Expo Go.
- **Login** con código por email y con **"Continuar con Google"**. Más adelante quedó solo Google (ver etapa 6).
- **Nombre de usuario** (`@usuario`), que se elige la primera vez.
- **Partidos guardados en la nube.** Los que estaban en el celu se subieron solos la primera vez.
- **Reglas de seguridad** (Row Level Security): cada usuario solo puede ver y modificar lo suyo. La clave que va en la app es pública a propósito; lo que protege los datos son esas reglas.

**Problemas y soluciones**
- *No llegaba el código por mail:* el remitente era un Gmail sin "contraseña de aplicación". Se creó un **Gmail propio para la app** y se configuró con su contraseña de aplicación.
- *Google volvía a `localhost` en vez de a la app:* **Supabase rechaza las direcciones de vuelta que tienen una IP**, como la de Expo Go (`exp://192.168.x.x:8081`). Se diagnosticó probando direcciones contra Supabase y se resolvió volviendo por una dirección propia de la app (hoy `doparti://auth`), que en iPhone funciona incluso en Expo Go.

---

## Etapa 5: Amigos

**Objetivo:** la parte social: ver cómo les va a tus amigos.

**Qué se hizo**
- Pestaña **Amigos:** buscar por usuario, mandar, aceptar o rechazar solicitudes, y ver los **últimos partidos de tus amigos**.
- Pestaña **Perfil:** usuario, email y cerrar sesión.
- Barra de abajo con 4 pestañas y el + en el medio: Inicio · Partidos · **+** · Amigos · Perfil.
- **Seguridad:** las solicitudes se aceptan con una función especial, así quien acepta no puede hacerse amigo de otra persona, y los amigos pueden **ver** tus partidos pero no modificarlos.
- Corrección importante: tus estadísticas cargan **solo tus partidos**, para que no se mezclen con los de tus amigos.

**Cómo se probó:** con dos cuentas en el iPhone, mandando, aceptando y viendo los partidos de la otra.

---

## Etapa 6: Identidad Doparti

**Objetivo:** darle identidad de producto a la app.

**Qué se hizo**
- **Estudio de mercado y documento de producto** (hecho por el fundador). Define que Doparti es un **registro** de partidos, no un organizador; que cada usuario tiene **un solo historial** aunque juegue en varios grupos; y que la **confirmación entre amigos** es el diferencial.
- **Nuevo nombre: Doparti.** Se cambió en la app, en la dirección de vuelta del login (`doparti://`), en Google y en Supabase.
- **Login solo con Google.** Los códigos por mail desde un Gmail nuevo no llegaban de forma confiable, y Google ya verifica que la cuenta es tuya. Para publicar en iPhone se va a sumar **"Continuar con Apple"**, que Apple exige.

**Decisiones guardadas para más adelante**
- **Plan Gratis / Pro:** todo lo que hace crecer la app (cargar partidos, amigos, confirmar, compartir) es gratis. El Pro suma estadísticas avanzadas, comparaciones, resumen anual y personalización. Se aplica después de publicar y de ver cómo la usa la gente.
- **Login nativo de Google** y **dominio propio**, para que el aviso de iOS no muestre la dirección de Supabase.

---

## Etapa 7: Partido compartido

**Objetivo:** el diferencial de Doparti: un partido con varios jugadores, que los amigos confirman.

**Qué se hizo**
- Un partido tiene **fecha, formato (F5, F7, F8 o F11), grupo opcional y marcador**: tu equipo contra el rival.
- Se agregan **amigos a tu equipo o al rival**. A cada uno le llega el partido **para confirmar**, con sus goles, o puede decir **"No jugué"**.
- El resultado de cada jugador **sale solo** del marcador y de su equipo: si ganaste 8 a 5, tu rival ve una derrota 5 a 8.
- El partido **cuenta para un amigo recién cuando lo confirma**, así nadie puede cambiarte los números.
- **Goles "sin dato"**, distinto de 0: si no te acordás cuántos hiciste, el partido no te baja el promedio.
- "Rival" pasó a ser **"Grupo"** (por ejemplo "Los del martes"), que sirve de contexto y para los recordatorios.
- Los partidos viejos pasaron al formato nuevo **sin marcador**, conservando su resultado.
- **Goles con sentido:** nadie puede tener más goles que su equipo, ni al cargar ni al confirmar; se controla en la app y en la base de datos. Si el que carga **no se acuerda del marcador**, elige solo ganado, empatado o perdido (con goles sin límite), y a cada amigo le llega el resultado desde su lado. Se prefirió eso a un marcador "aproximado", que ensuciaría los datos.
- **Rediseño para aprovechar el espacio:** tarjeta "Para confirmar" con el marcador grande, lista de partidos con el grupo como título, Perfil con una tarjeta centrada y tus números, y Login de pantalla completa sobre la cancha.

**Cómo se probó:** pruebas automáticas de los cálculos (resultado según marcador y equipo, goles sin dato, récords, grupos y recordatorios). Se corrió la migración en Supabase y se probó en el iPhone con dos cuentas: una cargó un partido, la otra lo recibió para confirmar con el resultado desde su lado.

---

## Etapa 8: Perfil de amigos (en prueba)

**Objetivo:** la parte divertida de tener amigos en la app: compararse. Es una de las funciones diferenciales del documento de producto.

**Qué se hizo**
- Lista **"Tus amigos"** en la pestaña Amigos. Tocando un amigo, o un partido suyo en el feed, se abre su perfil.
- **Su tarjeta:** inicial, usuario, cuántos partidos tienen en común y sus números (partidos, % victorias, goles y mejor racha). La misma tarjeta se usa en tu propio Perfil.
- **Mano a mano:** los partidos que **los dos confirmaron**, separados en **en contra** (cuántos ganaste vos, cuántos él y empates) y **juntos** (% de victorias en el mismo equipo).
- **Comparación** lado a lado, con el mejor número de cada fila resaltado.
- **Sus últimos 5 partidos.**
- **Eliminar amigo**, con confirmación.

**Cómo se probó:** pruebas automáticas del mano a mano (incluido que un partido que el amigo no confirmó no cuenta) y revisión de la pantalla en el navegador con datos de ejemplo.

---

## Próximas etapas

**Etapa 9: Publicación** (necesita la cuenta de desarrollador de Apple, USD 99 por año)
- Ícono y pantalla de carga de Doparti.
- Compilar la app con **EAS** (el servicio de Expo que compila en la nube).
- Login nativo de Google y **"Continuar con Apple"**.
- Subirla a **TestFlight** para probarla con amigos y después publicarla.
- Antes de publicar: verificar que el nombre "Doparti" esté libre (dominio, tiendas, redes y marca).

**Ideas del documento de producto para después**
- **Invitados sin cuenta:** sumar a un partido a alguien que no tiene la app, que después reclama su historial.
- **Disputas y correcciones**, con historial de cambios.
- **Privacidad:** elegir quién ve tu perfil.
- **Asistencias** opcionales.
- **Tarjetas para compartir** en WhatsApp e Instagram.
- **Plan Pro.**

---

## Cómo está armado (para quien siga el proyecto)

| Parte | Qué se usa |
|---|---|
| App | Expo (SDK 58) + React Native, en JavaScript |
| Base de datos y login | Supabase (proyecto `tjxbjgnelylloynfsbxk`, región São Paulo) |
| Login | Google (OAuth vía Supabase), vuelta por `doparti://auth` |
| Notificaciones | `expo-notifications`, locales |
| Código | GitHub, una rama por cambio y pull request a `main` |

**Archivos clave**
- `App.js`: navegación entre pantallas y carga de datos.
- `src/api.js`: todo lo que habla con Supabase.
- `src/matches.js`, `src/stats.js` y `src/compare.js`: cálculos (resultado de cada jugador, estadísticas, récords y mano a mano).
- `src/reminders.js`: qué recordatorios programar.
- `supabase/*.sql`: la base de datos. Se corren en orden: `schema.sql` → `friends.sql` → `shared-matches.sql` → `match-validation.sql`.
- `docs/`: guías de configuración de Supabase y Google, y este documento.

**Para correr la app en desarrollo**

```bash
npx expo start
```

Después se abre **Doparti** desde Expo Go en el iPhone, conectado al mismo Wi-Fi que la compu.
