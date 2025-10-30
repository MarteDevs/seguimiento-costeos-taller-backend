# Seguimiento y Costeo de Proyectos — Documento Técnico

Este documento describe en detalle la arquitectura del backend, la base de datos, los modelos, las APIs, y el manifiesto PDF con visualizaciones de avance físico y financiero, incluyendo evolución temporal. Está orientado a integrarse con un frontend en Vue.js.

## Tabla de Contenido
- [Resumen del Proyecto](#resumen-del-proyecto)
- [Arquitectura y Estructura](#arquitectura-y-estructura)
- [Instalación y Ejecución](#instalación-y-ejecución)
- [Base de Datos](#base-de-datos)
- [Modelos de Datos](#modelos-de-datos)
- [API HTTP](#api-http)
  - [Proyectos](#proyectos)
  - [Costos](#costos)
  - [Seguimiento de Tareas](#seguimiento-de-tareas)
  - [Seguimiento de Materiales](#seguimiento-de-materiales)
  - [Avance y Manifiesto PDF](#avance-y-manifiesto-pdf)
- [Manifiesto PDF](#manifiesto-pdf)
  - [Contenido y Cálculos](#contenido-y-cálculos)
  - [Gráficos de Avance](#gráficos-de-avance)
  - [Evolución Temporal](#evolución-temporal)
- [Validaciones](#validaciones)
- [Errores y Manejo](#errores-y-manejo)
- [Uso desde Vue.js](#uso-desde-vuejs)
- [Pruebas Rápidas](#pruebas-rápidas)
- [Despliegue (Railway)](#despliegue-railway)
- [Mantenimiento y Recomendaciones](#mantenimiento-y-recomendaciones)

---

## Resumen del Proyecto
- Objetivo: gestionar proyectos con costeo y seguimiento diario de tareas y materiales, generando un manifiesto PDF con desglose, totales y visualizaciones de avances.
- Tecnologías: `Node.js`, `Express`, `MySQL`, `pdfkit`.
- Salidas clave: API REST y un PDF de manifiesto con costos, avance físico/financiero y evolución temporal por fechas.

## Arquitectura y Estructura
- Servidor Express (`src/app.js`): configura middlewares, rutas y el servidor.
- Controladores (`src/controllers`):
  - `proyectoController.js`: CRUD y resumen del proyecto.
  - `costoController.js`: alta/consulta/edición/baja de costos.
  - `seguimientoController.js`: seguimiento de tareas/materiales y generación de PDF.
- Modelos (`src/models`):
  - `ProyectoModel.js`
  - `CostoModel.js`
  - `SeguimientoTareaModel.js`
  - `SeguimientoMaterialModel.js`
- Servicios (`src/services`):
  - `pdfService.js`: construcción del PDF (secciones, tablas y gráficos).
- Configuración DB (`src/config/database.js`): pool de MySQL.
- SQL (`db/*.sql`): definición de esquema y extensiones.

Estructura principal del repo:
```
SEGUIMIENTO-BACKEND/
├── src/
│   ├── app.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/pdfService.js
├── db/
│   ├── db_costeos_seguimiento.sql
│   └── db_seguimiento_extensiones.sql
├── README.md
└── package.json
```

## Instalación y Ejecución
- Requisitos: Node 18+, MySQL 8+, `npm`.
- Variables de entorno (ejemplo `.env`):
  - `DB_HOST=localhost`
  - `DB_USER=root`
  - `DB_PASS=tu_password`
  - `DB_NAME=costeos_seguimiento`
  - `PORT=3000`
- Instalación:
  - `npm install`
- Desarrollo:
  - `node .\src\app.js`
- Salud:
  - `GET /health` → estado del servidor.

## Base de Datos
- Collation recomendado: `utf8mb4_unicode_ci` (como en `db_costeos_seguimiento.sql`).
- Tablas principales (nombres orientativos, según uso en controladores):
  - Proyecto: `tb_proyectos` (id, nombre, responsable, fechas, `habilitado_estimado`, etc.)
  - Costos Fijos: `tb_mano_de_obra`, `tb_local`, `tb_vigilancia`, `tb_energia`, `tb_herramientos_otros`
  - Costos Variables: `tb_materiales`, `tb_implementos_seguridad`, `tb_petroleo`, `tb_gasolina`, `tb_topico`, `tb_equipo_otro`
  - Seguimiento de Tareas: `tb_seguimiento_tareas` (fecha, tarea, porcentaje, comentario)
  - Seguimiento de Materiales: `tb_seguimiento_materiales` (fecha, material_id, cantidad, costo_unitario, total, comentario)

Campos típicos utilizados en cálculos:
- `fecha` (YYYY-MM-DD)
- `cantidad`, `costo_unitario`, `total`
- `comentario`
- En proyecto: `habilitado_estimado` (presupuesto total estimado)

## Modelos de Datos
- `ProyectoModel.js`: acceso a proyectos y su resumen.
- `CostoModel.js`: operaciones por tipo de costo (fijo/variable) con sus tablas.
- `SeguimientoTareaModel.js`: registros diarios de avance físico.
- `SeguimientoMaterialModel.js`: registros de uso de materiales y costos variables.

## API HTTP
- Base: `http://localhost:3000/api`
- Prefijos:
  - Proyectos: `/proyectos`
  - Seguimiento: `/seguimiento`
- Autenticación: no incluida por defecto (agregar middleware JWT si se requiere).

### Proyectos
- `POST /api/proyectos` — crear
- `GET /api/proyectos` — listar
- `GET /api/proyectos/:id` — obtener
- `DELETE /api/proyectos/:id` — eliminar
- `POST /api/proyectos/:id/recalcular-resumen` — recalcular resumen
- `GET /api/proyectos/:id/resumen` — ver resumen

Cuerpo mínimo `POST /api/proyectos`:
```json
{
  "nombre": "Proyecto A",
  "responsable": "Ing. Pérez",
  "fecha_inicio": "2025-01-10",
  "fecha_fin": "2025-03-30",
  "habilitado_estimado": 250000
}
```

### Costos
- Tipos válidos:
  - Fijos: `mano_de_obra`, `local`, `vigilancia`, `energia`, `herramientos_otros`
  - Variables: `materiales`, `implementos_seguridad`, `petroleo`, `gasolina`, `topico`, `equipo_otro`
- Endpoints base por tipo:
  - `POST /api/proyectos/:id/costos/:tipo` — crear
  - `GET /api/proyectos/:id/costos/:tipo` — listar
  - `GET /api/proyectos/:id/costos/:tipo/:rowId` — obtener
  - `PUT /api/proyectos/:id/costos/:tipo/:rowId` — actualizar
  - `DELETE /api/proyectos/:id/costos/:tipo/:rowId` — eliminar

Ejemplos de cuerpos:
- Mano de obra (fijo):
```json
{
  "fecha": "2025-02-10",
  "cargo": "Albañil",
  "cantidad": 10,
  "costo_unitario": 120,
  "total": 1200,
  "comentario": "Semana 6"
}
```
- Materiales (variable):
```json
{
  "fecha": "2025-02-12",
  "material": "Cemento",
  "cantidad": 50,
  "costo_unitario": 35,
  "total": 1750,
  "comentario": "Losa nivel 2"
}
```

### Seguimiento de Tareas
- `POST /api/proyectos/:id/seguimiento/tareas` — crear
- `GET /api/proyectos/:id/seguimiento/tareas` — listar
- `PUT /api/proyectos/:id/seguimiento/tareas/:rowId` — actualizar
- `DELETE /api/proyectos/:id/seguimiento/tareas/:rowId` — eliminar

Cuerpo ejemplo:
```json
{
  "fecha": "2025-02-15",
  "tarea": "Cimentación",
  "porcentaje": 10,
  "comentario": "Se completó replanteo"
}
```

### Seguimiento de Materiales
- `POST /api/proyectos/:id/seguimiento/materiales` — registrar uso
- `GET /api/proyectos/:id/seguimiento/materiales` — listar todo
- `GET /api/proyectos/:id/seguimiento/materiales/:materialId` — listar por material

Cuerpo ejemplo:
```json
{
  "fecha": "2025-02-16",
  "material_id": 12,
  "cantidad": 15,
  "costo_unitario": 40,
  "total": 600,
  "comentario": "Refuerzo viga principal"
}
```

### Avance y Manifiesto PDF
- `GET /api/proyectos/:id/seguimiento/avance` — avance general
- `GET /api/proyectos/:id/seguimiento/manifiesto.pdf` — descarga/visualización del PDF

Formato de respuesta `avance`:
```json
{
  "proyecto": { "id": 1, "nombre": "Proyecto A", "habilitado_estimado": 250000 },
  "avanceFisico": 42.3,
  "avanceFinanciero": 36.8,
  "costos": {
    "totalFijo": 120000,
    "totalVariable": 71000,
    "totalProyecto": 191000
  }
}
```

## Manifiesto PDF
El PDF consolidado incluye:
- Datos del proyecto y parámetros clave.
- Resumen de costos: totales fijos, variables y total del proyecto.
- Desglose de costos por tipo (fijo y variable) con subtotales y porcentajes.
- Manifiesto de gastos totales: todas las filas por cada tipo de costo (sin límite de cantidad).
- Gráficos de avance físico y financiero (barras con porcentajes).
- Evolución temporal (líneas por fechas) para avance físico y financiero.

### Contenido y Cálculos
- Totales por tipo: suma de `total` en cada tabla por proyecto.
- Subtotales por categoría: suma de tipos fijos vs variables.
- Porcentajes por tipo dentro de su categoría: `subtotal_tipo / subtotal_categoria * 100`.
- Total del proyecto: `totalFijo + totalVariable`.

### Gráficos de Avance
- Avance físico: calculado con registros de tareas (`porcentaje`), acumulado y normalizado sobre 100%.
- Avance financiero: `totalProyecto / habilitado_estimado * 100`.
- Visualización: barras horizontales coloreadas con etiqueta de porcentaje y valores (presupuesto vs ejecutado).

### Evolución Temporal
- Líneas de tiempo (0–100%):
  - Física: acumulación de tareas completadas por fecha / total de tareas.
  - Financiera: costos diarios acumulados / presupuesto estimado.
- Ejes: X con fechas (agrupadas si hay muchas), Y en porcentaje.
- Se asegura orden cronológico y escalado uniforme.

## Validaciones
- Fechas: `YYYY-MM-DD` válidas y no futuras si la política lo exige.
- Números: `cantidad`, `costo_unitario`, `total` ≥ 0; `porcentaje` 0–100.
- Comentarios: longitud razonable, sin caracteres prohibidos.
- Proyecto: `habilitado_estimado` requerido para métricas financieras.

## Errores y Manejo
- Estructura estándar:
```json
{
  "error": true,
  "mensaje": "Descripción clara del problema",
  "detalles": {}
}
```
- Códigos HTTP: 400 validación, 404 no encontrado, 500 servidor.
- Middleware de errores centralizado (`src/middleware/errorMiddleware.js`).

## Uso desde Vue.js
- Instalar Axios: `npm i axios`
- Configurar servicio:
```js
// src/services/api.js
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api' });
export default api;
```
- Ejemplos:
```js
// Crear proyecto
await api.post('/proyectos', { nombre, responsable, fecha_inicio, fecha_fin, habilitado_estimado });

// Avance general
const { data } = await api.get(`/proyectos/${id}/seguimiento/avance`);

// Descargar PDF
const res = await api.get(`/proyectos/${id}/seguimiento/manifiesto.pdf`, { responseType: 'blob' });
const url = URL.createObjectURL(res.data);
window.open(url, '_blank');
```

## Pruebas Rápidas
- Archivos `.http` incluidos: `test-endpoints.http` y `test-endpoints-seguimiento.http`.
- Usar VSCode REST Client o cURL para verificar rutas principales antes de integrar.

## Despliegue (Railway)
- Variables de entorno para MySQL gestionadas en Railway.
- `PORT` configurado en Railway.
- Comando de inicio: `node ./src/app.js`.
- Asegurar collation `utf8mb4_unicode_ci` en la base.

## Mantenimiento y Recomendaciones
- Ordenar datos por fecha ascendente para gráficos.
- Evitar límites arbitrarios en listados del PDF (ya removido para materiales y costos).
- Considerar paginación o índice si hay miles de filas.
- Añadir autenticación (JWT) si el entorno es multiusuario.
- Agregar tests unitarios por controlador si el proyecto crece.

---

### Anexo: Rutas Clave
- `GET /health`
- `GET /api/proyectos/:id/seguimiento/manifiesto.pdf`
- `GET /api/proyectos/:id/seguimiento/avance`