module.exports = (io, players) => {

    // Liste des invitations en attente
    let invitations = [];

    // Fonction qui renvoie le socket.id du joueur ayant le nom username
    function getId(username) {
        let player = players.find(player => player.username == username);
        return player ? player.id : undefined;
    }

    io.on("connection", (socket) => {

        socket.on("load home", () => {
            // Lors de la connexion à la page d'accueil, on envoie certaines informations à l'utilisateur
            socket.emit("load home", socket.handshake.session.username);

            // Puis on ajoute le joueur à la liste des joueurs disponibles
            players.push({
                id: socket.id,
                username: socket.handshake.session.username
            });

            // Et on actualise l'affichage de tous les joueurs
            io.emit("refresh players", players);
        })

        // Envoie d'une invitation
        socket.on("send invite", username => {
            invitations.push(`${socket.handshake.session.username}:${username}`);
            socket.to(getId(username)).emit("get invite", socket.handshake.session.username);
        });

        // Invitation acceptée : début de la partie
        socket.on("start game", (player1, player2) => {
            // On vérifie que l'invitation existe
            if (invitations.includes(`${player1}:${player2}`)) {
                // On la supprime des invitations en attente
                invitations = invitations.filter(inv => inv != `${player1}:${player2}`);
                if (socket.id == getId(player1)) {
                    socket.emit("found", player2);
                    socket.to(getId(player2)).emit("found", player1);
                }
                else {
                    socket.to(getId(player1)).emit("found", player2);
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

        // Déconnexion
        socket.on("disconnect", () => {
            // Lors de la déconnexion, on supprime le joueur de la liste des joueurs en ligne
            players = players.filter(player => player.id != socket.id);
            // Puis on actualise l'affichage de tous les autres joueurs
            socket.broadcast.emit("refresh players", players);
        });

    });

}