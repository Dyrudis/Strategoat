// Connexion avec le serveur
let socket = io();
socket.emit("load game");

/*---------------------*\
|   Variables locales   |
\*---------------------*/
let tab = Array(10).fill().map(() => Array(4).fill(0));
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

let ready = false;

/*----------------------------------*\
|   Création de la liste des pions   |
\*----------------------------------*/
function addToList(value, name, divId) {
    let div = document.createElement("div");
    div.setAttribute("draggable", true);
    div.setAttribute("ondragstart", "dragstart(event)");
    div.setAttribute("data-pion", value);
    div.classList.add("pion");
    div.innerHTML = name;

    let span = document.createElement("span");
    span.classList.add("count");
    div.appendChild(span);

    document.getElementById(divId).appendChild(div);
}

/*------------------------------*\
|   Création du tableau de jeu   |
\*------------------------------*/
for (let y = 9; y >= 0; y--) {
    let tr = document.createElement("tr");
    for (let x = 0; x < 10; x++) {
        let td = document.createElement("td");
        td.classList.add("case");
        td.setAttribute("data-row", y);
        td.setAttribute("data-column", x);
        td.setAttribute("data-pion", 0);
        td.setAttribute("ondrop", "drop(event)");
        td.setAttribute("ondragover", "dragover(event)");
        if ([2, 3, 6, 7].includes(x) && [4, 5].includes(y)) {
            td.setAttribute("data-pion", null);
            td.removeAttribute("ondrop");
            td.removeAttribute("ondragover");
        }
        tr.appendChild(td);
    }
    document.getElementById("stratego").appendChild(tr);
}

// Actualise la liste des pions restants
function displayPionCount(pionCount) {
    if (Array.isArray(pionCount)) {
        for (const key in pionCount[0]) {
            const count = pionCount[0][key];
            document.querySelector("div[data-pion=\"" + key + "\"] span.count").innerHTML = count;
        }

        for (const key in pionCount[1]) {
            const count = pionCount[1][key];
            document.querySelector("div[data-pion=\"&" + key + "\"] span.count").innerHTML = count;
        }
    }

    else {
        for (const key in pionCount) {
            const count = pionCount[key];
            document.querySelector("div[data-pion=\"" + key + "\"] span.count").innerHTML = count;
        }
    }
}

// Actualise le tableau de jeu
function displayTab(tab) {
    for (let x = 0; x < tab.length; x++) {
        for (let y = 0; y < tab[0].length; y++) {
            let td = document.querySelector("[data-column=\"" + x + "\"][data-row=\"" + y + "\"]");
            td.setAttribute("data-pion", tab[x][y]);

            // Case pion possédé
            if (tab[x][y] != undefined && tab[x][y] != -1 && tab[x][y] != 0) {
                td.setAttribute("draggable", true);
                td.setAttribute("ondragstart", "dragstart(event)");
                td.innerHTML = (tab[x][y][0] == "&" ? tab[x][y].toString().split("&")[1] : tab[x][y]);
                if (ready) {
                    td.removeAttribute("ondragover")
                    td.removeAttribute("ondrop");
                }
                else {
                    td.setAttribute("ondragover", "dragover(event)");
                    td.setAttribute("ondrop", "drop(event)");
                }
            }

            // Case vide ou pion adverse
            else if (tab[x][y] == 0 || tab[x][y] == -1) {
                td.removeAttribute("draggable");
                td.removeAttribute("ondragstart");
                td.innerHTML = "";
                td.setAttribute("ondragover", "dragover(event)");
                td.setAttribute("ondrop", "dropGame(event)");
            }

            // Case lac (aucune intéraction possible)
            else {
                td.innerHTML = "";
                td.removeAttribute("draggable");
                td.removeAttribute("ondragstart");
                td.removeAttribute("ondragover");
                td.removeAttribute("ondrop");
            }
        }
    }
}

function isPlacementFinished() {
    for (const key in pionCount) {
        if (pionCount[key] != 0)
            return false;
    }
    return true;
}

// Permet l'affichage d'un message dans le tchat
function sendToChat(message, color = "white") {
    let date = new Date();
    let li = document.createElement("li");
    li.innerHTML = "<span style='color:grey'>[" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "]</span> " + message;
    li.style.color = color;
    let messages = document.getElementById("messages");
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
}

// Commande /autofill (disponible uniquement avant le début de la partie) :
function autoFill() {
    if (ready) {
        sendToChat("Impossible actuellement.", "red");
        return
    }
    tab = [
        [11, 4, 11, 12, 0, 0, 0, 0, 0, 0],
        [2, 3, 4, 10, 0, 0, 0, 0, 0, 0],
        [2, 3, 7, 9, null, null, 0, 0, 0, 0],
        [5, 6, 11, 8, null, null, 0, 0, 0, 0],
        [2, 4, 2, 7, 0, 0, 0, 0, 0, 0],
        [11, 3, 2, 6, 0, 0, 0, 0, 0, 0],
        [5, 6, 11, 5, null, null, 0, 0, 0, 0],
        [6, 7, 8, 4, null, null, 0, 0, 0, 0],
        [2, 3, 1, 3, 0, 0, 0, 0, 0, 0],
        [11, 5, 2, 2, 0, 0, 0, 0, 0, 0]
    ]

    for (const key in pionCount) {
        pionCount[key] = 0;
    }

    // Affichage client
    displayTab(tab);
    displayPionCount(pionCount);

    document.getElementById("ready").disabled = false;
}

// Commande /number
function toggleNumber() {
    td = document.querySelectorAll("#stratego td");
    if (td[0].style.color == "") {
        sendToChat("Valeurs affichées.", "green");
        td.forEach(elem => {
            if (!elem.getAttribute("data-pion").includes("11") && !elem.getAttribute("data-pion").includes("12")) {
                elem.style.color = "white";
                elem.style.webkitTextStroke = "2px black";
            }
        });
    }
    else {
        sendToChat("Valeurs cachées.", "green");
        td.forEach(elem => {
            if (!elem.getAttribute("data-pion").includes("11") && !elem.getAttribute("data-pion").includes("12")) {
                elem.style.color = "";
                elem.style.webkitTextStroke = "0";
            }
        });
    }
}

// Envoie d'un message dans le tchat
document.getElementById("chatForm").addEventListener("submit", e => {
    e.preventDefault();
    let message = document.getElementById("message");

    if (message.value[0] == "/") {
        let command = message.value.substring(1);
        switch (command) {
            case "autofill":
                autoFill();
                break;
            case "number":
                toggleNumber();
                break;
            case "help":
                sendToChat("Liste des commandes :<br/>/autofill : remplissage automatique du tableau<br/>/ff : abandon<br/>/number : affiche/enleve les valeurs des pions<br/>/help : demander de l'aide");
                break;
            default:
                sendToChat("Commande inconnue.");
                break;
        }
    }
    else if (message.value) {
        socket.emit("message", message.value);
    }
    message.value = "";
});

// Clique sur le bouton "Prêt"
document.getElementById("ready").addEventListener("click", e => {
    if (ready) {
        socket.emit("not ready");
    }
    else {
        socket.emit("ready", tab);
    }
});

/*-------------------------------------*\
|   Gestion des évènements du serveur   |
\*-------------------------------------*/
socket.on("message", (message, color, name) => {
    if (name) {
        message = name + " : " + message;
    }
    sendToChat(message, color);
});

socket.on("civ", (ownCiv, opponentCiv) => {
    let style = document.createElement('style');
    document.head.appendChild(style);

    let css = "";
    for (let i = 1; i <= 12; i++) {
        css += `[data-pion="${i}"] {background-image:url("../ressources/image/${ownCiv}/${i}.png"); background-color:#2B3A98;}`
    }
    for (let i = 1; i <= 12; i++) {
        css += `[data-pion="&${i}"] {background-image:url("../ressources/image/${opponentCiv}/${i}.png"); background-color:#BE3441;}`
    }

    style.appendChild(document.createTextNode(css));


    const ownNames = namesList[ownCiv],
        opponentNames = namesList[opponentCiv];
    addToList(12, ownNames[12], "self");
    addToList("&12", opponentNames[12], "opponent");
    for (let i = 10; i > 0; i--) {
        addToList(i, ownNames[i], "self");
        addToList(`&${i}`, opponentNames[i], "opponent");
    }
    addToList(11, ownNames[11], "self");
    addToList("&11", opponentNames[11], "opponent");

    displayPionCount(pionCount);
});

socket.on("ready", () => {
    ready = true;
    document.getElementById("ready").innerHTML = "Pas prêt";
    displayTab(tab);
    sendToChat("Vous êtes prêt.", "green");
});

socket.on("not ready", () => {
    ready = false;
    document.getElementById("ready").innerHTML = "Prêt";
    displayTab(tab);
    sendToChat("Vous n'êtes plus prêt.", "green");
});

// Début de la partie
socket.on("start", (tab, pionCount) => {
    sendToChat("Les deux joueurs sont prêts, la partie va commencer...", "green");
    displayPionCount(pionCount);
    displayTab(tab);

    document.getElementById("ready").remove();
    [...document.getElementById("self").children].forEach(child => {
        child.removeAttribute("draggable");
        child.removeAttribute("ondragstart");
    });
    [...document.getElementById("opponent").children].forEach(child => {
        child.removeAttribute("draggable");
        child.removeAttribute("ondragstart");
    });
    document.getElementById("opponent").style.display = "flex";
    document.getElementById("pions").style.flexDirection = "row";
});

// Mise à jour du plateau de jeu et de la liste des pions restants
socket.on("update tab", (tab, pionCount) => {
    displayTab(tab);
    displayPionCount(pionCount);
});

// Après un reload de la page, on récupère les informations de la partie
socket.on("reload tab", (tab, pionCount) => {
    ready = true;
    document.getElementById("ready").remove();
    [...document.getElementById("self").children].forEach(child => {
        child.removeAttribute("draggable");
        child.removeAttribute("ondragstart");
    });
    [...document.getElementById("opponent").children].forEach(child => {
        child.removeAttribute("draggable");
        child.removeAttribute("ondragstart");
    });
    document.getElementById("opponent").style.display = "flex";
    document.getElementById("pions").style.flexDirection = "row";
    displayTab(tab);
    displayPionCount(pionCount);
});

socket.on("vs", (civ1, id1, civ2, id2) => {
    let message = "<span style='color:#2B3A98'>" + namesList[civ1][id1] + "</span> VS <span style='color:#BE3441'>" + namesList[civ2][id2] + "</span>";
    let date = new Date();
    let li = document.createElement("li");
    li.innerHTML = "<span style='color:grey'>[" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "]</span> " + message;
    li.style.color = "orange";
    let messages = document.getElementById("messages");
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
});

// Fin de la partie
socket.on("end", (tab, pionCount) => {
    displayTab(tab);
    displayPionCount(pionCount);

    socket.emit("session variable", "game", undefined);

    setTimeout(function () { document.location.reload(); }, 5000);
});

/*---------------------------*\
|   Fonctions drag and drop   |
\*---------------------------*/
function dragstart(e) {
    e.dataTransfer.setData("text/plain", e.target.getAttribute("data-pion") + ":" + e.target.getAttribute("data-column") + ":" + e.target.getAttribute("data-row"));
}

function dragover(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("text/plain").split(":");
    let pion = data[0], x = data[1], y = data[2];

    // Déplacement d'un pion existant
    if (x != "null" && y != "null") {
        // previous : emplacement précédent
        // next : nouvel emplacement
        let previous = document.querySelector("[data-row=\"" + y + "\"][data-column=\"" + x + "\"]");
        let next = e.target;

        // Swap entre deux pions
        if (next.getAttribute("data-pion") > 0) {
            previous.setAttribute("data-pion", next.getAttribute("data-pion"));

            next.setAttribute("data-pion", pion);

            let tmp = tab[next.getAttribute("data-column")][next.getAttribute("data-row")];
            tab[next.getAttribute("data-column")][next.getAttribute("data-row")] = tab[previous.getAttribute("data-column")][previous.getAttribute("data-row")];
            tab[previous.getAttribute("data-column")][previous.getAttribute("data-row")] = tmp;
        }

        // Déplacement vers une case vide
        else if (e.target.getAttribute("data-row") < 4) {
            previous.setAttribute("data-pion", 0);
            previous.removeAttribute("draggable");
            previous.removeAttribute("ondragstart");

            next.setAttribute("data-pion", pion);
            next.setAttribute("draggable", true);
            next.setAttribute("ondragstart", "dragstart(event)");

            tab[previous.getAttribute("data-column")][previous.getAttribute("data-row")] = 0;
            tab[next.getAttribute("data-column")][next.getAttribute("data-row")] = parseInt(pion);
        }
        else {
            sendToChat("Vous ne pouvez pas déplacer une unité en dehors de votre base.", "red");
        }
    }

    // Ajout d'un pion sur le plateau
    else if (e.target.getAttribute("data-pion") == 0) {
        if (pionCount[pion] > 0) {
            if (e.target.getAttribute("data-row") < 4) {
                e.target.setAttribute("data-pion", pion);
                e.target.setAttribute("draggable", true);
                e.target.setAttribute("ondragstart", "dragstart(event)");

                tab[e.target.getAttribute("data-column")][e.target.getAttribute("data-row")] = parseInt(pion);
                pionCount[pion]--;
            }
            else {
                sendToChat("Vous ne pouvez pas déployer une unité en dehors de votre base.", "red");
            }
        }
        else {
            sendToChat("Vous n'avez plus ces unités en réserve.", "red");
        }
    }
    else {
        sendToChat("Vous ne pouvez pas écraser une unité existante.", "red");
    }

    displayPionCount(pionCount);

    if (isPlacementFinished()) {
        if (document.getElementById("ready"))
            document.getElementById("ready").disabled = false;
    }
    else {
        if (document.getElementById("ready"))
            document.getElementById("ready").disabled = true;
    }
}

function dropGame(e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("text/plain").split(":");
    let x = data[1];
    let y = data[2];
    let x2 = e.target.getAttribute("data-column");
    let y2 = e.target.getAttribute("data-row");
    socket.emit("play", x, y, x2, y2);
}