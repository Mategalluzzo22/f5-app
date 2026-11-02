# Correr Doparti en otra compu

Guía para bajar el proyecto en una compu nueva (por ejemplo, una notebook) y abrir la app en el iPhone con Expo Go.

## 1. Instalar (una sola vez)

- **Git**: https://git-scm.com
- **Node.js**, la versión **LTS**: https://nodejs.org
- **Claude Code** (opcional): solo para seguir programando con Claude desde ahí.

## 2. Bajar el proyecto

En PowerShell, parado en la carpeta donde lo quieras guardar:

```
git clone https://github.com/Mategalluzzo22/f5-app.git
cd f5-app
npm install
```

`npm install` baja las librerías (la carpeta `node_modules`). No se sube a GitHub porque pesa mucho y se puede regenerar.

## 3. Arrancar la app

```
npx.cmd expo start
```

Usá `npx.cmd` y no `npx`: PowerShell suele bloquear `npx` por la política de seguridad.

Escaneá el QR con la **cámara del iPhone** y se abre en Expo Go. La compu y el iPhone tienen que estar en el **mismo WiFi**.

## 4. Lo que NO hay que configurar

- **Supabase:** la dirección y la clave pública están en `src/config.js`, que ya está en GitHub. Esa clave es pública a propósito, no es un secreto.
- **Login con Google:** vuelve a la app por `doparti://auth`, que no depende de la IP de la compu, así que anda en cualquier WiFi.

## 5. Trampas del WiFi nuevo

- **Firewall de Windows:** la primera vez que corras Expo, Windows pregunta si dejás que Node use la red. Marcá **"Redes privadas"** y aceptá. Si no, el iPhone no encuentra la compu.
- **La red tiene que estar como "Privada"** en Windows: Configuración → Red e Internet → la WiFi → Perfil de red: **Privada**. Si figura como Pública, el firewall bloquea la conexión.
- **WiFi de facultad, bar u hotel:** muchas veces no dejan que los dispositivos se hablen entre sí aunque estén en la misma red. Si el iPhone no conecta, usá el túnel:

  ```
  npx.cmd expo start --tunnel
  ```

- **La compu no se tiene que suspender** mientras mostrás la app. Si cerrás la tapa, se corta.

## 6. Lo que no está en GitHub (pasarlo a mano, solo si lo necesitás)

- `DOPARTI_Product_Brief_Market_Study.pdf` y `.......txt`: los dos documentos privados. Van dentro de la carpeta `f5-app`.
- La carpeta `D:\claude` (`CLAUDE.md`, `context`, `facultad`), si vas a usar Claude Code en la otra compu.

## 7. Trabajar en dos compus

- Antes de empezar: `git pull`, para bajar lo último.
- Al terminar: subir los cambios a GitHub, para que la otra compu los tenga.
