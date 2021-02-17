const Pion = require("./pion.js");

class Stratego {
    constructor() {
        // Joueur actuel :
        //  Joueur 1 = 0
        //  Joueur 2 = 1
        this.currentPlayer = 0;
        
        // Tableau des pions restants des 2 joueurs :
        //  this.pionCount[0] = joueur 1
        //  this.pionCount[1] = joueur 2
        this.pionCount = [
            {
                "Maréchal": 1,
                "Général": 1,
                "Colonel": 2,
                "Commandant": 3,
                "Capitaine": 4,
                "Lieutenant": 4,
                "Sergeant": 4,
                "Démineur": 5,
                "Eclaireur": 8,
                "Espion": 1,
                "Bombe": 6,
                "Drapeau": 1
            },
            {
                "Maréchal": 1,
                "Général": 1,
                "Colonel": 2,
                "Commandant": 3,
                "Capitaine": 4,
                "Lieutenant": 4,
                "Sergeant": 4,
                "Démineur": 5,
                "Eclaireur": 8,
                "Espion": 1,
                "Bombe": 6,
                "Drapeau": 1
            }
        ]

        // Tableau de 10x10 représentant la grille du jeu
        //  Valeurs possibles du tableau :
        //   0 = sol
        //   undefined = lac
        //   variable de la classe Pion
        this.tab = Array(10).fill().map(() => Array(10).fill(0));
        this.tab[2][4] = undefined;
        this.tab[2][5] = undefined;
        this.tab[3][4] = undefined;
        this.tab[3][5] = undefined;
        this.tab[6][4] = undefined;
        this.tab[6][5] = undefined;
        this.tab[7][4] = undefined;
        this.tab[7][5] = Pion(1, 0);
    }

    set(x, y, value) {
        if (this.tab[x][y] != undefined) {
            console.log("Impossible de placer ou de supprimer un pion dans le lac");
            return false;
        }
        this.tab[x][y] = value;
        return true;
    }

    play(x1, y1, x2, y2) {
        //section autorisation deplacement

        //vérification appartenance du pion
        if (this.tab[x1][y1].player != this.currentPlayer) {
            console.log("Le pion séléctionné n'appartient pas au joueur dont c'est le tour.");
            return false;
        }
        //vérification case non lac
        if (this.tab[x2][y2] == undefined) {
            console.log("La case d'arrivée séléctionnée est une case \"Lac\".");
            return false;
        }
        //vérification cible non alliée
        if (this.tab[x2][y2].player == this.currentPlayer) {
            console.log("Il est impossible de déplacer l'un de ses pions sur l'un de ses autres pions.");
            return false;
        }
        //vérification unité déplacable
        if (this.tab[x1][y1].id == "Bombe" || this.tab[x1][y1].id == "Drapeau") {
            
            console.log("Le drapeau ainsi que les bombes sont indéplacables.")
        }
        //vérification unité éclaireur
        if (this.tab[x1][y1].id == "Eclaireur") { // verifier que si un axe change : pas un autre, et pas de saut
            //marque page louis
        }
        
        
            //move

        currentplayer = (currentplayer + 1) % 2;
    }
}

module.exports = Stratego;