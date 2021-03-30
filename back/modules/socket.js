const Pion = require("../models/pion");

module.exports = function (socket, games, connection) {

    // Début de la partie
    socket.on("start game", (player1, player2) => {
        games.createGame(player1, player2);
    });

    // Un joueur arrive sur la page de jeu
    socket.on("load game", () => {
        // Récupération de son nom
        let username = socket.handshake.session.username;

        // Attribution du bon socket id
        games.getPlayer(username).id = socket.id;

        // Si la partie a démarée, on renvoie le tableau
        if (games.getGame(username).started) {
            socket.emit("reload tab", games.getTab(username));
        }
    });

    // Message d'un joueur
    socket.on("message", (message) => {
        // Récupération de son nom
        let name = socket.handshake.session.username;

        // Envoie du message aux deux joueurs de la partie
        socket.emit("message", message, "black", name);
        socket.to(games.getOpponent(name).id).emit("message", message, "black", name);
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
            socket.emit("start", games.getTab(username));
            socket.to(games.getOpponent(username).id).emit("start", games.getTab(games.getOpponent(username).username));

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

            console.log(winner.username + " gagne !");

            games.getGame(username).finished = true;

            // Calcul du nouvel elo :
            let EloRating = require('elo-rating');
            let winnerName = winner.username;
            let loserName = games.getOpponent(winnerName).username;
            connection.query("SELECT elo FROM accounts WHERE username = ?", [winnerName], (err, result) => {
                if (err) throw err;
                let winnerElo = result[0].elo;
                connection.query("SELECT elo FROM accounts WHERE username = ?", [loserName], (err, result) => {
                    if (err) throw err;
                    let loserElo = result[0].elo;

                    console.log(winnerElo, loserElo);

                    newElo = EloRating.calculate(winnerElo, loserElo, true, 30);

                    connection.query("UPDATE accounts SET elo = ? WHERE username = ?", [newElo.playerRating, winnerName], (err, result) => {
                        if (err) throw err;
                    });

                    connection.query("UPDATE accounts SET elo = ? WHERE username = ?", [newElo.opponentRating, loserName], (err, result) => {
                        if (err) throw err;
                    });
                });
            });

            connection.query("UPDATE accounts SET gamePlayed = gamePlayed + 1 WHERE username = ?", [winnerName], (err, result) => {
                if (err) throw err;
            });
            connection.query("UPDATE accounts SET gameWon = gameWon + 1 WHERE username = ?", [winnerName], (err, result) => {
                if (err) throw err;
            });            
            connection.query("UPDATE accounts SET gamePlayed = gamePlayed + 1 WHERE username = ?", [loserName], (err, result) => {
                if (err) throw err;
            });


            // On envoie le tableau (révélation des cases adverses)
            socket.emit("end", games.getTab(username));
            socket.to(games.getOpponent(username).id).emit("end", games.getTab(games.getOpponent(username).username));

            // Notification par message
            socket.emit("message", "Partie terminé, " + winner.username + " remporte la victoire !", "green");
            socket.to(games.getOpponent(username).id).emit("message", "Partie terminé, " + winner.username + " remporte la victoire !", "green");
        }
        // Le tour s'est bien déroulé
        else {
            socket.emit("update tab", games.getTab(username));
            socket.to(games.getOpponent(username).id).emit("update tab", games.getTab(games.getOpponent(username).username));

            socket.emit("message", "Votre adversaire est en train de jouer !", "green");
            socket.to(games.getOpponent(username).id).emit("message", "C'est à vous de jouer !", "green");
        }
    });

}
