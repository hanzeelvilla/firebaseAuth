# firebaseAuth 😎

Frontend sencillo para hacer sign in con google utilizando firebase authentication.

## Requisitos
- Cuenta de firebase
- Node.js

## Configuración

1. Crear un proyecto en firebase.

2. Agregar una app `Web`. En la configuración de la app se encuentra un objeto con las credenciales necesarias para utilizar la app.

3. Crear una Cloud Firestore con una colleción llamada `users`.

4. Clonar el repositorio.

5. Instalar las dependencias.
```bash
npm i
```

6. Crear un archivo `.env` en la raíz del proyecto con las credenciales correspondientes.

```javascript
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=yor_auth_domain
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_storage_bucket
VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_APP_ID=your_app_id
VITE_MEASUREMENT_ID=your_measurement_id
```

7. Ejecutar el servidor en modo de desarrollo.
```bash
npm run dev
```

8. Opcional para hostear en la nube, Primero instalar las herramientas de firebase(viene con los paquetes de node, pero para confirmar)
```bash
npm install -g firebase-tools
```
9. Acceder a Google
```bash
firebase login
```
10. Inicia el proyecto
```bash
firebase init
```
En esta parte tienes que seleccionar la opcion de hosting en la terminal asi mismo la opcion de FireStore

11. Correr el comando para iniciar la carpeta dist (donde hostearas tu proyecto))
```bash
npm run build
```
Asegurate que tu archivo firebase.json se vea asi
```javascript
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```
12. Cuando tengas todo listo, implementa tu app web
```bash
firebase deploy
```

