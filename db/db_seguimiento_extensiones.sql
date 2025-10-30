-- Extensiones de seguimiento: tareas y uso de materiales
USE `seguimiento-costeos`;

-- Tabla de seguimiento de tareas diarias
CREATE TABLE IF NOT EXISTS `tb_seguimiento_tareas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `dia` INT NOT NULL,
  `tareas_realizadas` INT NOT NULL DEFAULT 0,
  `observaciones` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_seg_tareas_desc` (`descripcion_trabajo_id`),
  CONSTRAINT `fk_seg_tareas_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Tabla de seguimiento de uso de materiales
CREATE TABLE IF NOT EXISTS `tb_seguimiento_materiales` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion_trabajo_id` INT NOT NULL,
  `material_id` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `cantidad_usada` DECIMAL(14,4) NOT NULL,
  `comentario` VARCHAR(500) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_seg_mat_desc` (`descripcion_trabajo_id`),
  INDEX `idx_seg_mat_material` (`material_id`),
  CONSTRAINT `fk_seg_mat_descripcion`
    FOREIGN KEY (`descripcion_trabajo_id`)
    REFERENCES `tb_descripción_trabajo` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_seg_mat_material`
    FOREIGN KEY (`material_id`)
    REFERENCES `tb_materiales` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;