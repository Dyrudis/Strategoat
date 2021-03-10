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

// Liste des joueurs connectés
let players = [];

require("./back/modules/lobby")(io, players);
require("./back/modules/game")(io, players);

app.use(session);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/front/`));
io.use(sharedSession(session, {
    autoSave: true
}));

// Arrivée sur l'accueil
app.get("/", (req, res) => {
    //res.sendFile(`${__dirname}/front/html/game.html`);
    if (req.session.username && req.session.game) {
        // Utilisateur connecté et dans une partie, on l'envoie vers la page de partie
        res.sendFile(`${__dirname}/front/html/game.html`);
    }
    else if (req.session.username) {
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
