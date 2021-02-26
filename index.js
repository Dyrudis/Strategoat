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
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const connection = mysql.createConnection({
    // Connexion à une base de donnée locale :
    host: "localhost",
    user: "root",
    password: "",
    database: "strategoat"

    // Connexion à la base de donnée Heroku :
    /* host: "eu-cdbr-west-03.cleardb.net",
    user: "b8669c0ae18ee6",
    password: "85dafeff",
    database: "heroku_db2b00592774280" */
});

app.use(session);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/front/`));
io.use(sharedSession(session, {
    autoSave: true
}));

// Liste des joueurs connectés
players = [];

io.on("connection", (socket) => {

    // Lors de la connexion, on envoie les informations de session à l'utilisateur
    socket.emit("load", socket.handshake.session.username);

    // Puis on ajoute le joueur à la liste des joueurs disponibles
    players.push({
        id: socket.id,
        username: socket.handshake.session.username
    });

    // Et on actualise l'affichage de tous les joueurs
    io.emit("refresh players", players);

    // Fonction qui renvoie le socket.id du joueur ayant le nom username
    function getId(username) {
        let player = players.find(player => player.username == username);
        return player ? player.id : undefined;
    }

    // Envoie d'une invitation
    socket.on("send invite", username => {
        socket.to(getId(username)).emit("get invite", socket.handshake.session.username);
    });

    // Invitation acceptée : début de la partie
    socket.on("start game", (player1, player2) => {
        if (socket.id == getId(player1)) {
            socket.emit("found", player2);
            socket.to(getId(player2)).emit("found", player1);
        }
        else {
            socket.to(getId(player1)).emit("found", player2);
            socket.emit("found", player1);
        }
    });

    // Déconnexion
    socket.on("disconnect", () => {
        // Lors de la déconnexion, on supprime le joueur de la liste des joueurs disponibles
        players = players.filter(player => player.id != socket.id);
        // Puis on actualise l'affichage de tous les autres joueurs
        socket.broadcast.emit("refresh players", players);
    });

});

// Arrivée sur l'accueil
app.get("/", (req, res) => {
    if (req.session.username) {
        // Utilisateur connecté, on l'envoie vers la page d'accueil
        res.sendFile(`${__dirname}/front/html/index.html`);
    } else {
        // Utilisateur non connecté, on l'envoie vers la page de connexion
        res.sendFile(`${__dirname}/front/html/login.html`);
    }
});

// Connexion à un compte existant
app.post("/login", (req, res) => {
    if (req.session.username == undefined) {
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
    }
    else {
        res.send("Vous êtes déjà connecté.");
    }
});

// Création d'un nouveau compte
app.post("/signin", (req, res) => {
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

// Déconnexion du compte
app.post("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

const port = process.env.PORT || 4200;

http.listen(port, () => {
    console.log(`Serveur lancé sur le port ${port}`);
});
