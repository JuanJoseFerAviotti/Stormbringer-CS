function createDefaultCharacter() {

    const character = {
        name: "test",
        level: 1,

        race: "Human Midgard",
        gender: "Male",

        health: 10,
        mana: 8,
        stamina: 1,
        armor: 10,

        investedStats: {
            strength: 0,
            agility: 0,
            constitution: 0,
            charisma: 0,
            mind: 0,
            soul: 0
        },

        skills: {}
    };

    const stats = Rules.getFinalStats(character);

    character.maxHealth = Rules.getMaxHealth(stats);
    character.maxMana = Rules.getMaxMana(stats);
    character.maxStamina = Rules.getMaxStamina(stats);
    character.armor = Rules.getArmor(stats);
    character.health = character.maxHealth;
    character.mana = character.maxMana;
    character.stamina = character.maxStamina;

    return character;
}