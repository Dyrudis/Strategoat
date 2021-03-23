module.exports = function (socket, games) {

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
        /* if (getGame(username).started) {
            sendTabToClient(getGame(username), socket);
        } */
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
                games.getPlayerNumber(username) == 0 ? game.set(x, y, tab[x][y]) : game.set(9 - x, 9 - y, tab[x][y]);
            }
        }

        // On indique au serveur que le jouer est prêt à démarrer la partie
        games.getPlayer(username).ready = true;

        // Si les deux joueurs sont prêt, la partie peut commencer
        if (games.getOpponent(username).ready) {

            // On indique au serveur que la partie est démarrée
            games.getGame(username).started = true;

            // On l'indique également aux joueurs
            socket.emit("start");
            socket.to(games.getOpponent(username).id).emit("start");

            // sendTabToClient(getGame(username), socket);
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

}
