let socket = io();

let form = document.getElementById("searchForm");
let pseudoInput = document.getElementById("pseudo");
let cancelButton = document.getElementById("cancel");
let foundDiv = document.getElementById("found");

form.addEventListener("submit", event => {
    event.preventDefault();
    if (pseudoInput.value) {
        form.style.display = "none";
        cancelButton.style.display = "block";
        socket.emit("search", pseudoInput.value);
    }
});

cancelButton.addEventListener("click", event => {
    cancelButton.style.display = "none";
    form.style.display = "block";
    socket.emit("cancel");
});

socket.on("found", opponentName => {
    cancelButton.style.display = "none";
    foundDiv.style.display = "block";
    document.querySelector("#found h3").innerHTML = `Adversaire : ${opponentName} !`;
});
