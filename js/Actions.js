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
    return unlock.systems.some(
      (system) => character.magicSystems?.[system] === true,
    );
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

  return "";
}
function getActionEffectText(action) {
  if (action.id === "move") {
    return `${Rules.getMovementSpeed(character)} ft`;
  } else if(action.id === "second_wind") {
    return Rules.getModifier(stats.constitution)
  }
  else {return getActionDamageText(action);
  }

  
}
const stats = Rules.getFinalStats(character);

function getActionAttackText(action) {
  if (!action.attack) {
    return "not found";
  }

  return "D 20 +" + (Rules.getModifier(stats[action.attack.ability]) + Rules.getProficiencyBonus(character)) + " roll";
}
function getActionDamageText(action) {

    if (!action.damage)
        return "not found";

    if (!character.equipped.weapon)
        return "1D4 + " + Rules.getModifier(stats.strength);

    console.log("=== WEAPON DEBUG ===");
    console.log("equipped:", JSON.stringify(character.equipped.weapon));
    console.log("itemsData:", itemsData);
    console.log("itemsData length:", itemsData.length);

    const weapon = itemsData.find(
        item => item.id === character.equipped.weapon
    );

    console.log("weapon found:", weapon);

    if (!weapon)
        return "Weapon not found: " + character.equipped.weapon;

    const abilityModifier = Rules.getModifier(stats.strength);

    return `${weapon.damage} + ${abilityModifier}`;
}
function getActionDescriptionText(action) {
  if (!action.description) return "not found";
  return action.description;
}
function getAttacksText(action) {
  if (!action.attacks) return "";
  
    return (character.talents?.[action.attacks] || 0)+" ";
  
}
