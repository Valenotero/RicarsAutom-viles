# Recuperación de Contraseña - Ricars Automóviles

## 📋 Descripción

El sistema de recuperación de contraseña permite a los usuarios registrados restablecer su contraseña de manera sencilla y segura, sin intervención del administrador. Utiliza la funcionalidad de Firebase Authentication y está integrado en la interfaz de la aplicación.

## 🚀 ¿Cómo Funciona?

1. **El usuario olvida su contraseña** y hace clic en el enlace "¿Olvidaste tu contraseña?" en la pantalla de login.
2. **Se muestra un formulario** donde debe ingresar su email registrado.
3. **Al enviar el formulario**, la app utiliza Firebase para enviar un email de recuperación a la dirección proporcionada.
4. **El usuario recibe un email** con un enlace seguro para restablecer su contraseña.
5. **Al hacer clic en el enlace**, es redirigido a una página de Firebase donde puede ingresar una nueva contraseña.
6. **Una vez cambiada la contraseña**, puede volver a iniciar sesión normalmente.

## 📝 Paso a Paso para el Usuario

1. Ve a la página de inicio de sesión.
2. Haz clic en "¿Olvidaste tu contraseña?".
3. Ingresa tu email y haz clic en "Enviar email de recuperación".
4. Revisa tu bandeja de entrada (y la carpeta de spam) y abre el email de Ricars Automóviles.
5. Haz clic en el enlace de recuperación.
6. Ingresa una nueva contraseña segura.
7. Vuelve a la app e inicia sesión con tu nueva contraseña.

## 🛡️ Seguridad

- El enlace de recuperación es válido solo por un tiempo limitado y solo puede ser usado una vez.
- Nadie (ni siquiera los administradores) puede ver ni recuperar contraseñas.
- El proceso es 100% autogestionado por el usuario.

## 🧑‍💻 Implementación Técnica

- **Componente:** `src/pages/auth/ResetPassword.js`
- **Función principal:** `resetPassword(email)` del contexto de autenticación (`AuthContext`)
- **Servicio:** Utiliza `sendPasswordResetEmail` de Firebase Auth
- **Notificaciones:** Se informa al usuario si el email fue enviado correctamente o si hubo un error
- **Accesibilidad:**
  - El formulario es accesible por teclado
  - Los campos tienen etiquetas y descripciones claras
  - Los mensajes de error y éxito son visibles y legibles
- **Responsividad:**
  - El formulario se adapta a dispositivos móviles y escritorio
  - Botones y campos son fácilmente tocables/clickeables

## 🧩 Código Limpio y Reutilizable

- El formulario de recuperación es un componente reutilizable y desacoplado
- Se utilizan componentes de UI consistentes (`input-field`, `btn-primary`)
- El código está comentado y es fácil de seguir
- Se manejan todos los estados: cargando, éxito, error

## 🟢 Buenas Prácticas

- **Validación:** El email es validado antes de enviar la solicitud
- **Feedback:** El usuario recibe mensajes claros en cada paso
- **Prevención de errores:** No se revela si un email está registrado o no, para evitar filtraciones
- **Accesibilidad:** Compatible con lectores de pantalla y navegación por teclado

## 🧠 Consejos para Usuarios No Técnicos

- No necesitas conocimientos técnicos para recuperar tu contraseña
- Si no recibes el email, revisa la carpeta de spam o intenta nuevamente
- Si tienes problemas, contacta a soporte: soporte@ricarsautomotores.com

## 🐛 Solución de Problemas

- **No recibo el email:**
  - Verifica que escribiste bien tu email
  - Revisa la carpeta de spam
  - Espera unos minutos y vuelve a intentar
- **El enlace expiró:**
  - Vuelve a solicitar un nuevo email de recuperación
- **No puedo cambiar la contraseña:**
  - Contacta a soporte técnico

## 📱 Responsive y Accesible

- El formulario y los mensajes se adaptan a cualquier dispositivo
- Los botones y campos tienen tamaño adecuado para móviles
- El contraste de colores cumple con estándares de accesibilidad
- Navegación por teclado y lectores de pantalla soportados

## 🔄 Flujo Visual

1. **Login** → "¿Olvidaste tu contraseña?"
2. **Formulario de email** → "Enviar email de recuperación"
3. **Mensaje de éxito** → "Revisa tu email"
4. **Email recibido** → "Restablecer contraseña"
5. **Nueva contraseña** → "Listo para iniciar sesión"

---

**Este sistema permite a cualquier usuario recuperar el acceso a su cuenta de forma autónoma, rápida y segura.**
