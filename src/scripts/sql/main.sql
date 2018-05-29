CREATE DATABASE IF NOT EXISTS `venori_db`;
#--
CREATE TABLE IF NOT EXISTS `venori_db`.`catalog` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `external_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE (`external_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
#--
CREATE TABLE IF NOT EXISTS `venori_db`.`version_control` (
  `version` INT(11) NOT NULL,
  `script` VARCHAR(50) NOT NULL,
  `update_date` DATETIME NOT NULL DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
