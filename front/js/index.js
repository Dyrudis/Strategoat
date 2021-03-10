// Connexion avec le serveur
let socket = io();

// Variables liées à la session
let session = {
    username: undefined
}

// Liste des joueurs qui attendent une réponse à leur invitation
let invites = [];

let usernameP = document.getElementById("username");
let playerList = document.getElementById("playerList");
let foundDiv = document.getElementById("found");

// On dit au serveur que la page d'accueil est chargée
socket.emit("load home");

// Le serveur nous renvoie les informations correspondantes
socket.on("load home", username => {
    // On récupére les informations de session envoyées par le serveur
    session.username = username;

    // Affichage du nom de l'utilisateur sur la page
    usernameP.innerHTML = session.username;
});

// Lorsqu'un joueur se connecte ou se déconnecte
socket.on("refresh players", players => {
    playerList.innerHTML = "<p>Joueurs connectés (clique sur un joueur pour lui envoyer une invitation):</p>";
    players.forEach(player => {
        // On affiche le nom de tous les joueurs connectés sauf l'utilisateur
        if (player.username != session.username) {
            let li = document.createElement("li");
            li.innerHTML = player.username;

            // Envoie une invation au joueur sur lequel l'utilisateur clique
            li.addEventListener("click", () => {
                socket.emit("send invite", player.username);
            });

            playerList.appendChild(li);
        }
    });
});

// Lorsque l'utilisateur reçoit une invitation
socket.on("get invite", player => {
    // On n'affiche l'invitation que si elle n'est pas déjà présente (pas de double invitation provenant du même joueur)
    if (!invites.some(name => name == player)) {
        // Ajout à la liste des invitations en attente
        invites.push(player);

        // Création d'un élément de la page correspondant à une invitation
        let invitation = document.createElement("div");
        invitation.innerHTML = `<p>${player} veut jouer contre vous !</p>`;

        // Bouton pour accepter l'invitation
        let accept = document.createElement("button");
        accept.innerHTML = "Accepter";
        accept.addEventListener("click", () => {
            socket.emit("start game", player, session.username);
            invites = invites.filter(name => name != player);
            accept.parentElement.remove();
        });
        invitation.appendChild(accept);

        // Bouton pour décliner l'invitation
        let decline = document.createElement("button");
        decline.innerHTML = "Refuser";
        decline.addEventListener("click", () => {
            socket.emit("decline", player, session.username);
            invites = invites.filter(name => name != player);
            decline.parentElement.remove();
        });
        invitation.appendChild(decline);

        invitation.style.backgroundColor = "gray";
        document.body.appendChild(invitation);
    }
});

// Partie trouvée
socket.on("found", opponentName => {
    foundDiv.style.display = "block";
    document.querySelector("#found h3").innerHTML = `Adversaire : ${opponentName} !`;
    socket.emit("add session variable", "game", "oui");
    setTimeout(() => window.location.href = "/", 3000);
});
