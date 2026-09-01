fetch("js/magicartifacts.json")
    .then(response => response.json())
    .then(data => {

        magicArtifactsData = data;

        console.log(
            "Magic Artifacts loaded:",
            magicArtifactsData.length
        );

        loadMagicArtifactSelector();

        updateMagicArtifactsTable();

    })
    .catch(error => {
        console.error(
            "Error loading Magic Artifacts:",
            error
        );
    });
function getMagicArtifact(artifactId) {

    return magicArtifactsData.find(
        artifact => artifact.id === artifactId
    );
}
function getMagicArtifactItem(artifactId) {

    const artifact = getMagicArtifact(artifactId);

    if (!artifact) {
        return null;
    }

    // No base item
    if (!artifact.itemBase) {
        return {
            ...artifact
        };
    }

    // Find the normal item
    const baseItem = itemsData.find(
        item => item.id === artifact.itemBase
    );

    if (!baseItem) {
        console.error(
            "Base item not found:",
            artifact.itemBase
        );

        return {
            ...artifact
        };
    }

    // Normal item stats + artifact information
    return {
        ...baseItem,
        ...artifact
    };
}
function updateMagicArtifactsTable() {

    const table =
        document.getElementById("magicArtifactsTable");

    if (!table)
        return;

    table.innerHTML = "";

    /*
     * Look through the character's inventory.
     *
     * Only artifacts that the character actually owns
     * are displayed here.
     */
    character.inventory.forEach(storedItem => {

        const artifact =
            getMagicArtifact(storedItem.id);

        // Not a magic artifact
        if (!artifact)
            return;

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${artifact.name}
            </td>

            <td>
                ${getMagicArtifactEffectsText(artifact)}
            </td>
        `;

        table.appendChild(row);

    });
}
function getMagicArtifactEffectsText(artifact) {

    if (!artifact.effects)
        return "";

    return Object.values(artifact.effects)
        .map(effect => {

            let text =
                `<strong>${effect.name ?? ""}</strong>`;

            /*
             * Effect cost
             */
            if (effect.cost) {

                if (effect.cost.type === "mana") {

                    text +=
                        ` — ${effect.cost.value} Mana`;

                }
                else if (effect.cost.type === "actions") {

                    text +=
                        ` — ${effect.cost.value} Actions`;

                }

            }

            /*
             * Mana cost that depends on bolts/shots/etc.
             */
            if (effect.mana) {

                if (effect.mana.type === "perBolt") {

                    text +=
                        ` + ${effect.mana.value} Mana per bolt`;

                }

            }

            /*
             * Effect description
             */
            if (effect.effect) {

                if (effect.effect.type === "reload") {

                    text +=
                        ` — Reloads ${effect.effect.amount} bolt`;

                }

                else if (effect.effect.type === "fireBolts") {

                    text +=
                        ` — Fires up to ${effect.effect.bolts} bolts`;

                }

            }

            return text;

        })
        .join("<br><br>");
}
function getMagicArtifactItemData(artifact) {

    if (!artifact)
        return null;

    // If the artifact has a base item,
    // get its normal item data.
    if (artifact.itemBase) {

        const baseItem = itemsData.find(
            item => item.id === artifact.itemBase
        );

        if (!baseItem)
            return null;

        // Start with the normal item's properties
        // and replace them with artifact-specific values.
        return {
            ...baseItem,
            ...artifact,

            // Keep the artifact's own ID and name
            id: artifact.id,
            name: artifact.name,

            // Keep the artifact type
            type: artifact.type
        };
    }

    // Artifact has no base item.
    // It must contain its own item information.
    return artifact;
}
function tryResolveMagicArtifacts() {

    if (!magicArtifactsData.length)
        return;

    if (!itemsData.length)
        return;

    const artifact =
        getMagicArtifact("automatic_fire_crossbow");

    console.log(
        "Resolved artifact:",
        getMagicArtifactItemData(artifact)
    );
}function getItemData(itemId) {

    // Check normal items first
    const normalItem = itemsData.find(
        item => item.id === itemId
    );

    if (normalItem) {
        return normalItem;
    }

    // Check magic artifacts
    const artifact = getMagicArtifact(itemId);

    if (artifact) {
        return getMagicArtifactItem(itemId);
    }

    return null;
}
function loadMagicArtifactSelector() {

    const select =
        document.getElementById("magicArtifactSelect");

    if (!select)
        return;

    select.innerHTML = `
        <option value="">Select Magic Artifact</option>
    `;

    magicArtifactsData.forEach(artifact => {

        const option =
            document.createElement("option");

        option.value = artifact.id;
        option.textContent = artifact.name;

        select.appendChild(option);

    });
}function addMagicArtifact() {

    const select =
        document.getElementById("magicArtifactSelect");

    if (!select)
        return;

    const artifactId =
        select.value;

    if (!artifactId)
        return;

    const artifact =
        getMagicArtifact(artifactId);

    if (!artifact) {
        console.error(
            "Magic artifact not found:",
            artifactId
        );
        return;
    }

    let existing =
        character.inventory.find(
            item => item.id === artifact.id
        );

    if (existing) {

        existing.amount++;

    }
    else {

        character.inventory.push({

            inventoryId:
                crypto.randomUUID(),

            id:
                artifact.id,

            amount:
                1

        });

    }

    saveCharacter();

    createInventoryTable();

    updateMagicArtifactsTable();

    select.value = "";
}