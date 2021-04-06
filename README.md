# Strategoat
Strategoat est un site de jeu de Stratego en ligne développé par BOUHELASSA Samy, GROUX Louis, LEHU Vianney, SINGEOT-SOUSA Tanguy, ZHOU Lucas.

### Installation du projet :

1. Créer un tableau dans la base de données SQL :
```SQL
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `idaccounts` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(64) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `gamePlayed` int(11) DEFAULT '0',
  `gameWon` int(11) DEFAULT '0',
  `elo` int(11) DEFAULT '1000',
  PRIMARY KEY (`idaccounts`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

LOCK TABLES `accounts` WRITE;
INSERT INTO `accounts` VALUES
(1,'Dyson','06df50ccaabefd40fd9b70a30feb416ba9b1385d7bdc60c783221f454a21c164','Dyson@strategoat.com',13,6,983),
(2,'Nos_if','af3d520fae6ab1231d5a37ab09d6a0467735563148c2981cd94df00eb889a3aa','Nos_if@strategoat.com',11,5,976),
(3,'Hyouz','df93fc0afbb8fff63288ee00ef690b46ad3c00ac67c8c277efa98624156d04f0','Hyouz@strategoat.com',8,5,1034),
(4,'Disleif','2817e749b44238ab88af71f3be46364b08c87a468a5f6ee14f8267d22f37b985','Disleif@strategoat.com',24,13,1134),
(5,'Dyrudis','a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3','Dyrudis@strategoat.com',48,35,1432),
(6,'Valentin_UwU','984822800ec0a555d77029360ae32d601ab280b4f475b0de9c05bc94cf3203ef','Valentin_UwU@strategoat.com',57,57,1890),
(7,'admin','8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918','admin@admin.admin',0,0,9999);
UNLOCK TABLES;
```
2. Renseigner les informations de la base de données dans `server.js` (déjà configuré pour une base de données locale) :
```js
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "strategoat"
});
```
3. Lancer le serveur à l'aide des commandes `node server.js` ou `npm start`

### Démarrer une partie :

1. Se connecter sur deux comptes différents (en utilisant deux naviguateurs différents, ou avec un des naviguateurs en naviguation privée). Il est possible de se connecter avec ces comptes, mais vous pouvez également en créer de nouveaux :

Nom d'Utilisateur | Mot de Passe
----------------- | ------------
admin | admin
Dyrudis | 123
Disleif | Disleif
Nos_if | Nos_if
Hyouz | Hyouz
Dyson | Dyson
Valentin_UwU | Valentin_UwU

3. Cliquer sur le bouton "Online" vert qui apparait à gauche du pseudo de l'autre joueur
4. Accepter l'invitation du côté de l'autre joueur
5. S'amuser
