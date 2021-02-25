class Pion {
    constructor(value, player) {
        switch (value) {
            case 1 : //Drapeau
                this.id = "Drapeau";
                this.value = false;
                break;
            case 2 : //Bombe
                this.id = "Bombe";
                this.value = false;
                break;
            case 3 : //Espion
                this.id = "Espion";
                this.value = 1;
                break;
            case 4 : //Eclaireur
                this.id = "Eclaireur";
                this.value = 2;
                break;
            case 5 : //Démineur
                this.id = "Demineur";
                this.value = 3;
                break;
            case 6 : //Sergeant
                this.id = "Sergeant";
                this.value = 4;
                break;
            case 7 : //Lieutenant
                this.id = "Lieutenant";
                this.value = 5;
                break;
            case 8 : //Capitaine
                this.id = "Capitaine";
                this.value = 6;
                break;
            case 9 : //Commandant
                this.id = "Commandant";
                this.value = 7;
                break;
            case 10 : //Colonel
                this.id = "Colonel";
                this.value = 8;
                break;
            case 11 : //Général
                this.id = "General";
                this.value = 9;
                break;
            case 12 : //Maréchal
                this.id = "Marechal";
                this.value = 10;
        }
        this.player = player;
    }


}

module.exports = Pion;