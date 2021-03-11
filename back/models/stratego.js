const Pion = require("./pion.js");

class Stratego {
    constructor() {
        // Joueur actuel : 0 ou 1
        this.currentPlayer = 0;

        // Tableau de 10x10 representant la grille du jeu :
        // 0 (case vide), undefined (case lac) ou pion
        this.tab = Array(10).fill().map(() => Array(10).fill(0));
        for (let x of [2, 3, 6, 7]) {
            for (let y of [4, 5]) {
                this.tab[x][y] = undefined;
            }
        }

        // Tableau des pions restants des 2 joueurs :
        this.pionCount = Array(2).fill({
            "12": 1,
            "10": 1,
            "9": 1,
            "8": 2,
            "7": 3,
            "6": 4,
            "5": 4,
            "4": 4,
            "3": 5,
            "2": 8,
            "1": 1,
            "11": 6
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

        //verification appartenance du pion
        if (this.tab[x1][y1].player != this.currentPlayer) {
            console.log("Le pion selectionne n'appartient pas au joueur dont c'est le tour.");
            return false;
        }
        //verification case non lac
        if (this.tab[x2][y2] == undefined) {
            console.log("La case d'arrivee selectionnee est une case \"Lac\".");
            return false;
        }
        //verification cible non alliee
        if (this.tab[x2][y2].player == this.currentPlayer) {
            console.log("Il est impossible de deplacer l'un de ses pions sur l'un de ses autres pions.");
            return false;
        }
        //verification unite deplacable
        if (this.tab[x1][y1].id == 11 || this.tab[x1][y1].id == 12) {

            console.log("Le drapeau ainsi que les bombes sont indeplacables.");
            return false;
        }
        //verification deplacement legal
        if ((x1 = !x2 && y1 != y2) && (x1 == x2 && y1 == y2)) {

            console.log("Deplacement non-legal.");
            return false;
        }
        //verifications relatives aux eclaireurs
        if (this.tab[x1][y1].id == 2) {

            //verification pas d'obstacle
            //---------------------------
            //cas deplacement vertical
            if (x1 == x2) {
                //cas deplacement vers le haut
                if (y1 < y2) {
                    for (let i = y1 + 1; i < y2; i++) {
                        if (this.tab[x1][i]) console.log("Obstacle sur le chemin de l'eclaireur.");
                        return false;
                    }
                }
                //cas deplacement vers le bas
                else {
                    for (let i = y1 - 1; i > y2; i--) {
                        if (this.tab[x1][i]) console.log("Obstacle sur le chemin de l'eclaireur.");
                        return false;
                    }
                }
            }
            //cas deplacement horizontal
            else {
                //cas deplacement vers la droite
                if (x1 < x2) {
                    for (let i = x1 + 1; i < x2; i++) {
                        if (this.tab[i][y1]) console.log("Obstacle sur le chemin de l'eclaireur.");
                        return false;
                    }
                }
                //cas deplacement vers la gauche
                for (let i = x1 - 1; i > x2; i--) {
                    if (this.tab[i][y1]) console.log("Obstacle sur le chemin de l'eclaireur.");
                    return false;
                }
            }
        }
        else if (Math.abs(x1 - x2) > 1 || Math.abs(y1 - y2) > 1) {
            console.log("Deplacements de plus d'une case avec une unite non-eclaireur impossible.");
            return false;
        }

        //Si combat
        if (this.tab[x2][y2].player == (currentplayer + 1) % 2) this.escarmouche(x1, y1, x2, y2);
        //Sinon deplacement
        else {
            this.tab[x2][y2] = this.tab[x1][y1];
            this.tab[x1][y1] = 0;
        }

        //Verification partie terminee
        if (this.isFinished()) console.log("Partie terminee, joueur " + currentplayer + "gagne.");

        //Actualisation du currentplayer
        currentplayer = (currentplayer + 1) % 2;
    }

    escarmouche() {
        //section interaction entre deux entites, consequences et deplacement si attaquant vainqueur

        //SECTION EXEPTIONS
        //-------------------------------

        //Si case confrontee est une bombe
        if (this.tab[x2][y2].id == 11) {

            //Si attaquant non-demineur
            if (this.tab[x1][y1].id != 3) attaquantPerd(x1, y1, x2, y2);
            //Si attaquant demineur
            else attaquantGagne(x1, y1, x2, y2);
        }

        //Si Espion attaque sur Marechal
        else if (this.tab[x2][y2].id == 10 && this.tab[x1][y1].id == 1) attaquantGagne(x1, y1, x2, y2);

        //-------------------------------


        //Si attaquant gagne
        else if (this.tab[x1][y1].id > this.tab[x2][y2].id) attaquantGagne(x1, y1, x2, y2);
        else if (this.tab[x1][y1].id < this.tab[x2][y2].id) attaquantPerd(x1, y1, x2, y2);
        else crossKill(x1, y1, x2, y2);

    }

    attaquantPerd(x1, y1, x2, y2) {
        this.tab[x1][y1] = 0;
        this.player.pionCount[currentplayer][this.tab[x1][y1].id]--;
    }

    attaquantGagne(x1, y1, x2, y2){
        this.player.pionCount[(currentplayer + 1) % 2][this.tab[x2][y2].id]--;
        this.tab[x2][y2] = this.tab[x1][y1];
        this.tab[x1][y1] = 0;
    }

    crossKill(x1, y1, x2, y2) {
        this.player.pionCount[currentplayer][this.tab[x1][y1].id]--;
        this.player.pionCount[(currentplayer + 1) % 2][this.tab[x2][y2].id]--;
        this.tab[x1][y1] = 0;
        this.tab[x2][y2] = 0;
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
            "12": 1,
            "10": 1,
            "9": 1,
            "8": 2,
            "7": 3,
            "6": 4,
            "5": 4,
            "4": 4,
            "3": 5,
            "2": 8,
            "1": 1,
            "11": 6
        });
    }

    isFinished() {
        // Partie terminee si un joueur n'a plus de drapeau ou si un joueur ne peut plus se deplacer
        return this.pionCount.some((pions) => pions.Drapeau == 0 || Object.values(pions).slice(0, 10).every(value => value == 0));
    }
}

module.exports = Stratego;