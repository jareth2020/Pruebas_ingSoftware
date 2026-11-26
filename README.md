# Pruebas Automatizadas — Módulo de Clientes y Proveedores (Dolibarr v24.0.4)

Suite de pruebas funcionales de extremo a extremo (E2E) con **Playwright** para el módulo de **Clientes y Proveedores** (apartado de Terceros en Dolibarr v24.0.4), desarrollada para el Producto Integrador de la materia de **Ingeniería de Software** (7.° "K", UAT).

## Alcance de la Suite (`CP-01` a `CP-07`)

- **CP-01:** Inicio de sesión y acceso al módulo de Clientes y Proveedores.
- **CP-02:** Alta de un nuevo cliente con datos válidos y sufijo único (`RUN_ID`).
- **CP-03:** Validación de nombre obligatorio al intentar guardar sin nombre.
- **CP-04:** Búsqueda y filtrado del cliente creado en el listado.
- **CP-05:** Edición de datos de contacto (teléfono y correo electrónico) en la ficha del cliente.
- **CP-06:** Alta y consulta de un nuevo proveedor en el listado correspondiente.
- **CP-07:** Eliminación controlada de los registros de prueba (cliente y proveedor) y verificación de ausencia en el listado.

## Entorno de Pruebas

- **Aplicación bajo prueba:** Dolibarr ERP v24.0.4 (`https://dolitest0.with7.dolicloud.com`)
- **Archivo principal:** `tests/clientes-proveedores.spec.js`
- **Características:** Soporte bilingüe (español/inglés), identificadores dinámicos por corrida (`RUN_ID`) y rutina de respaldo en `CP-07` para evitar colisiones entre ejecuciones.

## Ejecución

Instalar dependencias:

```bash
npm install
```
Ejecutar toda la suite en modo visible:
```bash
npx playwright test --headed
```
Ejecutar únicamente CP-07 de forma aislada:
```bash
npx playwright test --headed -g "CP-07"
```
Abrir el reporte HTML de la última ejecución:
```bash
npx playwright show-report
```
