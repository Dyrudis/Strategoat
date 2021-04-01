// Connexion avec le serveur
let socket = io();

// Variables liées à la session
let session = {
    username: undefined,
    gamePlayed: undefined,
    gameWon: undefined,
    elo: undefined,
}

let connectedPlayers = [];

// Liste des joueurs qui attendent une réponse à leur invitation
let invites = [];

let playerList = document.getElementById("playerList");
let foundDiv = document.getElementById("found");

// On dit au serveur que la page d'accueil est chargée
socket.emit("load home");

// Le serveur nous renvoie les informations correspondantes
socket.on("load home", (username, gamePlayed, gameWon, elo) => {
    // On récupére les informations de session envoyées par le serveur
    session.username = username;
    session.gamePlayed = gamePlayed;
    session.gameWon = gameWon;
    session.elo = elo;

    // Affichage du nom de l'utilisateur sur la page
    document.getElementById("username").innerHTML = session.username;
    document.getElementById("elo").innerHTML = "Elo : " + elo;
    document.getElementById("gamePlayed").innerHTML = "Parties jouées : " + gamePlayed;
    if (gamePlayed == 0) {
        document.getElementById("winRate").innerHTML = "Winrate : Pas de donnée";
    }
    else {
        document.getElementById("winRate").innerHTML = "Winrate : " + Math.round(gameWon / gamePlayed * 100) + "%";
    }
});

// Lorsqu'un joueur se connecte ou se déconnecte
socket.on("refresh players", users => {
    displayPlayers(users);
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
    socket.emit("session variable", "game", "oui");
    setTimeout(() => window.location.href = "/", 3000);
});

function displayPlayers(tab) {
    document.getElementById("playerList").innerHTML = "";
    tab.forEach((player) => {
        if (player.username != session.username) {
            let tr = document.createElement("tr");

            let td = document.createElement("td");
            td.innerHTML = player.username;
            tr.appendChild(td);

            td = document.createElement("td");
            button = document.createElement("button");
            button.onclick = () => { socket.emit("send invite", player.username) };
            button.innerHTML = player.status;
            if (player.status != "Online") {
                button.setAttribute("disabled", true);
            }
            td.appendChild(button);
            tr.appendChild(td);

            td = document.createElement("td")
            td.innerHTML = player.elo;
            tr.appendChild(td);

            td = document.createElement("td")
            td.innerHTML = player.gamePlayed;
            tr.appendChild(td);

            td = document.createElement("td")
            td.innerHTML = player.gameWon;
            tr.appendChild(td);

            document.getElementById("playerList").append(tr);
        }
    });
}
