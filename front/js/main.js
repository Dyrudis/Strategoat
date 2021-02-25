let socket = io();

let searchButton = document.getElementById("search");
let usernameP = document.getElementById("username");
let cancelButton = document.getElementById("cancel");
let foundDiv = document.getElementById("found");

let session = {
    username: undefined
}

// Début de la recherche
searchButton.addEventListener("click", event => {
    searchButton.style.display = "none";
    cancelButton.style.display = "block";
    socket.emit("search");
})

// Arrêt de la recherche
cancelButton.addEventListener("click", event => {
    cancelButton.style.display = "none";
    searchButton.style.display = "block";
    socket.emit("cancel");
});

socket.on("load", username => {
    // On récupére les informations de session au chargement de la page
    session.username = username;

    // Affichage du nom de l'utilisateur
    usernameP.innerHTML = session.username;
});

// Partie trouvée
socket.on("found", opponentName => {
    cancelButton.style.display = "none";
    foundDiv.style.display = "block";
    document.querySelector("#found h3").innerHTML = `Adversaire : ${opponentName} !`;
});
