// Protection des variables/fonctions
(function () {

    // Connexion avec le serveur
    let socket = io();

    // Nom de l'utilisateur actuel (récupéré depuis le serveur)
    let username;
    let elo;

    // Liste des joueurs qui attendent une réponse à leur invitation
    let invites = [];

    // On dit au serveur que la page d'accueil est chargée
    socket.emit("load home");

    // Le serveur nous renvoie les informations correspondantes
    socket.on("load home", (name) => {
        // On récupére les informations de session envoyées par le serveur
        username = name;
    });

    function civilization(elo) {
        if (elo >= 1050) {
            document.getElementById("greek").removeAttribute("disabled");
            if (elo >= 1100) {
                document.getElementById("egypt").removeAttribute("disabled");
                if (elo >= 1250) {
                    document.getElementById("nordic").removeAttribute("disabled");
                }
            }
        }
    }

    // Fonction de tri du tableau des joueurs
    function tri(a, b) {
        if (a.status == b.status) {
            return b.elo - a.elo;
        }
        else if (a.status == "Online" || b.status == "Offline") {
            return -1;
        }
        else if (b.status == "Online" || a.status == "Offline") {
            return 1;
        }
    }

    // Lorsqu'un joueur se connecte ou se déconnecte
    socket.on("refresh players", users => {
        document.getElementById("playerList").innerHTML = "";

        users.sort(tri);

        users.forEach((player) => {
            if (player.username != username) {
                // Ajour d'une ligne au tableau
                let tr = document.createElement("tr");

                let td = document.createElement("td");
                let button = document.createElement("button");
                button.innerHTML = player.status;
                if (player.status == "Online") {
                    button.style.backgroundColor = "#2E7D32";
                    button.onclick = () => { socket.emit("send invite", player.username) };
                    button.style.cursor = "pointer";
                }
                else if (player.status == "In game") {
                    button.style.backgroundColor = "#F9A825";
                }
                else if (player.status == "Offline") {
                    button.style.backgroundColor = "#C62828";
                }
                button.style.width = "65px";
                button.style.color = "white";
                button.style.border = "none";
                td.appendChild(button);
                tr.appendChild(td);
                
                td = document.createElement("td");
                td.innerHTML = player.username;
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
                elo = player.elo;
                document.getElementById("gamePlayed").innerHTML = "Parties jouées : " + player.gamePlayed;
                if (player.gamePlayed == 0) {
                    document.getElementById("winRate").innerHTML = "Winrate : Aucun";
                }
                else {
                    document.getElementById("winRate").innerHTML = "Winrate : " + Math.round(player.gameWon / player.gamePlayed * 100) + "%";
                }
            }
        });

        civilization(elo);
    });

    // Lorsque l'utilisateur reçoit une invitation
    socket.on("get invite", player => {
        // On n'affiche l'invitation que si elle n'est pas déjà présente (pas de double invitation provenant du même joueur)
        if (!invites.some(name => name == player)) {
            // Ajout à la liste des invitations en attente
            invites.push(player);

            // Création d'un élément de la page correspondant à une invitation
            let invitation = document.createElement("div");
            invitation.setAttribute("class", "invitation");
            invitation.innerHTML = `<p>${player} vous a envoyé une invitation</p>`;

            // Bouton pour accepter l'invitation
            let accept = document.createElement("button");
            accept.setAttribute("class", "accept");
            accept.innerHTML = "Accepter";
            accept.addEventListener("click", () => {
                socket.emit("start game", player, username);
                invites = invites.filter(name => name != player);
                accept.parentElement.remove();
            });
            invitation.appendChild(accept);

            // Bouton pour décliner l'invitation
            let decline = document.createElement("button");
            decline.setAttribute("class", "decline");
            decline.innerHTML = "Refuser";
            decline.addEventListener("click", () => {
                socket.emit("decline", player, username);
                invites = invites.filter(name => name != player);
                decline.parentElement.remove();
            });
            invitation.appendChild(decline);

            document.getElementById("invitations").appendChild(invitation);
        }
    });

    // Partie trouvée
    socket.on("found", opponentName => {
        document.getElementById("found").style.display = "block";
        document.querySelector("#found h3").innerHTML = `Adversaire : ${opponentName} !`;
        socket.emit("session variable", "game", "oui");
        setTimeout(() => window.location.href = "/", 3000);
    });

    document.getElementById("civ").addEventListener("change", e => {
        socket.emit("civ", username, e.target.value);
    });

})()