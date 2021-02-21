const Pion = require("./pion.js");

class Stratego {
    constructor() {
        // Joueur actuel : 0 ou 1
        this.currentPlayer = 0;

        // Tableau de 10x10 représentant la grille du jeu :
        // 0 (case vide), undefined (case lac) ou pion
        this.tab = Array(10).fill().map(() => Array(10).fill(0));
        for (let x of [2, 3, 6, 7]) {
            for (let y of [4, 5]) {
                this.tab[x][y] = undefined;
            }
        }

        // Tableau des pions restants des 2 joueurs :
        this.pionCount = Array(2).fill({
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
            "Drapeau": 1,
        });
    }

    set(x, y, value) {
        if (this.tab[x][y] == undefined) {
            console.log("Impossible modifier une case lac");
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

    reset() {
        this.currentPlayer = 0;

        this.tab = Array(10).fill().map(() => Array(10).fill(0));
        for (let x of [2, 3, 6, 7]) {
            for (let y of [4, 5]) {
                this.tab[x][y] = undefined;
            }
        }

        this.pionCount = Array(2).fill({
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
        });
    }

    isFinished() {
        // Partie terminée si un joueur n'a plus de drapeau ou si un joueur ne peut plus se déplacer
        return this.pionCount.some((pions) => pions.Drapeau == 0 || Object.values(pions).slice(0, 10).every(value => value == 0));
    }
}

module.exports = Stratego;