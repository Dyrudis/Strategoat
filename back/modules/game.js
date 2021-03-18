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

    // Fonction qui renvoie le nom de l'adversaire du joueur ayant le nom username
    function getOpponent(username) {
        let game = getGame(username);
        return game.players[0].username == username ? game.players[1].username : game.players[0].username;
    }

    function isPlayer1(username) {
        let game = getGame(username);
        return game.players[0].username == username;
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

            console.log(pionCount);

            //Vérification que toutes les valeurs sont nulles
            for (const key in pionCount) if (pionCount[key]) {
                console.log("Disposition des troupes incorrecte.");
                return;
            }

            let username = socket.handshake.session.username
            let game = getGame(username).game;
            for (let x = 0; x < 10; x++) {
                for (let y = 0; y < 4; y++) {
                    isPlayer1(username) ? game.set(x, y, tab[x][y]) : game.set(9 - x, 9 - y, tab[x][y]);
                }
            }

            socket.emit("test", game.tab);
        });

        // Déconnexion
        socket.on("disconnect", () => {
        });

    });

}