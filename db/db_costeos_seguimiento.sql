CREATE DATABASE IF NOT EXISTS `seguimiento-costeos`
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

USE `seguimiento-costeos`;
DROP TABLE IF EXISTS `tb_mano_de_obra`;

CREATE TABLE IF NOT EXISTS `tb_descripción_trabajo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `fecha` DATE NOT NULL,
  `nombre_del_proyecto` VARCHAR(200) NOT NULL,
  `mina` VARCHAR(200),
  `equipo` VARCHAR(150),
  `habilitado_estimado` INTEGER,
  `días_trabajados` INTEGER,
  `números_de_trabajadores_por_dia` INTEGER,
  `numero_de_tareas_por_dia` INTEGER,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
 CREATE TABLE IF NOT EXISTS `tb_mano_de_obra` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `trabajador` VARCHAR(200) NOT NULL,
  `cantidad_trabajador` INT NOT NULL DEFAULT 1,
  `precio` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `alimentacion` DECIMAL(12,2) AS (
    ROUND(`cantidad_trabajador` * 20.00 * `dias_trabajados`, 2)
  ) STORED,
  `sub_total` DECIMAL(14,2) AS (
    ROUND(`cantidad_trabajador` * `precio` * `dias_trabajados` + `alimentacion`, 2)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_mano_obra_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
  
  CREATE TABLE IF NOT EXISTS `tb_local` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `promedio` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  `precio_unitario` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `total` DECIMAL(18,4) AS (
    ROUND(`promedio` * `precio_unitario` * `dias_trabajados`, 4)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_local_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
  
CREATE TABLE IF NOT EXISTS `tb_vigilancia` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `promedio` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  `precio_unitario` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `total` DECIMAL(18,4) AS (
    ROUND(`promedio` * `precio_unitario` * `dias_trabajados`, 4)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_vigilancia_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
CREATE TABLE IF NOT EXISTS `tb_energia` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `promedio` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  `precio_unitario` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `total` DECIMAL(18,4) AS (
    ROUND(`promedio` * `precio_unitario` * `dias_trabajados`, 4)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_energia_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
CREATE TABLE IF NOT EXISTS `tb_herramientos_otros` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `promedio` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  `precio_unitario` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `total` DECIMAL(18,4) AS (
    ROUND(`promedio` * `precio_unitario` * `dias_trabajados`, 4)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_herramientos_otros_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
  
  CREATE TABLE IF NOT EXISTS `tb_materiales` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `cantidad` DECIMAL(14,4) NOT NULL DEFAULT 0.0000,
  `unidad` VARCHAR(50) NOT NULL,
  `precio_unitario` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `cantidad_usado` DECIMAL(14,4) NOT NULL DEFAULT 0.0000,
  `total` DECIMAL(18,2) AS (
    ROUND(`cantidad` * `precio_unitario`, 2)
  ) STORED,
  `total_avance` DECIMAL(18,4) AS (
    ROUND(`cantidad_usado` * `cantidad`, 4)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_materiales_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
  
  CREATE TABLE IF NOT EXISTS `tb_implementos_seguridad` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `cantidad` INT NOT NULL DEFAULT 0,
  `precio_unitario` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `total` DECIMAL(18,2) AS (
    ROUND(`cantidad` * `precio_unitario` * `dias_trabajados`, 2)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_implementos_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
  
  CREATE TABLE IF NOT EXISTS `tb_petroleo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `cantidad` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  `precio_unitario` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `total` DECIMAL(18,4) AS (
    ROUND(`cantidad` * `precio_unitario` * `dias_trabajados`, 4)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_petroleo_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS `tb_gasolina` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `cantidad` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  `precio_unitario` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `total` DECIMAL(18,4) AS (
    ROUND(`cantidad` * `precio_unitario` * `dias_trabajados`, 4)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_gasolina_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
  
  
  CREATE TABLE IF NOT EXISTS `tb_topico` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `cantidad` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  `precio_unitario` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `total` DECIMAL(18,4) AS (
    ROUND(`cantidad` * `precio_unitario` * `dias_trabajados`, 4)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_topico_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
  
  CREATE TABLE IF NOT EXISTS `tb_equipo_otro` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `descripcion` VARCHAR(300) NOT NULL,
  `cantidad` DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  `precio_unitario` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `dias_trabajados` INT NOT NULL DEFAULT 0,
  `total` DECIMAL(18,4) AS (
    ROUND(`cantidad` * `precio_unitario` * `dias_trabajados`, 4)
  ) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_equipo_otro_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS `tb_resumen_proyecto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `costo_fijo` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `costo_variable` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `costo_directo` DECIMAL(18,2) AS (ROUND(`costo_fijo` + `costo_variable`,2)) STORED,
  `costo_indirecto` DECIMAL(18,2) AS (ROUND(`costo_directo` * 0.30,2)) STORED,
  `costo_total` DECIMAL(18,2) AS (ROUND(`costo_directo` + `costo_indirecto`,2)) STORED,
  `costo_total_igv` DECIMAL(18,2) AS (ROUND(`costo_total` * 0.18,2)) STORED,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_descripcion_trabajo` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_resumen_descripcion_trabajo`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
  
  
  
DELIMITER $$

CREATE PROCEDURE `sp_actualizar_resumen` (IN p_desc_id INT)
BEGIN
  DECLARE v_fijo DECIMAL(18,2) DEFAULT 0.00;
  DECLARE v_variable DECIMAL(18,2) DEFAULT 0.00;

  -- Sumar costos fijos (ajusta nombres si añadiste/quitas tablas)
  SELECT
    COALESCE((SELECT SUM(sub_total) FROM tb_mano_de_obra WHERE descripcion_trabajo_id = p_desc_id),0)
    + COALESCE((SELECT SUM(total) FROM tb_local WHERE descripcion_trabajo_id = p_desc_id),0)
    + COALESCE((SELECT SUM(total) FROM tb_vigilancia WHERE descripcion_trabajo_id = p_desc_id),0)
    + COALESCE((SELECT SUM(total) FROM tb_energia WHERE descripcion_trabajo_id = p_desc_id),0)
    + COALESCE((SELECT SUM(total) FROM tb_herramientos_otros WHERE descripcion_trabajo_id = p_desc_id),0)
  INTO v_fijo;

  -- Sumar costos variables
  SELECT
    COALESCE((SELECT SUM(total) FROM tb_materiales WHERE descripcion_trabajo_id = p_desc_id),0)
    + COALESCE((SELECT SUM(total) FROM tb_implementos_seguridad WHERE descripcion_trabajo_id = p_desc_id),0)
    + COALESCE((SELECT SUM(total) FROM tb_petroleo WHERE descripcion_trabajo_id = p_desc_id),0)
    + COALESCE((SELECT SUM(total) FROM tb_gasolina WHERE descripcion_trabajo_id = p_desc_id),0)
    + COALESCE((SELECT SUM(total) FROM tb_topico WHERE descripcion_trabajo_id = p_desc_id),0)
    + COALESCE((SELECT SUM(total) FROM tb_equipo_otro WHERE descripcion_trabajo_id = p_desc_id),0)
  INTO v_variable;

  -- Insertar o actualizar resumen
  INSERT INTO tb_resumen_proyecto (descripcion_trabajo_id, costo_fijo, costo_variable)
  VALUES (p_desc_id, ROUND(v_fijo,2), ROUND(v_variable,2))
  ON DUPLICATE KEY UPDATE
    costo_fijo = VALUES(costo_fijo),
    costo_variable = VALUES(costo_variable),
    updated_at = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

