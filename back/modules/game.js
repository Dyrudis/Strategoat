const Stratego = require("../models/stratego");

module.exports = (io, players) => {

    // Liste des parties en cours
    let games = [];

    // Fonction qui renvoie la partie du joueur ayant le nom username
    function getGame(username) {
        return games.find(game => game.players.find(player => player.username == username));
    }

    // Fonction qui renvoie le nom de l'adversaire du joueur ayant le nom username
    function getOpponent(username) {
        let game = getGame(username);
        return game.players[0].username == username ? game.players[1] : game.players[0];
    }

    function getPlayer(username) {
        let game = getGame(username);
        return game.players[0].username == username ? game.players[0] : game.players[1];
    }

    function getPlayerNumber(username) {
        let game = getGame(username);
        return game.players[0].username == username ? 0 : 1;
    }

    io.on("connection", (socket) => {

        socket.on("load game", () => {
            // Lors de la connexion à la page de jeu, on envoie certaines informations à l'utilisateur
            socket.emit("load game");

            // Attribution du bon socket id
            getPlayer(socket.handshake.session.username).id = socket.id;
        })

        // Début de la partie
        socket.on("start game", (player1, player2) => {
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
                ]
            });
        });

        socket.on("message", (message) => {
            let name = socket.handshake.session.username;
            socket.emit("message", message, "black", name);
            socket.to(getOpponent(name).id).emit("message", message, "black", name);
        });

        socket.on("ready", (tab) => {

            // Tableau legal des pions d'un joueur :
            let pionCount = {
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
            };

            //Parcours les elements pour verifier
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 10; x++) {

                    //Décremente le compteur du pion associé
                    pionCount[tab[x][y].toString()]--;
                }
            }

            //Vérification que toutes les valeurs sont nulles
            for (const key in pionCount) if (pionCount[key]) {
                socket.emit("message", "/!\\ Triche détéctée : disposition des troupes incorrecte /!\\", "red");
                return;
            }

            let username = socket.handshake.session.username;
            let game = getGame(username).game;
            for (let x = 0; x < 10; x++) {
                for (let y = 0; y < 4; y++) {
                    getPlayerNumber(username) == 0 ? game.set(x, y, tab[x][y]) : game.set(9 - x, 9 - y, tab[x][y]);
                }
            }

            getPlayer(username).ready = true;

            // Les deux joueurs sont prêt
            if (getOpponent(username).ready) {

                socket.emit("message", "Tout le monde est prêt, la partie va démarrer...", "green");
                socket.to(getOpponent(username).id).emit("message", "Tout le monde est prêt, la partie va démarrer...", "green");

                socket.emit("start", game.tab);
                socket.to(getOpponent(username).id).emit("start", game.tab);
            }
            // L'adversaire n'est pas encore prêt
            else {
                socket.emit("ready");
                socket.to(getOpponent(username).id).emit("message", "Votre adversaire est prêt.", "green");
            }
        });

        socket.on("not ready", () => {
            let username = socket.handshake.session.username;
            getPlayer(username).ready = false;
            socket.emit("not ready");
            socket.to(getOpponent(username).id).emit("message", "Votre adversaire n'est plus prêt.", "green");
        });

        // Déconnexion
        socket.on("disconnect", () => {
        });

    });

}