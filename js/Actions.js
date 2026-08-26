let actionsData = [];

fetch("js/actions.json")
  .then((response) => response.json())
  .then((data) => {
    actionsData = data;

    updateActionsTable();
  })
  .catch((error) => {
    console.error("Error loading actions:", error);
  });
let itemsData = [];

fetch("js/items.json")
    .then(response => response.json())
    .then(data => {
        itemsData = data;

        if (typeof updateActionsTable === "function") {
            updateActionsTable();
        }
    })
    .catch(error => {
        console.error("Error loading items:", error);
    });
function hasActionTalent(action) {
  if (!action.talent) return true;

  return getTalentRank(action.talent) > 0;
}
function getAvailableActions() {
  return actionsData.filter((action) => hasActionTalent(action));
}
function isActionUnlocked(action) {
  const unlock = action.unlock;

  if (!unlock) return false;

  if (unlock.type === "always") return true;

  if (unlock.type === "talent") {
    return (character.talents?.[unlock.talent] || 0) > 0;
  }
if (unlock.type === "magicSystem") {

        return unlock.systems.some(system => {

            if (system === "arcane")
                return character.arcane?.enabled === true;

            if (system === "spiritWhisper")
                return character.spiritWhisper?.enabled === true;

            if (system === "liveblood")
                return character.liveblood?.enabled === true;

            if (system === "demonBlood")
                return character.demonBlood?.enabled === true;

            if (system === "monsterHunter")
                return character.monsterHunter?.enabled === true;

            if (system === "pocketDimension")
                return character.pocketDimension?.enabled === true;

            return false;
        });

    }

  return false;
}
function updateActionsTable() {
  const table = document.getElementById("actionsTable");

  if (!table) return;

  table.innerHTML = "";

  for (const action of actionsData) {
    if (!isActionUnlocked(action)) continue;

    const row = document.createElement("tr");

    row.innerHTML = `
            <td>
                ${getActionCostText(action)}
            </td>

            <td>
                ${action.name}
            </td>

            <td>
                ${getActionAttackText(action)}
            </td>

             <td>
                ${getActionEffectText(action)}
            </td>
           
            <td>
                ${getAttacksText(action)}${getActionDescriptionText(action)}
            </td>

            <td>
                <button
                    onclick="useAction('${action.id}')">
                    Use
                </button>
            </td>
        `;

    table.appendChild(row);
  }
}
function getActionCostText(action) {
  const cost = action.cost;

  if (!cost) return "";

  if (cost.value === "variable") return "Variable";

  if (cost.type === "actions") {
    let text = `${cost.value} Action`;

    if (cost.value !== 1) text += "s";

    if (cost.stamina) text += ` + ${cost.stamina} Stamina`;

    return text;
  }

  if (cost.type === "stamina") {
    return `${cost.value} Stamina`;
  }

  return cost.type;
}
function getActionEffectText(action) {
  if (action.id === "move") {
    return `${getMovementSpeed()} ft / ${(getMovementSpeed() * 0.3).toFixed(1)} m`;
 } else if (action.id === "second_wind") {
    const stats = Rules.getFinalStats(character);
    return Rules.getModifier(stats.constitution);
}
  else {return getActionDamageText(action);
  }

  
}

function getActionAttackText(action) {

    if (!action.attack) {
        return "";
    }

    const stats = Rules.getFinalStats(character);

    // Spell attack
    if (action.id === "spell") {

        let ability;

        if (character.arcane?.enabled) {
            ability = "mind";
        }
        else if (character.spiritWhisper?.enabled) {
            ability = "charisma";
        }
        else {
            return "";
        }

        return "D20 +" +
            (
                Rules.getModifier(stats[ability]) +
                Rules.getProficiencyBonus(character)
            ) +
            " roll";
    }

    // Normal actions
    if (!action.attack.ability) {
        return "";
    }

    return "D20 +" +
        (
            Rules.getModifier(stats[action.attack.ability]) +
            Rules.getProficiencyBonus(character)
        ) +
        " roll";
}
function getActionDamageText(action) {

    const stats = Rules.getFinalStats(character);

    if (!action.damage)
        return "";

    // Spell damage
    if (action.id === "spell") {
        return "Spell dependent";
    }

    // No weapon equipped
    if (!character.equipped?.weapon) {
        return "1D4 + " + Rules.getModifier(stats.strength);
    }

    // Get the actual equipped inventory item
    const weapon =
        getItemById(character.equipped.weapon);

    if (!weapon)
        return "Weapon not found: " + character.equipped.weapon;

    const abilityModifier =
        Rules.getModifier(stats.strength);

    const weaponDamage =
        weapon.damage ?? "1D4";

    const weaponModifier =
        weapon.damageModifier ?? 0;

    const totalModifier =
        abilityModifier + weaponModifier;

    return `${weaponDamage} + ${totalModifier}`;
}
function getActionDescriptionText(action) {
  if (!action.description) return "not found";
  return action.description;
}
function getAttacksText(action) {
  if (!action.attacks) return "";
  
    return (1+character.talents?.[action.attacks] || 0)+" ";
  
}
function getMovementSpeed() {

    const stats = Rules.getFinalStats(character);

    const strengthMod =
        Rules.getModifier(stats.strength);

    const agilityMod =
        Rules.getModifier(stats.agility);

    const constitutionMod =
        Rules.getModifier(stats.constitution);


    let movement = 20;


    // Runner
    if ((character.talents?.Runner || 0) > 0) {

        movement += agilityMod * 2.5;

    }


    // Charger
    if ((character.talents?.charger || 0) > 0) {

        movement += strengthMod * 2.5;

    }


    // Relentless Rage
    if ((character.talents?.relentless_rage || 0) > 0) {

        movement += constitutionMod * 2.5;

    }


    // Armor category
    const armorCategory =
        getEquippedArmorCategory();


    if (
        armorCategory === "Light" ||
        armorCategory === "Medium"
    ) {

        movement += 5;

    }
    else if (armorCategory === "Heavy") {

        movement += 0;

    }
    else {

        movement += 5;

    }


    // MROUND(..., 5)
    return Math.round(movement / 5) * 5;
}function getEquippedArmorCategory() {

    if (!character.equipped?.armor) {
        return "";
    }

    const armor =
        getItemById(character.equipped.armor);

    if (!armor) {
        return "";
    }

    return armor.category;
}