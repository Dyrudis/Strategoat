let players = [];

let self = module.exports = {

    newPlayer: (username) => {
        players.push({
            username: username,
            status: "Offline",
            civ: "default"
        });
    },

    getPlayers: () => {
        return players;
    },

    getPlayer: (username) => {
        return players.find(player => player.username == username);
    },

    setId: (username, id) => {
        if (self.getPlayer(username))
            self.getPlayer(username).id = id;
    },

    setStatus: (username, status) => {
        if (self.getPlayer(username))
            self.getPlayer(username).status = status;
    },

    setCiv: (username, civ) => {
        if (self.getPlayer(username))
            self.getPlayer(username).civ = civ;
    },

    init: (tab) => {
        tab.forEach(player => {
            self.newPlayer(player.username);
        });
    }

}
