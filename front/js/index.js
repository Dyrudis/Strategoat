// Protection des variables/fonctions
(function () {

    // Connexion avec le serveur
    let socket = io();

    // Nom de l'utilisateur actuel (récupéré depuis le serveur)
    let username;

    // Liste des joueurs qui attendent une réponse à leur invitation
    let invites = [];

    // On dit au serveur que la page d'accueil est chargée
    socket.emit("load home");

    // Le serveur nous renvoie les informations correspondantes
    socket.on("load home", (name) => {
        // On récupére les informations de session envoyées par le serveur
        username = name;
    });

    // Lorsqu'un joueur se connecte ou se déconnecte
    socket.on("refresh players", users => {
        document.getElementById("playerList").innerHTML = "";
        users.forEach((player) => {
            if (player.username != username) {
                // Ajour d'une ligne au tableau
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
            else {
                // Affichage du nom de l'utilisateur sur la page
                document.getElementById("username").innerHTML = player.username;
                document.getElementById("elo").innerHTML = "Elo : " + player.elo;
                document.getElementById("gamePlayed").innerHTML = "Parties jouées : " + player.gamePlayed;
                if (player.gamePlayed == 0) {
                    document.getElementById("winRate").innerHTML = "Winrate : Pas de donnée";
                }
                else {
                    document.getElementById("winRate").innerHTML = "Winrate : " + Math.round(player.gameWon / player.gamePlayed * 100) + "%";
                }
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
                socket.emit("start game", player, username);
                invites = invites.filter(name => name != player);
                accept.parentElement.remove();
            });
            invitation.appendChild(accept);

            // Bouton pour décliner l'invitation
            let decline = document.createElement("button");
            decline.innerHTML = "Refuser";
            decline.addEventListener("click", () => {
                socket.emit("decline", player, username);
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
        document.getElementById("found").style.display = "block";
        document.querySelector("#found h3").innerHTML = `Adversaire : ${opponentName} !`;
        socket.emit("session variable", "game", "oui");
        setTimeout(() => window.location.href = "/", 3000);
    });

})()