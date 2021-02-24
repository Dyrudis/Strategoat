const express = require("express");
const session = require("express-session")({
    // strategoat en Sha256
    secret: "6167eb9b9859b49739572ec07a4fba131bc08a10ddae66654399557df0dc1134",
    resave: true,
    reset: true,
    saveUninitialized: true
});
const sharedSession = require("express-socket.io-session");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const matchmaking = require("./back/modules/matchmaking");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "strategoat"
});

app.use(session);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/front/`));
io.use(sharedSession(session, {
    autoSave: true
}));



// Joueur dans la file d'attente
let waitingPlayer = {
    id: undefined,
    username: undefined
};

io.on("connection", (socket) => {

    matchmaking(io, socket, waitingPlayer);

});

// Arrivée sur l'accueil
app.get("/", (req, res) => {
    if (req.session.username) {
        // Utilisateur connecté, on l'envoie vers la page d'accueil
        res.sendFile(`${__dirname}/front/html/index.html`);
        io.on("connection", (socket) => {
            socket.emit("load", socket.handshake.session.username);
        });
    } else {
        // Utilisateur non connecté, on l'envoie vers la page de connexion
        res.sendFile(`${__dirname}/front/html/login.html`);
    }
});

// Connexion à un compte existant
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        connection.query("SELECT * FROM accounts WHERE username = ? AND password = ?", [username, password], (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                req.session.username = username;
                res.redirect("/");
            }
            else {
                res.send("Nom d'utilisateur ou un mot de passe incorrect.");
            }
        });
    }
    else {
        res.send("Merci de renseigner un nom d'utilisateur ou un mot de passe.");
    }
});

// Création d'un nouveau compte
app.post("/create", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        connection.query("SELECT * FROM accounts WHERE username = ?", [username], (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                res.send("Nom d'utilisateur déjà enregistré.");
            }
            else {
                const info = {
                    username: username,
                    password: password
                }
                connection.query("INSERT INTO accounts SET ?", [info], (err, result) => {
                    if (err) throw err;
                });
                req.session.username = username;
                res.redirect("/");
            }
        });
    }
    else {
        res.send("Merci de renseigner un nom d'utilisateur ou un mot de passe.");
    }
});

http.listen(4200, () => {
    console.log("Serveur lancé sur le port 4200");
});
