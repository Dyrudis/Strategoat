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
    let li = document.createElement("li");
    li.setAttribute("draggable", true);
    li.setAttribute("ondragstart", "dragstart(event)");
    li.setAttribute("data-pion", value);
    li.classList.add("pion");
    li.innerHTML = name;

    let span = document.createElement("span");
    span.classList.add("count");
    li.appendChild(span);

    document.getElementById("pions").appendChild(li);
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

let tab = Array(4).fill().map(() => Array(10).fill(0));
let ready = false;
const pionCount = {
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

function displayPionCount() {
    for (const key in pionCount) {
        const count = pionCount[key];
        document.querySelector("li[data-pion=\"" + key + "\"] span.count").innerHTML = "\ : " + count;
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
            previous.innerHTML = next.innerHTML;

            next.setAttribute("data-pion", pion);
            next.innerHTML = pion;

            let tmp = tab[3 - next.getAttribute("data-row")][next.getAttribute("data-column")];
            tab[3 - next.getAttribute("data-row")][next.getAttribute("data-column")] = tab[3 - previous.getAttribute("data-row")][previous.getAttribute("data-column")];
            tab[3 - previous.getAttribute("data-row")][previous.getAttribute("data-column")] = tmp;
        }

        // Déplacement vers une case vide
        else if (e.target.getAttribute("data-row") < 4) {
            previous.setAttribute("data-pion", 0);
            previous.innerHTML = "";
            previous.removeAttribute("draggable");
            previous.removeAttribute("ondragstart");

            next.setAttribute("data-pion", pion);
            next.innerHTML = pion;
            next.setAttribute("draggable", true);
            next.setAttribute("ondragstart", "dragstart(event)");

            tab[3 - previous.getAttribute("data-row")][previous.getAttribute("data-column")] = 0;
            tab[3 - next.getAttribute("data-row")][next.getAttribute("data-column")] = parseInt(pion);
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
                e.target.innerHTML = pion;
                e.target.setAttribute("draggable", true);
                e.target.setAttribute("ondragstart", "dragstart(event)");

                tab[3 - e.target.getAttribute("data-row")][e.target.getAttribute("data-column")] = parseInt(pion);
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

document.getElementById("ready").addEventListener("click", e => {
    ready = !ready;
    if (ready) {
        e.target.innerHTML = "Pas prêt";
        sendToChat("Vous êtes prêt.", "green");
    }
    else {
        e.target.innerHTML = "Prêt";
        sendToChat("Vous n'êtes plus prêt.", "green");
    }


    socket.emit("ready", tab);
});

document.getElementById("chatForm").addEventListener("submit", e => {
    e.preventDefault();
    let message = document.getElementById("message");
    if (message.value) {
        sendToChat("You : " + message.value);
        socket.emit("message", message.value);
    }
    message.value = "";
})

socket.on("message", (message, name) => {
    sendToChat(name + " : " + message);
});