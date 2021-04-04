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
            started: false,
            finished: false
        });
    },

    // Fonction qui renvoie la partie du joueur ayant le nom username
    getGame: (username) => {
        return games.find(game => game.players.find(player => player.username == username));
    },

    // Fonction qui renvoie le joueur ayant le nom username
    getPlayer: (username) => {
        let game = self.getGame(username);
        if (game != undefined)
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
        let clientTab = Array(10).fill(0).map(() => Array(10).fill(0));

        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                if (tab[x][y]) {
                    // Si la partie n'est pas terminée, on n'affiche pas les pions adverse
                    if (self.getGame(username).finished == false) {
                        clientTab[x][y] = (tab[x][y].player == playerNumber ? tab[x][y].id : -1);
                    }
                    // Si la partie est terminée, on peut tout affiche à l'utilisateur
                    else {
                        clientTab[x][y] = (tab[x][y].player == playerNumber ? tab[x][y].id : "&" + tab[x][y].id);
                    }
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

    getPions: (username) => {
        let game = self.getGame(username).game;
        if (self.getPlayerNumber(username) == 0) {
            return game.pionCount;
        }
        else {
            return game.pionCount.slice().reverse();
        }
    },

    play: (username, x1, y1, x2, y2) => {
        let game = self.getGame(username).game;
        return game.play(x1, y1, x2, y2);
    },

    delete: (username) => {
        games = games.filter(game => game != self.getGame(username));
    }

}
