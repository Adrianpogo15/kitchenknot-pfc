# Estado para APK

## Ya preparado

- Icono principal: [app-icon.png](C:\Users\dev016\Desktop\PFC\client\assets\icons\app-icon.png)
- Adaptive icon Android: [adaptive-foreground.png](C:\Users\dev016\Desktop\PFC\client\assets\icons\adaptive-foreground.png)
- Splash screen: [splash.png](C:\Users\dev016\Desktop\PFC\client\assets\images\splash.png)
- Favicon web: [favicon.png](C:\Users\dev016\Desktop\PFC\client\assets\icons\favicon.png)
- Miniatura horizontal de apoyo: [store-thumb.png](C:\Users\dev016\Desktop\PFC\client\assets\images\store-thumb.png)
- Configuracion Expo conectada en [app.json](C:\Users\dev016\Desktop\PFC\client\app.json)
- Configuracion EAS base en [eas.json](C:\Users\dev016\Desktop\PFC\client\eas.json)

## Lo que todavia falta para una APK final real

- Publicar el backend Express en una URL publica
- Cambiar la API del frontend para no usar la IP local de desarrollo
- Probar una build real con `eas build`
- Revisar que el bucket `recipe-images` exista y sea publico en Supabase
- Hacer una pasada final de pruebas en movil real con la build instalada

## Lo que no bloquea una APK de pruebas, pero mejora mucho la entrega

- Icono alternativo para documentacion y memoria
- Capturas finales de pantallas para el PFC
- Ajuste fino de splash si luego quieres una version mas premium

## Nota importante

La app ahora mismo sigue usando una URL de desarrollo local en [env.js](C:\Users\dev016\Desktop\PFC\client\src\constants\env.js). Mientras eso no cambie a una URL publica, la APK solo funcionara correctamente dentro de tu red local o en modo de pruebas controladas.
