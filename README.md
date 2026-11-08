# Streams de objetos con Node.js

Ejemplo sencillo del uso de streams en modo objeto. El programa lee una lista de
productos, descarta los que no tienen existencias, calcula el precio con IGV y
muestra el resultado en la consola.

## Requisitos

- Node.js 18 o una versión posterior.

## Ejecución

```bash
npm start
```

Salida esperada:

```text
Teclado: S/ 94.40 (incluye IGV)
Monitor: S/ 767.00 (incluye IGV)
```

Para ejecutar la prueba automatizada:

```bash
npm test
```

El informe de la tarea se encuentra en la carpeta `../docs`.
