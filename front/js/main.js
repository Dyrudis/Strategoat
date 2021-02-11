let socket = io();

let form = document.getElementById("searchForm");
let pseudoInput = document.getElementById("pseudo");
let cancelButton = document.getElementById("cancel");
let foundDiv = document.getElementById("found");

form.addEventListener("submit", event => {
    event.preventDefault();
    if (pseudoInput.value) {
        socket.emit("search", pseudoInput.value);
        form.style.display = "none";
        cancelButton.style.display = "block";
    }
});

cancelButton.addEventListener("click", event => {
    cancelButton.style.display = "none";
    form.style.display = "block";
    socket.emit("cancel");
});

socket.on("found", opponentName => {
    console.log("test");
    cancelButton.style.display = "none";
    document.querySelector("#found h3").innerHTML = "Adversaire : " + opponentName + " !";
    foundDiv.style.display = "block";
});

socket.on("found2", opponentName => {
    console.log("test");
    cancelButton.style.display = "none";
    document.querySelector("#found h3").innerHTML = "Adversaire : " + opponentName + " !";
    foundDiv.style.display = "block";
});
