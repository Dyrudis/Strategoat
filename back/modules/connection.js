let players = [];

let self = module.exports = {

    newPlayer: (username) => {
        players.push({
            username: username,
            status: "Offline"
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

    init: (tab) => {
        tab.forEach(player => {
            self.newPlayer(player.username);
        });
    }

}
