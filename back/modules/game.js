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
    }

}
