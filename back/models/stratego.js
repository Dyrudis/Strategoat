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
            "Marechal": 1,
            "General": 1,
            "Colonel": 2,
            "Commandant": 3,
            "Capitaine": 4,
            "Lieutenant": 4,
            "Sergeant": 4,
            "Demineur": 5,
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
        if (this.tab[x1][y1].id == "Bombe" || this.tab[x1][y1].id == "Drapeau") {

            console.log("Le drapeau ainsi que les bombes sont indeplacables.");
        }
        //verification deplacement legal
        if ((x1 =! x2 && y1 != y2) && (x1 == x2 && y1 == y2)) { 
            
            console.log("Deplacement non-legal.");
        }
        //verifications relatives aux eclaireurs
        if (this.tab[x1][y1].id == "Eclaireur"){

            //verification pas d'obstacle
            //---------------------------
            //cas deplacement vertical
            if (x1 == x2) {
                //cas deplacement vers le haut
                if (y1 < y2){
                    for (let i = y1 + 1; i < y2; i++){
                        if (this.tab[x1][i]) console.log("Obstacle sur le chemin de l'eclaireur.");
                    }
                }
                //cas deplacement vers le bas
                else{
                    for (let i = y1 - 1; i > y2; i--){
                        if (this.tab[x1][i]) console.log("Obstacle sur le chemin de l'eclaireur.");
                    }
                }
            }
            //cas deplacement horizontal
            else{
                //cas deplacement vers la droite
                if (x1 < x2){
                    for (let i = x1 + 1; i < x2; i++){
                        if (this.tab[i][y1]) console.log("Obstacle sur le chemin de l'eclaireur.");
                    }
                }
                //cas deplacement vers la gauche
                for (let i = x1 - 1; i > x2; i--){
                    if (this.tab[i][y1]) console.log("Obstacle sur le chemin de l'eclaireur.");
                }
            }
        }
        else if (Math.abs(x1 - x2) > 1 || Math.abs(y1 - y2) > 1) console.log("Deplacements de plus d'une case avec une unite non-eclaireur impossible.");
        
        
        this.escarmouche(x1, y1, x2, y2);

        currentplayer = (currentplayer + 1) % 2;
    }

    escarmouche(x1, y1, x2, y2) {
        //section interaction entre deux entites et consequences 

        
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
            "Marechal": 1,
            "General": 1,
            "Colonel": 2,
            "Commandant": 3,
            "Capitaine": 4,
            "Lieutenant": 4,
            "Sergeant": 4,
            "Demineur": 5,
            "Eclaireur": 8,
            "Espion": 1,
            "Bombe": 6,
            "Drapeau": 1
        });
    }

    isFinished() {
        // Partie terminee si un joueur n'a plus de drapeau ou si un joueur ne peut plus se deplacer
        return this.pionCount.some((pions) => pions.Drapeau == 0 || Object.values(pions).slice(0, 10).every(value => value == 0));
    }
}

module.exports = Stratego;