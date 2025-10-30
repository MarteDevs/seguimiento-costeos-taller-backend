# Backend - Sistema de Seguimiento y Costeo

Backend desarrollado con Express.js y MySQL para el sistema de seguimiento y costeo de proyectos.

## 🚀 Características

- **Arquitectura MVC**: Organización clara y mantenible del código
- **API RESTful**: Endpoints bien estructurados siguiendo estándares REST
- **Validación de datos**: Validación robusta con express-validator
- **Manejo de errores**: Sistema centralizado de manejo de errores
- **Base de datos MySQL**: Conexión optimizada con pool de conexiones
- **Cálculos automáticos**: Campos calculados automáticamente en la base de datos
- **Transacciones**: Soporte para operaciones transaccionales

## 📋 Requisitos

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd SEGUIMIENTO-BACKEND
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env` con:
```env
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=marte
DB_NAME=seguimiento-costeos

CORS_ORIGIN=http://localhost:3000
```

4. **Configurar la base de datos**
Ejecutar el script SQL ubicado en `db/db_costeos_seguimiento.sql`

5. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 API Endpoints

### Proyectos

#### Obtener todos los proyectos
```http
GET /api/proyectos
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Proyectos obtenidos exitosamente",
  "data": {
    "proyectos": [...],
    "total": 5
  }
}
```

#### Crear nuevo proyecto
```http
POST /api/proyectos
Content-Type: application/json

{
  "fecha": "2024-01-15",
  "nombre_del_proyecto": "Construcción de Túnel Norte",
  "mina": "Mina San José",
  "equipo": "Equipo Alpha",
  "habilitado_estimado": 100,
  "días_trabajados": 30,
  "números_de_trabajadores_por_dia": 15,
  "numero_de_tareas_por_dia": 8
}
```

#### Obtener proyecto por ID
```http
GET /api/proyectos/{id}
```

#### Obtener resumen completo del proyecto
```http
GET /api/proyectos/{id}/resumen
```

#### Actualizar proyecto
```http
PUT /api/proyectos/{id}
Content-Type: application/json

{
  "fecha": "2024-01-15",
  "nombre_del_proyecto": "Construcción de Túnel Norte - Actualizado",
  ...
}
```

#### Eliminar proyecto
```http
DELETE /api/proyectos/{id}
```

#### Actualizar resumen de costos
```http
POST /api/proyectos/{id}/actualizar-resumen
```

### Costos

Los endpoints de costos siguen el patrón:
```
/api/proyectos/{proyectoId}/costos/{tipoCosto}
```

#### Tipos de costo disponibles:
- `mano-obra`
- `local`
- `vigilancia`
- `energia`
- `herramientas-otros`
- `materiales`
- `implementos-seguridad`
- `petroleo`
- `gasolina`
- `topico`
- `equipo-otro`

#### Obtener costos por tipo
```http
GET /api/proyectos/{proyectoId}/costos/{tipoCosto}
```

#### Crear nuevo costo
```http
POST /api/proyectos/{proyectoId}/costos/mano-obra
Content-Type: application/json

{
  "trabajador": "Juan Pérez",
  "cantidad_trabajador": 2,
  "precio": 150.00,
  "dias_trabajados": 20
}
```

```http
POST /api/proyectos/{proyectoId}/costos/materiales
Content-Type: application/json

{
  "descripcion": "Cemento Portland",
  "cantidad": 100.5,
  "unidad": "kg",
  "precio_unitario": 25.50,
  "cantidad_usado": 0.8
}
```

#### Obtener costo específico
```http
GET /api/proyectos/{proyectoId}/costos/{tipoCosto}/{id}
```

#### Actualizar costo
```http
PUT /api/proyectos/{proyectoId}/costos/{tipoCosto}/{id}
```

#### Eliminar costo
```http
DELETE /api/proyectos/{proyectoId}/costos/{tipoCosto}/{id}
```

## 🗄️ Estructura de la Base de Datos

### Tabla Principal: `tb_descripción_trabajo`
- Información básica del proyecto
- Fechas, nombres, equipos, estimaciones

### Tablas de Costos Fijos:
- `tb_mano_de_obra`: Costos de personal
- `tb_local`: Costos de instalaciones
- `tb_vigilancia`: Costos de seguridad
- `tb_energia`: Costos energéticos
- `tb_herramientos_otros`: Herramientas y otros

### Tablas de Costos Variables:
- `tb_materiales`: Materiales de construcción
- `tb_implementos_seguridad`: Equipos de protección
- `tb_petroleo`: Combustible diésel
- `tb_gasolina`: Combustible gasolina
- `tb_topico`: Gastos médicos
- `tb_equipo_otro`: Otros equipos

### Tabla de Resumen: `tb_resumen_proyecto`
- Cálculos automáticos de costos totales
- Costos directos e indirectos
- IGV incluido

## 🔧 Estructura del Proyecto

```
src/
├── app.js                 # Aplicación principal
├── config/
│   └── database.js        # Configuración de base de datos
├── controllers/
│   ├── proyectoController.js
│   └── costoController.js
├── models/
│   ├── ProyectoModel.js
│   └── CostoModel.js
├── middleware/
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
└── routes/
    └── proyectoRoutes.js
```

## 🛡️ Validaciones

### Proyecto:
- Fecha requerida (formato ISO)
- Nombre del proyecto (3-200 caracteres)
- Campos numéricos positivos

### Mano de Obra:
- Trabajador requerido (2-200 caracteres)
- Cantidad y precio positivos
- Días trabajados >= 0

### Materiales:
- Descripción requerida
- Cantidad, unidad y precio requeridos
- Cantidad usada >= 0

## 🚨 Manejo de Errores

El sistema maneja automáticamente:
- Errores de validación (400)
- Registros no encontrados (404)
- Errores de base de datos (500)
- Violaciones de integridad referencial

## 📊 Cálculos Automáticos

### Mano de Obra:
- `alimentacion = cantidad_trabajador * 20.00 * dias_trabajados`
- `sub_total = (cantidad_trabajador * precio * dias_trabajados) + alimentacion`

### Otros Costos:
- `total = cantidad/promedio * precio_unitario * dias_trabajados`

### Resumen del Proyecto:
- `costo_directo = costo_fijo + costo_variable`
- `costo_indirecto = costo_directo * 0.30`
- `costo_total = costo_directo + costo_indirecto`
- `costo_total_igv = costo_total * 0.18`

## 🔄 Procedimiento Almacenado

El sistema incluye el procedimiento `sp_actualizar_resumen(proyecto_id)` que:
1. Calcula automáticamente todos los totales
2. Actualiza la tabla de resumen
3. Mantiene la consistencia de datos

## 🌐 CORS y Seguridad

- CORS configurado para desarrollo
- Helmet para headers de seguridad
- Compresión de respuestas
- Logging con Morgan

## 📝 Ejemplos de Uso

### Crear un proyecto completo:

1. **Crear proyecto base**
2. **Agregar mano de obra**
3. **Agregar materiales**
4. **Actualizar resumen**
5. **Obtener resumen completo**

Ver ejemplos detallados en la documentación de cada endpoint.

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature
3. Commit los cambios
4. Push a la rama
5. Crear Pull Request

## 📄 Licencia

ISC License