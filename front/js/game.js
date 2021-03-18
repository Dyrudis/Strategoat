// Connexion avec le serveur
let socket = io();
socket.emit("load game");

// Création de la liste
const names = namesList["default"];
addToList(12, names[12]);
for (let i = 10; i > 0; i--) {
    addToList(i, names[i]);
}
addToList(11, names[11]);

function addToList(value, name) {
    let div = document.createElement("div");
    div.setAttribute("draggable", true);
    div.setAttribute("ondragstart", "dragstart(event)");
    div.setAttribute("data-pion", value);
    div.classList.add("pion");
    div.innerHTML = name;

    let span = document.createElement("span");
    span.classList.add("count");
    div.appendChild(span);

    document.getElementById("pions").appendChild(div);
}

// Création du tableau
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
            td.setAttribute("data-pion", undefined);
            td.removeAttribute("ondrop");
            td.removeAttribute("ondragover");
        }
        tr.appendChild(td);
    }
    document.getElementById("stratego").appendChild(tr);
}

let tab = Array(10).fill().map(() => Array(4).fill(0));
let ready = false;
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
}

function autoFill() {
    tab = [
        [11, 4, 11, 12],
        [2, 3, 4, 10],
        [2, 3, 7, 9],
        [5, 6, 11, 8],
        [2, 4, 2, 7],
        [11, 3, 2, 6],
        [5, 6, 11, 5],
        [6, 7, 8, 4],
        [2, 3, 1, 3],
        [11, 5, 2, 2]
    ]

    for (const key in pionCount) {
        pionCount[key] = 0;
    }
    // Affichage client
    displayTab(tab);
    displayPionCount();

    document.getElementById("ready").disabled = false;
}

function displayPionCount() {
    for (const key in pionCount) {
        const count = pionCount[key];
        document.querySelector("div[data-pion=\"" + key + "\"] span.count").innerHTML = "\ : " + count;
    }
}

displayPionCount();

// Drag and Drop
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

    displayPionCount();

    if (isPlacementFinished()) {
        document.getElementById("ready").disabled = false;
    }
    else {
        document.getElementById("ready").disabled = true;
    }
}

function sendToChat(message, color = "black") {
    let li = document.createElement("li");
    li.innerHTML = message;
    li.style.color = color;
    document.getElementById("messages").appendChild(li);
}

function isPlacementFinished() {
    return !Object.values(pionCount).some(elem => elem != 0);
}

function displayTab(tab) {
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 4; y++) {
            let td = document.querySelector("[data-column=\"" + x + "\"][data-row=\"" + y + "\"]");
            td.setAttribute("data-pion", tab[x][y]);
            td.setAttribute("draggable", true);
            td.setAttribute("ondragstart", "dragstart(event)");
        }
    }
}

document.getElementById("ready").addEventListener("click", e => {
    if (ready) {
        socket.emit("not ready");
    }
    else {
        socket.emit("ready", tab);
    }
});

document.getElementById("chatForm").addEventListener("submit", e => {
    e.preventDefault();
    let message = document.getElementById("message");

    if (message.value[0] == "/") {
        let command = message.value.substring(1);
        switch (command) {
            case "ff":
                sendToChat("Vous avez abandonné la partie.");
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

socket.on("message", (message, color, name) => {
    if (name) {
        message = name + " : " + message;
    }
    sendToChat(message, color);
});

socket.on("ready", () => {
    ready = true;
    document.getElementById("ready").innerHTML = "Pas prêt";
    sendToChat("Vous êtes prêt.", "green");
});

socket.on("not ready", () => {
    ready = false;
    document.getElementById("ready").innerHTML = "Prêt";
    sendToChat("Vous n'êtes plus prêt.", "green");
});

// Fin de la phase de préparation
socket.on("start", (tab) => {
    pionCount = {
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
    }
    displayPionCount();


    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            let td = document.querySelector("[data-column=\"" + x + "\"][data-row=\"" + y + "\"]");
            td.setAttribute("data-pion", tab[x][y]);
            td.removeAttribute("draggable");
            td.removeAttribute("ondragstart");
        }
    }

    document.getElementById("ready").remove();
});