class Badge {
    constructor(name, description, condition, category) {   
        this.name = name;
        this.description = description;
        this.condition = condition;
        this.category = category;
        this.advancement = 0;
    }
}

module.exports = Badge;