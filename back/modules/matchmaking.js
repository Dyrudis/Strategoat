module.exports = {
    matchmaking(io) {
        let waitingPlayer = {
            "id": undefined,
            "pseudo": undefined
        }

        io.on("connection", (socket) => {

            // Recherche d'adversaire
            socket.on("search", pseudo => {
                console.log(`${pseudo} (${socket.id}) cherche un adversaire`);

                // Un adversaire est déjà disponible
                if (waitingPlayer.id) {
                    console.log(`${waitingPlayer.pseudo} joue contre ${pseudo} !`);
                    socket.emit("found", waitingPlayer.pseudo);
                    socket.to(waitingPlayer.id).emit("found", pseudo);
                }

                // Pas encore d'adversaire
                else {
                    waitingPlayer.id = socket.id;
                    waitingPlayer.pseudo = pseudo;
                }
            });

            // Annulation de la recherche
            socket.on("cancel", () => {
                if (waitingPlayer.id == socket.id) {
                    console.log(`${waitingPlayer.pseudo} (${socket.id}) annule sa recherche`);
                    waitingPlayer.id = undefined;
                    waitingPlayer.pseudo = undefined;
                }
            });

            // Déconnexion
            socket.on("disconnect", () => {
                if (waitingPlayer.id == socket.id) {
                    console.log(`${waitingPlayer.pseudo} (${socket.id}) s'est deconnecté`);
                    waitingPlayer.id = undefined;
                    waitingPlayer.pseudo = undefined;
                }
            });
        });
    }
}
