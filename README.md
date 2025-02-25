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

8. Opcional para hostear en la nube
