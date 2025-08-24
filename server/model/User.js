
class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.entries = [];
    }

    addEntry(entry) {
        this.entries.push(entry)
    }
}

module.exports = User;