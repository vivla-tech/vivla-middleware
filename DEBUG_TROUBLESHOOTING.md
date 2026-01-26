# Solución de Problemas de Depuración

## Problema: El archivo se abre en modo preview con versión antigua

Cuando estás depurando y el IDE abre un archivo en modo preview, pero muestra una versión anterior a tus últimos cambios, puede deberse a varias causas:

### Soluciones:

#### 1. **Reiniciar el proceso de depuración**
   - Detén completamente el proceso de depuración actual
   - Guarda todos los archivos (Cmd+S / Ctrl+S)
   - Reinicia el proceso usando `start-debug.sh`
   - Vuelve a conectar el depurador

#### 2. **Verificar que el archivo está guardado**
   - Asegúrate de que el archivo `houseReportService.js` está guardado
   - En VS Code, verifica que no hay un punto blanco en la pestaña del archivo (indica cambios sin guardar)
   - Usa "Save All" (Cmd+K S / Ctrl+K S)

#### 3. **Limpiar cache del IDE**
   - En VS Code: Cmd+Shift+P → "Developer: Reload Window"
   - O cierra y vuelve a abrir VS Code

#### 4. **Forzar recarga del módulo en Node.js**
   - El script `start-debug.sh` ahora mata procesos anteriores en el puerto 9229
   - Asegúrate de que no hay múltiples instancias corriendo

#### 5. **Verificar la ruta del archivo**
   - Asegúrate de que estás editando el archivo correcto:
     - `src/services/report/houseReportService.js`
   - Verifica que no hay múltiples copias del archivo en diferentes ubicaciones

#### 6. **Usar breakpoints en lugar de "preview"**
   - En lugar de depender del modo preview, coloca breakpoints directamente en el código
   - El depurador debería mostrar el código correcto cuando se detiene en un breakpoint

### Comandos útiles:

```bash
# Verificar si hay procesos en el puerto de debugging
lsof -i:9229

# Matar procesos en el puerto de debugging
lsof -ti:9229 | xargs kill -9

# Verificar la fecha de modificación del archivo
ls -la src/services/report/houseReportService.js
```

### Nota importante:
El modo "preview" en el depurador a veces muestra código cacheado. Para asegurarte de ver el código más reciente:
- Usa breakpoints en lugar de depender del preview
- Guarda todos los archivos antes de iniciar la depuración
- Reinicia el proceso de depuración después de hacer cambios importantes

