// Connexion avec le serveur
let socket = io();

socket.emit("load game");

document.getElementById("title").addEventListener("click", event => {
    socket.emit("click");
});

socket.on("click", username => {
    let p = document.createElement("p");
    p.innerHTML = `${username} à cliqué sur la page !`;
    p.style.backgroundColor = getRandomColor();
    document.body.appendChild(p);
})

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

let selected = undefined;
let pions = document.querySelectorAll(".pion");

pions.forEach(pion => {
    pion.addEventListener("click", () => {
        pions.forEach(pion => pion.classList.remove("selected"));
        if (pion.getAttribute("data-pion") != selected) {
            pion.classList.add("selected");
            selected = pion.getAttribute("data-pion");
            console.log("Selectionné : " + selected);
        }
        else {
            selected = undefined;
            console.log("Deselection");
        }
    });
});

let cases = document.querySelectorAll(".case");

cases.forEach(td => {
    td.addEventListener("click", () => {
        let x = td.getAttribute("data-column"), y = td.getAttribute("data-row");
        console.log(selected + " en (" + x + ", " + y + ")");
    })
});