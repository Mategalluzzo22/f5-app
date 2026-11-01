# Configurar Supabase para la app Doparti

Hola. Necesito ayuda para preparar **Supabase** para mi app de celular (hecha con Expo / React Native), donde la gente anota sus partidos de fútbol 5. Guiame paso a paso en el navegador.

## Reglas importantes

- **La cuenta la creo yo.** No crees cuentas ni inicies sesión por mí. Si aparece la pantalla de login o registro, avisame y lo hago yo.
- **Las contraseñas las escribo yo.** No completes ningún campo de contraseña. Eso incluye la "Database password" del proyecto.
- **No toques claves secretas.** No copies ni muestres la **service_role key** ni la **secret key**. Solo necesito las claves **públicas** que se nombran abajo.
- **No ejecutes nada en el SQL Editor.** Las tablas las armamos después, con el código de la app.
- Antes de tocar cualquier botón que cree, borre o cambie algo, decime qué vas a hacer y esperá mi OK.

## Paso 1: crear la cuenta (lo hago yo)

1. Abrí https://supabase.com/dashboard/sign-in
2. Yo me registro o entro. Puedo usar **"Continue with GitHub"**, porque ya tengo cuenta ahí.
3. Cuando ya esté adentro del panel, seguimos.

## Paso 2: crear el proyecto

1. Si Supabase pide crear una **organización**, usá el nombre de mi usuario, plan **Free**.
2. Tocá **"New project"** y completá:
   - **Project name:** `doparti`
   - **Database password:** la escribo yo. También puedo tocar "Generate a password" y guardarla. Vos no la leas ni la copies.
   - **Region:** **South America (São Paulo)**, porque estoy en Argentina.
   - **Plan:** Free.
3. Mostrame el resumen y esperá mi OK antes de tocar **"Create new project"**.
4. Esperá a que el proyecto termine de crearse. Tarda un par de minutos.

## Paso 3: activar el login con código por email

La app va a iniciar sesión con **email + un código de 6 números**, sin contraseña.

1. Andá a **Authentication → Sign In / Providers** (o **Providers**).
2. Fijate que **Email** esté **activado**. Si no lo está, decime antes de activarlo.
3. Andá a **Authentication → Emails** (o **Email Templates**) y abrí la plantilla **"Magic Link"**.
4. La plantilla tiene que mostrar el **código**, así que tiene que incluir `{{ .Token }}`. Mostrame cómo está ahora y proponeme este texto antes de guardar:

   - **Asunto:** `Tu código para entrar a Doparti`
   - **Cuerpo:**
     ```html
     <h2>Tu código para entrar</h2>
     <p>Escribí este código en la app:</p>
     <h1>{{ .Token }}</h1>
     <p>Si no pediste este código, ignorá este mail.</p>
     ```

5. Si la plantilla **"Confirm signup"** también existe, proponeme el mismo cambio, porque es la que llega la primera vez que alguien se registra.

## Paso 4: copiar los datos que necesita la app

1. Andá a **Project Settings → API** (o **Data API** / **API Keys**).
2. Copiá y mostrame:
   - **Project URL**: algo como `https://xxxxxxxx.supabase.co`
   - La clave **pública**: puede llamarse **"anon public"** (empieza con `eyJ...`) o **"Publishable key"** (empieza con `sb_publishable_...`). Si están las dos, mostrame las dos.
3. **No** copies la `service_role` ni la `secret` key.

## Al terminar

Haceme un resumen con:

- [ ] Proyecto `doparti` creado en São Paulo, plan Free
- [ ] Login por email activado
- [ ] Plantillas de email con `{{ .Token }}`
- [ ] Project URL: `...`
- [ ] Clave pública: `...`

Esos dos últimos datos (URL y clave pública) se los paso después a Claude Code para conectar la app.
