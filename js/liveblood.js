let livebloodData = [];

fetch("js/liveblood.json")
    .then(response => response.json())
    .then(data => {

        livebloodData = data;

        console.log("LiveBlood loaded:", livebloodData.length);

        updateLiveBloodTable();

    })
    .catch(error => {
        console.error("Error loading LiveBlood:", error);
    });

document.getElementById("livebloodLevel").textContent =
    getLiveBloodRemainingPoints();
function updateLiveBloodTable() {

    const table =
        document.getElementById("livebloodTable");

    if (!table)
        return;

    table.innerHTML = "";

    livebloodData.forEach(power => {

        // Does the character have the corresponding talent?
        const talentRank =
            character.talents?.[power.talent] || 0;

        if (talentRank <= 0)
            return;


        const row =
            document.createElement("tr");


        const cost =
            calculateLiveBloodFormula(
                power.costFormula,
                power
            );


        const effect =
            calculateLiveBloodFormula(
                power.effectFormula,
                power
            );


        row.innerHTML = `

            <td>
                ${power.name}
            </td>

            <td>
                ${cost}
            </td>

            <td>
                ${effect}
                ${power.effectDescription ?? ""}
            </td>

            <td>
                <button
                    onclick="useLiveBloodPower('${power.id}')">
                    Use
                </button>
            </td>

        `;

document.getElementById("livebloodLevel").textContent =
    getLiveBloodRemainingPoints();
    console.log("LiveBlood points:", getLiveBloodRemainingPoints());
        table.appendChild(row);

    });

}
function calculateLiveBloodFormula(formula, power) {

    if (!formula)
        return power.effect ?? 0;


    let values = [];


    formula.values.forEach(value => {

        switch(value) {

            case "level":
                values.push(getLiveBloodPoints());
                break;


            case "baseCost":
                values.push(Number(power.baseCost) || 0);
                break;


            case "overcharge":
                values.push(Number(power.overcharge) || 0);
                break;


            case "constitutionModifier": {

                const stats =
                    Rules.getFinalStats(character);

                values.push(
                    Rules.getModifier(stats.constitution)
                );

                break;
            }


            default:
                values.push(0);
                break;
        }

    });


    if(formula.operation === "multiply") {

        return values.reduce(
            (total, value) => total * value,
            1
        );

    }


    return 0;
}
function getLiveBloodPoints() {

    if (!character.magicSystems?.liveblood)
        return 0;

    const talentLevel =
        character.talents["liveblood_level"] || 0;

    return Math.max(
        Math.floor(character.level / 2),
        1
    ) + talentLevel;
    
}
function getLiveBloodSpentPoints() {

    let spent = 0;

    for (const id in character.liveblood.abilities) {
        spent += character.liveblood.abilities[id];
    }

    return spent;
}
function getLiveBloodRemainingPoints() {

    return getLiveBloodPoints() -
           getLiveBloodSpentPoints();
}