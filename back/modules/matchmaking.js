module.exports = (io, socket, waitingPlayer) => {

    // Recherche d'adversaire
    socket.on("search", username => {

        // On vérifie que le pseudo envoyé correspond bien à celui de la session
        if (socket.handshake.session.username == username) {
            console.log(`${username} cherche un adversaire`);

            // Un adversaire est déjà disponible
            if (waitingPlayer.id) {
                console.log(`${waitingPlayer.username} joue contre ${username} !`);
                socket.emit("found", waitingPlayer.username);
                socket.to(waitingPlayer.id).emit("found", username);

                waitingPlayer.id = undefined;
                waitingPlayer.username = undefined;
            }

            // Pas encore d'adversaire
            else {
                waitingPlayer.id = socket.id;
                waitingPlayer.username = username;
            }
        }
        
    });

    // Annulation de la recherche
    socket.on("cancel", (username) => {
        if (socket.handshake.session.username == waitingPlayer.username && waitingPlayer.username == username) {
            console.log(`${username} annule sa recherche`);
            waitingPlayer.id = undefined;
            waitingPlayer.username = undefined;
        }
    });

    // Déconnexion
    socket.on("disconnect", () => {
        if (socket.handshake.session.username == waitingPlayer.username) {
            console.log(`${waitingPlayer.username} s'est deconnecté`);
            waitingPlayer.id = undefined;
            waitingPlayer.username = undefined;
        }
    });

}