const Pion = require("../models/pion");

function refresh(io, database, connections) {
    database.query("SELECT username, gamePlayed, gameWon, elo FROM accounts", (err, result) => {
        if (err) throw err;

        result.forEach(player => {
            player.status = connections.getPlayer(player.username).status;
        });

        io.emit("refresh players", result);
    });
}

// Liste des invitations en attente
let invitations = [];

module.exports = function (io, games, database, connections) {

    io.on("connection", (socket) => {

        socket.on("load home", () => {

            let session = socket.handshake.session;

            // Lors de la connexion à la page d'accueil, on envoie certaines informations à l'utilisateur
            socket.emit("load home", session.username);

            connections.setStatus(session.username, "Online");
            connections.setId(session.username, socket.id);
            // Refresh de l'affichage des autres joueurs (pour voir les joueur connectés en temps réel)
            refresh(io, database, connections);
        })

        // Envoie d'une invitation
        socket.on("send invite", username => {
            invitations.push(`${socket.handshake.session.username}:${username}`);
            socket.to(connections.getPlayer(username).id).emit("get invite", socket.handshake.session.username);
        });

        // Invitation acceptée : début de la partie
        socket.on("start game", (player1, player2) => {
            // On vérifie que l'invitation existe
            if (invitations.includes(`${player1}:${player2}`)) {
                // On la supprime des invitations en attente
                invitations = invitations.filter(inv => inv != `${player1}:${player2}`);
                if (socket.id == connections.getPlayer(player1).id) {
                    socket.emit("found", player2);
                    socket.to(connections.getPlayer(player2).id).emit("found", player1);
                }
                else {
                    socket.to(connections.getPlayer(player1).id).emit("found", player2);
                    socket.emit("found", player1);
                }
            }
        });

        socket.on("session variable", (name, value) => {
            socket.handshake.session[name] = value;
        });

        // Invitation refusée
        socket.on("decline", (player1, player2) => {
            // On la supprime des invitations en attente
            invitations = invitations.filter(inv => inv != `${player1}:${player2}`);
        });

        // Début de la partie
        socket.on("start game", (player1, player2) => {
            games.createGame(player1, player2, connections.getPlayer(player1).civ, connections.getPlayer(player2).civ);
        });

        // Changement de civilisation
        socket.on("civ", (username, civ) => {
            connections.getPlayer(username).civ = civ;
        });

        // Un joueur arrive sur la page de jeu
        socket.on("load game", () => {

            // Récupération de son nom
            let username = socket.handshake.session.username;

            // Attribution du bon socket id
            games.getPlayer(username).id = socket.id;

            if (games.getGame(username)) {
                socket.emit("civ", connections.getPlayer(username).civ, connections.getPlayer(games.getOpponent(username).username).civ)
            }
            // Si la partie a démarée, on renvoie le tableau
            if (games.getGame(username).started) {
                socket.emit("reload tab", games.getTab(username), games.getPions(username));
            }

            connections.setStatus(socket.handshake.session.username, "In game");
            connections.setId(socket.handshake.session.username, socket.id);
            refresh(io, database, connections);
        });

        // Message d'un joueur
        socket.on("message", (message) => {
            // Récupération de son nom
            let name = socket.handshake.session.username;

            // Envoie du message aux deux joueurs de la partie
            socket.emit("message", message, "white", name);
            socket.to(games.getOpponent(name).id).emit("message", message, "white", name);
        });

        // Un joueur est prêt
        socket.on("ready", (tab) => {

            // Tableau légal des pions d'un joueur :
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

            // Parcours les éléments pour vérifier
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 10; x++) {
                    // Décremente le compteur du pion associé
                    pionCount[tab[x][y].toString()]--;
                }
            }

            // Vérification que toutes les valeurs sont nulles
            for (const key in pionCount) if (pionCount[key]) {
                socket.emit("message", "/!\\ Triche détéctée : disposition des troupes incorrecte /!\\", "red");
                return;
            }

            // Récupération du nom et de la partie du joueur
            let username = socket.handshake.session.username;
            let game = games.getGame(username).game;
            for (let x = 0; x < 10; x++) {
                for (let y = 0; y < 4; y++) {
                    games.getPlayerNumber(username) == 0 ? game.set(x, y, new Pion(tab[x][y], 0)) : game.set(9 - x, 9 - y, new Pion(tab[x][y], 1));
                }
            }

            // On indique au serveur que le jouer est prêt à démarrer la partie
            games.getPlayer(username).ready = true;

            // Si les deux joueurs sont prêt, la partie peut commencer
            if (games.getOpponent(username).ready) {

                // On indique au serveur que la partie est démarrée
                games.getGame(username).started = true;

                // On l'indique également aux joueurs
                socket.emit("start", games.getTab(username), games.getPions(username));
                socket.to(games.getOpponent(username).id).emit("start", games.getTab(games.getOpponent(username).username), games.getPions(games.getOpponent(username).username));

                // On indique au joueur 1 que c'est à sont tour
                if (games.getPlayerNumber(username) == 0) {
                    socket.emit("message", "C'est à vous de jouer !", "green");
                    socket.to(games.getOpponent(username).id).emit("message", "Votre adversaire est en train de jouer !", "green");
                }
                else {
                    socket.emit("message", "Votre adversaire est en train de jouer !", "green");
                    socket.to(games.getOpponent(username).id).emit("message", "C'est à vous de jouer !", "green");
                }
            }

            // Si l'adversaire n'est pas encore prêt
            else {
                socket.emit("ready");
                socket.to(games.getOpponent(username).id).emit("message", "Votre adversaire est prêt.", "green");
            }
        });

        // Un joueur n'est plus prêt
        socket.on("not ready", () => {

            // Récupération de son nom
            let username = socket.handshake.session.username;

            // On indique au serveur que le joueurs n'est plus prêt
            games.getPlayer(username).ready = false;

            // On l'indique également aux joueurs
            socket.emit("not ready");
            socket.to(games.getOpponent(username).id).emit("message", "Votre adversaire n'est plus prêt.", "green");
        });

        socket.on("play", (x1, y1, x2, y2) => {

            let username = socket.handshake.session.username;

            // Si la partie est terminée, il est impossible de jouer
            if (games.getGame(username).finished) {
                socket.emit("message", "Partie terminée, impossible de jouer.", "red");
                return
            }

            // Si c'est le joueur 2 qui joue, on inverse ses coordonnées (vue symmétrique)
            if (games.getPlayerNumber(username) == 1) {
                x1 = 9 - x1;
                y1 = 9 - y1;
                x2 = 9 - x2;
                y2 = 9 - y2;
            }

            let result = games.play(username, x1, y1, x2, y2);

            // Erreur lors du tour
            if (result.success == false) {
                socket.emit("message", result.message, "red");
            }
            // Le tour s'est bien déroulé mais la partie est terminée
            else if (result.winner != undefined) {
                let winner = games.getGame(username).players[result.winner];

                games.getGame(username).finished = true;

                // Calcul du nouvel elo :
                let EloRating = require('elo-rating');
                let winnerName = winner.username;
                let loserName = games.getOpponent(winnerName).username;
                database.query("SELECT elo FROM accounts WHERE username = ?", [winnerName], (err, result) => {
                    if (err) throw err;
                    let winnerElo = result[0].elo;
                    database.query("SELECT elo FROM accounts WHERE username = ?", [loserName], (err, result) => {
                        if (err) throw err;
                        let loserElo = result[0].elo;

                        newElo = EloRating.calculate(winnerElo, loserElo, true, 30);

                        database.query("UPDATE accounts SET elo = ? WHERE username = ?", [newElo.playerRating, winnerName], (err, result) => {
                            if (err) throw err;
                        });

                        database.query("UPDATE accounts SET elo = ? WHERE username = ?", [newElo.opponentRating, loserName], (err, result) => {
                            if (err) throw err;
                        });
                    });
                });

                database.query("UPDATE accounts SET gamePlayed = gamePlayed + 1 WHERE username = ?", [winnerName], (err, result) => {
                    if (err) throw err;
                });
                database.query("UPDATE accounts SET gameWon = gameWon + 1 WHERE username = ?", [winnerName], (err, result) => {
                    if (err) throw err;
                });
                database.query("UPDATE accounts SET gamePlayed = gamePlayed + 1 WHERE username = ?", [loserName], (err, result) => {
                    if (err) throw err;
                });


                // On envoie le tableau (révélation des cases adverses)
                socket.emit("end", games.getTab(username), games.getPions(username));
                socket.to(games.getOpponent(username).id).emit("end", games.getTab(games.getOpponent(username).username), games.getPions(games.getOpponent(username).username));

                // Notification par message
                socket.emit("message", "Partie terminé, " + winner.username + " remporte la victoire !", "green");
                socket.to(games.getOpponent(username).id).emit("message", "Partie terminé, " + winner.username + " remporte la victoire !", "green");
                socket.emit("message", "Redirection vers l'accueil dans 5 secondes.", "gray");
                socket.to(games.getOpponent(username).id).emit("message", "Redirection vers l'accueil dans 5 secondes.", "gray");

                setTimeout(function () { games.delete(username); }, 5000);
            }
            // Le tour s'est bien déroulé
            else {
                socket.emit("update tab", games.getTab(username), games.getPions(username));
                socket.to(games.getOpponent(username).id).emit("update tab", games.getTab(games.getOpponent(username).username), games.getPions(games.getOpponent(username).username));

                socket.emit("message", "Votre adversaire est en train de jouer !", "green");
                socket.to(games.getOpponent(username).id).emit("message", "C'est à vous de jouer !", "green");
            }
        });

        // Déconnexion
        socket.on("disconnect", () => {
            // On indique que le joueur n'est plus connecté
            connections.setStatus(socket.handshake.session.username, "Offline");

            // Puis on actualise l'affichage de tous les autres joueurs
            refresh(io, database, connections);
        });

    });

}
