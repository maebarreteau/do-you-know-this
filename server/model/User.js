const Badge = require("./Badge");

class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.entries = [];
        this.xp = 0;
        this.isWeeklyQuestDone = false;
        this.badges = this.createBadges();
    }

    addEntry(entry) {
        this.entries.push(entry)
    }

    createBadges() {
        let badges = [];
        badges.push(new Badge("Cinéphile", "Regarder 10 films", 10, "film"));
        badges.push(new Badge("Lecteur assidu", "Lire 5 livres", 5, "livre"));
        badges.push(new Badge("Explorateur de podcasts", "Écouter 20 podcasts", 20, "podcast"));
        badges.push(new Badge("Geek", "Jouer à 10 jeux vidéo", 10, "jeu-video"));
        badges.push(new Badge("Maître du jeu", "Jouer à 7 jeux de société", 7, "jds"));
        badges.push(new Badge("Mélomane", "Écouter 15 albums",  15, "musique"));
        return badges;
    }

    updateBadges(entry) {
        this.badges.forEach(badge => {
            if(badge.category === entry.category) {
                badge.advancement++;
            }
        });
    }
}


//  { id: "collectionneur", text: "Collectionneur : 1 dans chaque catégorie",}
  

module.exports = User;