# Strategoat
Strategoat est un site de jeu de Stratego en ligne !

### Étapes pour installer le projet :

1. Création du tableau dans la base de données SQL :
```SQL
-- MySQL dump 10.13  Distrib 8.0.16, for Win64 (x86_64)
--
-- Host: localhost    Database: strategoat
-- ------------------------------------------------------
-- Server version    5.6.17

SET NAMES utf8 ;

DROP TABLE IF EXISTS `accounts`;
SET character_set_client = utf8mb4 ;
CREATE TABLE `accounts` (
  `idAccount` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(64) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `gamePlayed` int(11) DEFAULT '0',
  `gameWon` int(11) DEFAULT '0',
  `elo` int(11) DEFAULT '1000',
  PRIMARY KEY (`idAccount`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;
```
2. Renseigner les informations de la base de données dans server.js :
```js
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "strategoat"
});
```
3. Lancer le serveur, à l'aide des commandes `node server.js` ou `npm start`
