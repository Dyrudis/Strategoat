module.exports = (io, socket, waitingPlayer) => {

    // Recherche d'adversaire
    socket.on("search", () => {

        let username = socket.handshake.session.username;
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

    });

    // Annulation de la recherche
    socket.on("cancel", () => {

        let username = socket.handshake.session.username;

        if (waitingPlayer.username && username == waitingPlayer.username) {
            console.log(`${username} annule sa recherche`);
            waitingPlayer.id = undefined;
            waitingPlayer.username = undefined;
        }
    });

    // Déconnexion
    socket.on("disconnect", () => {
        
        let username = socket.handshake.session.username;

        if (waitingPlayer.username && waitingPlayer.username == username) {
            console.log(`${username} s'est deconnecté`);
            waitingPlayer.id = undefined;
            waitingPlayer.username = undefined;
        }
    });

}