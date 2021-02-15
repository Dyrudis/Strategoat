const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const matchmaking = require("./back/modules/matchmaking.js");

app.use(express.static(`${__dirname}/front/`));

app.get("/", (req, res) => {
    matchmaking.matchmaking(io);
    
    res.sendFile(`${__dirname}/front/html/index.html`);
});

http.listen(4200, () => {
    console.log("Serveur lancé sur le port 4200");
});
