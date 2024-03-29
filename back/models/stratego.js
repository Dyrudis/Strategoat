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
        this.pionCount = Array(2).fill(0).map(() => {
            return {
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
            }
        });
    }

    set(x, y, value) {
        if (this.tab[x][y] == undefined) {
            return {
                success: false,
                message: "Impossible modifier une case lac"
            };
        }
        this.tab[x][y] = value;
        return {
            success: true
        };
    }

    play(x1, y1, x2, y2) {
        x1 = parseInt(x1);
        x2 = parseInt(x2);
        y1 = parseInt(y1);
        y2 = parseInt(y2);
        //section autorisation deplacement

        //verification appartenance du pion
        if (this.tab[x1][y1].player != this.currentPlayer) {
            return {
                success: false,
                message: "Le pion selectionne n'appartient pas au joueur dont c'est le tour."
            };
        }
        //verification pion
        if (this.tab[x1][y1].player == undefined) {
            return {
                success: false,
                message: "La case de depart selectionnee n'est pas un pion."
            };
        }
        //verification case arrive non lac
        if (this.tab[x2][y2] == undefined) {
            return {
                success: false,
                message: "La case d'arrivee selectionnee est une case \"Lac\"."
            };
        }
        //verification case depart non lac
        if (this.tab[x1][y1] == undefined) {
            return {
                success: false,
                message: "La case depart selectionnee est une case \"Lac\"."
            };
        }
        //verification cible non alliee
        if (this.tab[x2][y2].player == this.currentPlayer) {
            return {
                success: false,
                message: "Il est impossible de deplacer l'un de ses pions sur l'un de ses autres pions."
            };
        }
        //verification unite deplacable
        if (this.tab[x1][y1].id == 11 || this.tab[x1][y1].id == 12) {
            return {
                success: false,
                message: "Le drapeau ainsi que les bombes sont indeplacables."
            };
        }
        //verification deplacement legal
        if ((x1 != x2 && y1 != y2) || (x1 == x2 && y1 == y2)) {
            return {
                success: false,
                message: "Deplacement non-legal."
            };
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
                        if (this.tab[x1][i]) {
                            return {
                                success: false,
                                message: "Obstacle sur le chemin de l'eclaireur."
                            };
                        }
                    }
                }
                //cas deplacement vers le bas
                else {
                    for (let i = y1 - 1; i > y2; i--) {
                        if (this.tab[x1][i]) {
                            return {
                                success: false,
                                message: "Obstacle sur le chemin de l'eclaireur."
                            };
                        }
                    }
                }
            }
            //cas deplacement horizontal
            else {
                //cas deplacement vers la droite
                if (x1 < x2) {
                    for (let i = x1 + 1; i < x2; i++) {
                        if (this.tab[i][y1]) {
                            return {
                                success: false,
                                message: "Obstacle sur le chemin de l'eclaireur."
                            };
                        }
                    }
                }
                //cas deplacement vers la gauche
                for (let i = x1 - 1; i > x2; i--) {
                    if (this.tab[i][y1]) {
                        return {
                            success: false,
                            message: "Obstacle sur le chemin de l'eclaireur."
                        };
                    }
                }
            }
        }
        else if (Math.abs(x1 - x2) > 1 || Math.abs(y1 - y2) > 1) {
            return {
                success: false,
                message: "Deplacements de plus d'une case avec une unite non-eclaireur impossible."
            };
        }

        let fight = false;
        let pions = [];
        //Si combat
        if (this.tab[x2][y2].player == (this.currentPlayer + 1) % 2) {
            fight = true;
            pions.push(this.tab[x1][y1].id);
            pions.push(this.tab[x2][y2].id);
            this.escarmouche(x1, y1, x2, y2);
        }
        //Sinon deplacement
        else {
            this.tab[x2][y2] = this.tab[x1][y1];
            this.tab[x1][y1] = 0;
        }

        //Verification partie terminee
        if (this.isFinished()) {
            return {
                success: true,
                winner: this.currentPlayer
            };
        }

        //Actualisation du currentPlayer
        this.currentPlayer = (this.currentPlayer + 1) % 2;

        return {
            success: true,
            fight: fight,
            pions: pions
        };
    }

    escarmouche(x1, y1, x2, y2) {
        //section interaction entre deux entites, consequences et deplacement si attaquant vainqueur

        //SECTION EXEPTIONS
        //-------------------------------

        //Si case confrontee est une bombe
        if (this.tab[x2][y2].id == 11) {

            //Si attaquant non-demineur
            if (this.tab[x1][y1].id != 3) this.attaquantPerd(x1, y1, x2, y2);
            //Si attaquant demineur
            else this.attaquantGagne(x1, y1, x2, y2);
        }

        //Si case confrontee est le drapeau
        else if (this.tab[x2][y2].id == 12) this.attaquantGagne(x1, y1, x2, y2);

        //Si Espion attaque sur Marechal
        else if (this.tab[x2][y2].id == 10 && this.tab[x1][y1].id == 1) this.attaquantGagne(x1, y1, x2, y2);

        //-------------------------------


        //Si attaquant gagne
        else if (this.tab[x1][y1].id > this.tab[x2][y2].id) this.attaquantGagne(x1, y1, x2, y2);
        else if (this.tab[x1][y1].id < this.tab[x2][y2].id) this.attaquantPerd(x1, y1, x2, y2);
        else this.crossKill(x1, y1, x2, y2);

    }

    attaquantPerd(x1, y1, x2, y2) {
        let id = this.tab[x1][y1].id;
        this.pionCount[this.currentPlayer][id.toString()]--;
        this.tab[x1][y1] = 0;
    }

    attaquantGagne(x1, y1, x2, y2) {
        let id = this.tab[x2][y2].id;
        this.pionCount[(this.currentPlayer + 1) % 2][id.toString()]--;
        this.tab[x2][y2] = this.tab[x1][y1];
        this.tab[x1][y1] = 0;
    }

    crossKill(x1, y1, x2, y2) {
        let id1 = this.tab[x1][y1].id;
        let id2 = this.tab[x2][y2].id;
        this.pionCount[this.currentPlayer][id1.toString()]--;
        this.pionCount[(this.currentPlayer + 1) % 2][id2.toString()]--;
        this.tab[x1][y1] = 0;
        this.tab[x2][y2] = 0;
    }

    isFinished() {
        // Partie terminee si un joueur n'a plus de drapeau ou si un joueur ne peut plus se deplacer
        return this.pionCount.some((pions) => pions["12"] == 0 || Object.values(pions).slice(0, 10).every(value => value == 0));
    }
}

module.exports = Stratego;