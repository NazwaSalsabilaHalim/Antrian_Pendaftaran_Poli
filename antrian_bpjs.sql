-- MySQL dump 10.16  Distrib 10.1.23-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: panam122013_antrian_bpjs
-- ------------------------------------------------------
-- Server version	10.1.23-MariaDB-1~xenial

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `counter`
--

DROP TABLE IF EXISTS `counter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `counter` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `CounterID` varchar(20) NOT NULL,
  `Nama` varchar(50) NOT NULL,
  `TombolID` varchar(20) NOT NULL,
  `Prefix` char(1) NOT NULL,
  `Display` int(11) NOT NULL DEFAULT '1',
  `TGL` date NOT NULL,
  `Progress` int(11) NOT NULL DEFAULT '0',
  `Play` enum('Y','N') NOT NULL DEFAULT 'N',
  `NA` enum('Y','N') NOT NULL DEFAULT 'N',
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `counter`
--

LOCK TABLES `counter` WRITE;
/*!40000 ALTER TABLE `counter` DISABLE KEYS */;
INSERT INTO `counter` VALUES (1,'C1','COUNTER 1','','',1,'2017-05-11',0,'N','N'),(2,'C2','COUNTER 2','','',1,'2017-05-11',0,'N','N'),(3,'C3','COUNTER 3','','',1,'2017-05-11',0,'N','N'),(4,'C4','COUNTER 4','','',1,'2017-05-11',0,'N','N');
/*!40000 ALTER TABLE `counter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_daftar`
--

DROP TABLE IF EXISTS `log_daftar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log_daftar` (
  `LogID` bigint(20) NOT NULL AUTO_INCREMENT,
  `TGL` date NOT NULL,
  `TombolID` varchar(20) NOT NULL,
  `Nomer` int(11) NOT NULL,
  `Progress` int(11) NOT NULL DEFAULT '0',
  `Play` enum('Y','N') NOT NULL DEFAULT 'N',
  PRIMARY KEY (`LogID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_daftar`
--

LOCK TABLES `log_daftar` WRITE;
/*!40000 ALTER TABLE `log_daftar` DISABLE KEYS */;
/*!40000 ALTER TABLE `log_daftar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `panggil`
--

DROP TABLE IF EXISTS `panggil`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `panggil` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `Tgl` date NOT NULL,
  `TombolID` varchar(20) NOT NULL,
  `CounterID` varchar(20) NOT NULL,
  `Nama` varchar(100) NOT NULL,
  `Nomor` int(11) NOT NULL,
  `Prefix` char(1) NOT NULL,
  `Display` int(11) NOT NULL,
  `Panggil` enum('Y','N') NOT NULL DEFAULT 'N',
  `PanggilUlang` enum('N','Y') NOT NULL DEFAULT 'N',
  `TanggalInsert` datetime NOT NULL,
  `TanggalPanggil` datetime NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `panggil`
--

LOCK TABLES `panggil` WRITE;
/*!40000 ALTER TABLE `panggil` DISABLE KEYS */;
/*!40000 ALTER TABLE `panggil` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tombol`
--

DROP TABLE IF EXISTS `tombol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tombol` (
  `TombolID` varchar(20) NOT NULL,
  `Nama` varchar(50) NOT NULL,
  `Prefix` varchar(10) NOT NULL DEFAULT '',
  `NA` enum('Y','N') NOT NULL DEFAULT 'N',
  PRIMARY KEY (`TombolID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COMMENT='Tampilan tombol pendaftaran';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tombol`
--

LOCK TABLES `tombol` WRITE;
/*!40000 ALTER TABLE `tombol` DISABLE KEYS */;
INSERT INTO `tombol` VALUES ('B1','PASIEN PAGI','P','N'),('B2','PASIEN SORE','R','N');
/*!40000 ALTER TABLE `tombol` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-05-11 15:08:15
