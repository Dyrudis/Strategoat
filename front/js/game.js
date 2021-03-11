// Connexion avec le serveur
let socket = io();
socket.emit("load game");

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

pionCount = {
    "12": 1,
    "11": 1,
    "10": 2,
    "9": 3,
    "8": 4,
    "7": 4,
    "6": 4,
    "5": 5,
    "4": 8,
    "3": 1,
    "2": 6,
    "1": 1,
};

function displayPionCount() {
    for (const key in pionCount) {
        document.querySelector("ul li[data-pion=\"" + key + "\"] span.count").innerHTML = ":" + pionCount[key];
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
        }

        // Déplacement vers une case vide
        else {
            previous.setAttribute("data-pion", 0);
            previous.innerHTML = "";
            previous.removeAttribute("draggable");
            previous.removeAttribute("ondragstart");

            next.setAttribute("data-pion", pion);
            next.innerHTML = pion;
            next.setAttribute("draggable", true);
            next.setAttribute("ondragstart", "dragstart(event)");
        }

    }

    // Ajout d'un pion sur le plateau
    else if (e.target.getAttribute("data-pion") == 0 && pionCount[pion] > 0) {
        e.target.setAttribute("data-pion", pion);
        e.target.innerHTML = pion;
        e.target.setAttribute("draggable", true);
        e.target.setAttribute("ondragstart", "dragstart(event)");

        pionCount[pion]--;
    }

    displayPionCount();
}