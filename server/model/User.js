class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.entries = [];
        this.xp = 0;
        this.isWeeklyQuestDone = false;
    }

    addEntry(entry) {
        this.entries.push(entry)
    }
}

module.exports = User;