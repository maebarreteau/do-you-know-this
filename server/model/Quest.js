class Quest {
    constructor(description, reward, category) {
        this.description = description;
        this.reward = reward;
        this.category = category;
    }

    checkEntryValidQuest(entry) {
        return entry.category === this.category;
    }
}

module.exports = Quest;