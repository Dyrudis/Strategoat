const Pion = require("../models/pion");
const Stratego = require("../models/stratego");

let games = [];

let self = module.exports = {

    // Création d'une nouvelle partie dans le tableau games
    createGame: (player1, player2) => {
        games.push({
            game: new Stratego(),
            players: [
                {
                    id: undefined,
                    username: player1,
                    ready: false
                },
                {
                    id: undefined,
                    username: player2,
                    ready: false
                }
            ],
            started: false
        });

        console.log(`Nouvelle partie : ${player1} vs ${player2}`);
    },

    // Fonction qui renvoie la partie du joueur ayant le nom username
    getGame: (username) => {
        return games.find(game => game.players.find(player => player.username == username));
    },

    // Fonction qui renvoie le joueur ayant le nom username
    getPlayer: (username) => {
        let game = self.getGame(username);
        return game.players[0].username == username ? game.players[0] : game.players[1];
    },

    // Fonction qui renvoie l'adversaire du joueur ayant le nom username
    getOpponent: (username) => {
        let game = self.getGame(username);
        return game.players[0].username == username ? game.players[1] : game.players[0];
    },

    // Fonction qui renvoie le numéro du joueur ayant le nom username
    getPlayerNumber: (username) => {
        let game = self.getGame(username);
        return game.players[0].username == username ? 0 : 1;
    },

    getTab: (username) => {
        let tab = self.getGame(username).game.tab;
        let playerNumber = self.getPlayerNumber(username);
        let clientTab = Array(10).fill(0).map(x => Array(10).fill(0));

        // On ne copie pas les cases appartenant à l'adversaire
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                if (tab[x][y]) {
                    clientTab[x][y] = (tab[x][y].player == playerNumber ? tab[x][y].id : -1);
                }
                else {
                    clientTab[x][y] = tab[x][y];
                }
            }
        }

        if (playerNumber == 1) {
            clientTab = clientTab.map((line, x) => line.map((elem, y) => clientTab[9 - x][9 - y]));
        }

        return clientTab;
    },

    play: (username, x1, y1, x2, y2) => {
        let game = self.getGame(username).game;
        return game.play(x1 ,y1, x2, y2);
    }

}
