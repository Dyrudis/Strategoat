const Stratego = require("../models/stratego");

module.exports = (io, players) => {

    // Liste des parties en cours
    let games = [];

    // Fonction qui renvoie le socket.id du joueur ayant le nom username
    function getId(username) {
        for (let i = 0; i < games.length; i++) {
            if (games[i].players.find(player => player.username == username)) {
                return games[i].players.find(player => player.username == username).id;
            }
        }
    }

    // Fonction qui modifie le socket.id du joueur ayant le nom username
    function setId(username, id) {
        games.forEach(game => {
            if (game.players.find(player => player.username == username)) {
                game.players.find(player => player.username == username).id = id;
            }
        });
    }

    // Fonction qui renvoie la partie du joueur ayant le nom username
    function getGame(username) {    
        return games.find(game => game.players.find(player => player.username == username));
    }

    // Fonction qui renvoie la partie du joueur ayant le nom username
    function getGameById(id) {    
        return games.find(game => game.players.find(player => player.id == id));
    }

    // Fonction qui renvoie le nom de l'adversaire du joueur ayant le nom username
    function getOpponent(username) {
        let game = getGame(username);
        return game.players[0].username == username ? game.players[1].username : game.players[0].username;
    }

    io.on("connection", (socket) => {

        socket.on("load game", () => {
            // Lors de la connexion à la page de jeu, on envoie certaines informations à l'utilisateur
            socket.emit("load game");

            // Attribution du bon socket id
            setId(socket.handshake.session.username, socket.id);
        })

        // Début de la partie
        socket.on("start game", (player1, player2) => {
            games.push({
                game: new Stratego(),
                players: [
                    {
                        id: undefined,
                        username: player1
                    },
                    {
                        id: undefined,
                        username: player2
                    }
                ]
            });
        });

        socket.on("message", (message) => {
            let name = socket.handshake.session.username;
            socket.to(getId(getOpponent(name))).emit("message", message, name);
        });

        socket.on("ready", (tab) => {
            socket.id
        });

        // Déconnexion
        socket.on("disconnect", () => {
        });

    });

}