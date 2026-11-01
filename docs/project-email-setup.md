# Mail de la app: crear el Gmail y conectarlo a Supabase

Esta guía arma un **Gmail solo para la app**, para que los mails con el código de ingreso salgan de esa cuenta y no de tu Gmail personal. Tarda unos 15 minutos.

> **Importante:** las contraseñas de esta guía (la del Gmail nuevo y la contraseña de aplicación) las escribís y pegás **vos**. No se las pases a Claude ni a la extensión de Chrome.

---

## Parte 1: crear el Gmail de la app (lo hacés vos)

1. Abrí una **ventana de incógnito** para no mezclarla con tu cuenta personal y entrá a https://accounts.google.com/signup
2. Completá:
   - **Nombre:** `F5`
   - **Apellido:** `App` (o vacío)
3. Fecha de nacimiento y género: lo que quieras.
4. **Dirección de Gmail:** elegí una propia, por ejemplo `f5app.oficial@gmail.com`. Si está tomada, probá variantes como `f5.app.ar` o `f5app.contacto`. Como todavía no hay nombre definitivo, elegí una genérica que te sirva igual.
5. **Contraseña:** inventá una fuerte y **guardala en un lugar seguro**, por ejemplo en el gestor de contraseñas de tu celu o de Chrome.
6. Google te va a pedir un **número de teléfono** para verificar. Usá el tuyo, sirve para varias cuentas.
7. Aceptá las condiciones y terminá.

✅ Ya tenés el Gmail de la app.

---

## Parte 2: activar la verificación en 2 pasos (obligatoria)

Sin esto, Google no te deja crear la contraseña de aplicación de la Parte 3.

1. Con el **Gmail de la app** iniciado, entrá a https://myaccount.google.com/signinoptions/twosv
2. Tocá **"Activar la verificación en 2 pasos"**.
3. Seguí los pasos. Lo más simple es usar **tu número de teléfono** para recibir el código por SMS.
4. Al final tiene que decir **"La verificación en 2 pasos está activada"**.

---

## Parte 3: crear la contraseña de aplicación

Es una clave especial de 16 letras que **solo sirve para mandar mails desde Supabase**. Si algún día la querés anular, la borrás y listo, sin tocar la contraseña principal.

1. Con el **Gmail de la app** iniciado, entrá a https://myaccount.google.com/apppasswords
2. En **"Nombre de la app"** escribí `Supabase F5` y tocá **Crear**.
3. Google te muestra una clave como `abcd efgh ijkl mnop`.
4. **Copiala ahora:** Google la muestra **una sola vez**. Si la perdés, creás otra.

---

## Parte 4: conectar el Gmail en Supabase

1. Entrá a https://supabase.com/dashboard y abrí el proyecto **f5-app**.
2. Andá a **Authentication → Emails → SMTP Settings**.
3. Fijate que **"Enable custom SMTP"** esté **activado** y completá:

   | Campo | Valor |
   |---|---|
   | **Sender email** | el Gmail de la app (ej. `f5app.oficial@gmail.com`) |
   | **Sender name** | `F5` |
   | **Host** | `smtp.gmail.com` |
   | **Port number** | `465` |
   | **Username** | el Gmail de la app, completo |
   | **Password** | la contraseña de aplicación de la Parte 3, **sin espacios** |

4. Tocá **Save**.

---

## Parte 5: probar que funciona

1. En la app del iPhone, si estás adentro, tocá **"Cerrar sesión"** al final del Inicio.
2. Escribí tu email personal y tocá **"Enviarme el código"**.
3. Te tiene que llegar un mail de **F5** desde el Gmail de la app, con el código de 6 números. Revisá también **spam**.
4. Escribí el código y entrá. 🎉

### Si no llega o da error

Mirá el error en Supabase: **Authentication → Logs** (o **Logs & Analytics → Auth**), el más reciente en rojo.

| Error | Qué significa | Solución |
|---|---|---|
| `535 Username and Password not accepted` | Gmail rechaza la contraseña | Creá otra contraseña de aplicación (Parte 3) y pegala de nuevo, sin espacios. Revisá que el Username sea el Gmail de la app. |
| `Application-specific password required` | Pusiste la contraseña normal del Gmail | Usá la contraseña de aplicación de 16 letras. |
| `email rate limit exceeded` | Se mandaron muchos mails seguidos | Esperá unos minutos. El límite se puede subir en **Authentication → Rate Limits**. |

---

## Para más adelante

- Gmail deja mandar **hasta unos 500 mails por día**, y a veces terminan en spam. Para probar con amigos sobra.
- Cuando la app sea para mucha gente, conviene pasar a un servicio de mails como **Resend**, con un dominio propio (por ejemplo `hola@nombredelaapp.com`). Se cambia en esta misma pantalla de SMTP.
