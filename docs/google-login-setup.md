# Configurar "Continuar con Google" (Supabase + Google Cloud)

Hola. Necesito que me guíes en el navegador para activar el login con Google en mi app de fútbol 5. La app usa **Supabase** (proyecto `f5-app`, URL `https://tjxbjgnelylloynfsbxk.supabase.co`) y se prueba con **Expo Go** en iPhone.

## Qué cuenta usar

- **Gmail de la app** (una cuenta creada solo para el proyecto): es la dueña del proyecto de Google Cloud y el email de soporte que ven los usuarios. **Toda esta guía se hace con esa cuenta iniciada.**
- **Mi Gmail personal**: solo se agrega como **usuario de prueba**, para poder entrar a la app.

## Reglas importantes

- **Las cuentas y las contraseñas las manejo yo.** No inicies sesión por mí ni completes campos de contraseña.
- **El "Client Secret" de Google es secreto.** Copialo y pegalo solo en Supabase. No lo muestres en el chat ni lo guardes en otro lado. Si preferís, lo copio y lo pego yo.
- Antes de tocar cualquier botón que cree, borre o cambie algo, decime qué vas a hacer y esperá mi OK.

## Paso 1: proyecto en Google Cloud

1. Abrí https://console.cloud.google.com/ (yo inicio sesión con el **Gmail de la app**).
2. Creá un proyecto nuevo llamado `F5 App`, o usá uno existente si te digo cuál.

## Paso 2: pantalla de consentimiento (Google Auth Platform)

1. Andá a https://console.cloud.google.com/auth/branding y completá:
   - **App name:** `F5`
   - **User support email:** el Gmail de la app
   - **Developer contact email:** el Gmail de la app
2. En **Audience** (https://console.cloud.google.com/auth/audience):
   - Tipo de usuario: **External**.
   - Mientras esté en modo **Testing**, agregá **mi Gmail personal** en **Test users**. Después sumo a mis amigos.
3. En **Data Access / Scopes** (https://console.cloud.google.com/auth/scopes): tienen que estar `openid`, `.../auth/userinfo.email` y `.../auth/userinfo.profile`. Si `openid` no está, agregalo.

## Paso 3: crear el cliente OAuth

1. En Supabase, abrí **Authentication → Sign In / Providers → Google** y copiá la **Callback URL**. Es algo como `https://tjxbjgnelylloynfsbxk.supabase.co/auth/v1/callback`.
2. Abrí https://console.cloud.google.com/auth/clients/create
   - **Application type:** **Web application**
   - **Name:** `F5 Supabase`
   - **Authorized redirect URIs:** pegá la Callback URL de Supabase del punto 1.
   - **Authorized JavaScript origins:** dejalo vacío. Si te lo pide, poné `https://tjxbjgnelylloynfsbxk.supabase.co`.
3. Tocá **Create**. Google muestra el **Client ID** y el **Client Secret**.

## Paso 4: activar Google en Supabase

1. En Supabase, en **Authentication → Sign In / Providers → Google**:
   - Activá **Enable Sign in with Google**.
   - **Client ID:** pegá el Client ID de Google.
   - **Client Secret:** pegá el Client Secret de Google (sin mostrarlo en el chat).
   - Tocá **Save**.

## Paso 5: permitir volver a la app

1. En Supabase, andá a **Authentication → URL Configuration**.
2. En **Redirect URLs**, agregá estas dos:
   - `exp://**` (para probar con Expo Go)
   - `f5app://**` (para cuando la app esté publicada)
3. Guardá.

## Paso 6: mandar los mails con código desde el Gmail de la app

Ahora los mails con código salen de mi Gmail personal. Hay que cambiarlo:

1. Con el **Gmail de la app** iniciado, abrí https://myaccount.google.com/apppasswords y creá una contraseña de aplicación llamada `Supabase F5`. Tiene que estar activa la verificación en 2 pasos. **La contraseña la copio y la pego yo.**
2. En Supabase, andá a **Authentication → Emails → SMTP Settings** y cambiá:
   - **Username:** el Gmail de la app
   - **Sender email:** el Gmail de la app
   - **Sender name:** `F5`
   - **Password:** la contraseña de aplicación nueva, sin espacios (la pego yo)
3. Guardá.

## Al terminar

Haceme un resumen con:

- [ ] Proyecto de Google Cloud creado con el Gmail de la app
- [ ] Pantalla de consentimiento lista, con mi Gmail personal como test user
- [ ] Cliente OAuth "Web application" creado, con la Callback URL de Supabase
- [ ] Google activado en Supabase, con Client ID y Client Secret
- [ ] Redirect URLs `exp://**` y `f5app://**` agregadas
- [ ] SMTP de Supabase usando el Gmail de la app
