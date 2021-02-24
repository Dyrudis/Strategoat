let socket = io();

let searchButton = document.getElementById("search");
let username = document.getElementById("username");
let cancelButton = document.getElementById("cancel");
let foundDiv = document.getElementById("found");

// Début de la recherche
searchButton.addEventListener("click", event => {
    searchButton.style.display = "none";
    cancelButton.style.display = "block";
    socket.emit("search", username.innerHTML);
})

// Arrêt de la recherche
cancelButton.addEventListener("click", event => {
    cancelButton.style.display = "none";
    searchButton.style.display = "block";
    socket.emit("cancel", username.innerHTML);
});

// Affichage du nom de l'utilisateur au chargmenent de la page
socket.on("load", name => {
    username.innerHTML = name;
});

// Partie trouvée
socket.on("found", opponentName => {
    cancelButton.style.display = "none";
    foundDiv.style.display = "block";
    document.querySelector("#found h3").innerHTML = `Adversaire : ${opponentName} !`;
});
