class Entry {
    constructor(title, date, types, category, comment, note) {
        this.title = title;
        this.date = date;
        this.types = types;
        this.category = category;
        this.comment = comment;
        this.note = note;
    }

    getXPFromCategory() {
        if (this.category === "film") return 30;
        if (this.category === "livre") return 50;
        if (this.category === "podcast") return 10;
        if (this.category === "musique") return 20;
        if (this.category === "jeu-video") return 40;
        if (this.category === "jds") return 50;
        return 0;
    }

}

module.exports = Entry;
