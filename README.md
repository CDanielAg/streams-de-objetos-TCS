# StreamLab: streams de objetos con archivos grandes

Aplicación web que recibe archivos grandes por streaming. Cada bloque binario se
transforma en un objeto de JavaScript y se procesa sin conservar el archivo
completo en memoria.

## Requisitos

- Node.js 18 o una versión posterior.

## Ejecución

~~~bash
npm start
~~~

Abre 'http://localhost:4172' y selecciona cualquier archivo. Para apreciar el
comportamiento se recomienda usar uno de 10 a 30 MB.

La aplicación acepta video, audio, ZIP, PDF y cualquier otro tipo de archivo. El
límite de seguridad del ejemplo es 35 MB.

## Pruebas

~~~bash
npm test
~~~

El informe navegable se encuentra en '../docs/informe.html' y la explicación
complementaria en '../docs/informe.md'.
