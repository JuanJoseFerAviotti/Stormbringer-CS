window.items = [];


/* =========================================================
   ITEM LOOKUP
   ========================================================= */

/*
 * Find an item either in items.json or in the character's
 * custom generated items.
 */
window.getItemById = function(id) {

    if (!id)
        return null;

    // Modified/custom items FIRST
    const customItem =
        character.customItems?.find(
            item => item.id === id
        );

    if (customItem)
        return customItem;

    // Normal items
    const normalItem =
        window.items.find(
            item => item.id === id
        );

    if (normalItem)
        return normalItem;

    return null;
}


/* =========================================================
   LOAD ITEMS
   ========================================================= */

fetch("js/items.json")
    .then(response => response.json())
    .then(data => {

        window.items = data;


        /*
         * Make sure the character has a customItems array.
         */
        if (!Array.isArray(character.customItems)) {

            character.customItems = [];

        }


        /*
         * Give old inventory entries an inventoryId.
         */
        character.inventory.forEach(item => {

            if (!item.inventoryId) {

                item.inventoryId =
                    crypto.randomUUID();

            }

        });


        loadItemSelector();

        loadItemSuggestions();

        loadItemCalculatorSuggestions();

        createInventoryTable();

    })
    .catch(error => {

        console.error(
            "Error loading items:",
            error
        );

    });


/* =========================================================
   ITEM SEARCH / SUGGESTIONS
   ========================================================= */

function loadItemSelector() {

    const select =
        document.getElementById("itemSelect");


    if (!select)
        return;


    select.innerHTML = "";


    window.items.forEach(item => {

        const option =
            document.createElement("option");


        option.value =
            item.id;


        option.textContent =
            item.name;


        select.appendChild(option);

    });

}


function loadItemSuggestions() {

    const list =
        document.getElementById(
            "itemSuggestions"
        );


    if (!list)
        return;


    list.innerHTML = "";


    window.items.forEach(item => {

        const option =
            document.createElement("option");


        option.value =
            item.name;


        list.appendChild(option);

    });

}


function loadItemCalculatorSuggestions() {

    const list =
        document.getElementById(
            "itemCalculatorSuggestions"
        );


    if (!list)
        return;


    list.innerHTML = "";


    window.items.forEach(item => {

        const option =
            document.createElement("option");


        option.value =
            item.name;


        list.appendChild(option);

    });

}


/* =========================================================
   NORMAL ITEM ADD
   ========================================================= */

function addSelectedItem() {

    const input =
        document.getElementById(
            "itemSearch"
        );


    if (!input)
        return;


    const name =
        input.value.trim();


    const item =
        window.items.find(
            i =>
                i.name.toLowerCase() ===
                name.toLowerCase()
        );


    if (!item) {

        alert("Item not found");

        return;

    }


    /*
     * Normal items use their original ID.
     *
     * We don't need to create a custom item for
     * normal iron/normal-status equipment.
     */

    let existing =
        character.inventory.find(
            storedItem => {

                return (
                    storedItem.id === item.id &&
                    !storedItem.customItem
                );

            }
        );


    if (existing) {

        existing.amount++;

    }
    else {

        character.inventory.push({

            inventoryId:
                crypto.randomUUID(),

            id:
                item.id,

            amount:
                1

        });

    }


    saveCharacter();

    createInventoryTable();


    input.value = "";

}


/* =========================================================
   REMOVE ITEM
   ========================================================= */

function removeItem(inventoryId) {

    const index =
        character.inventory.findIndex(
            item =>
                item.inventoryId === inventoryId
        );


    if (index === -1)
        return;


    character.inventory[index].amount--;


    if (
        character.inventory[index].amount <= 0
    ) {

        /*
         * If the item being removed is equipped,
         * unequip it first.
         */

        const removed =
            character.inventory[index];


        if (
            character.equipped.weapon ===
            removed.id
        ) {

            character.equipped.weapon = null;

        }


        if (
            character.equipped.armor ===
            removed.id
        ) {

            character.equipped.armor = null;

        }


        if (
            character.equipped.shield ===
            removed.id
        ) {

            character.equipped.shield = null;

        }


        character.inventory.splice(
            index,
            1
        );

    }


    saveCharacter();

    createInventoryTable();

}


/* =========================================================
   INVENTORY WEIGHT
   ========================================================= */

function updateInventoryWeight() {

    let weight = 0;


    character.inventory.forEach(
        storedItem => {

            const item =
                getItemById(
                    storedItem.id
                );


            if (!item)
                return;


            if (item.weight != null) {

                weight +=
                    item.weight *
                    storedItem.amount;

            }

        }
    );


    const weightDisplay =
        document.getElementById(
            "currentWeight"
        );


    if (weightDisplay) {

        weightDisplay.textContent =
            weight.toFixed(1);

    }

}


/* =========================================================
   CREATE INVENTORY TABLE
   ========================================================= */

function createInventoryTable() {

    const table =
        document.getElementById(
            "inventoryTable"
        );


    const header =
        document.getElementById(
            "inventoryHeader"
        );


    if (!table || !header)
        return;


    table.innerHTML = "";


    header.innerHTML = `

        <tr id="inventoryHeaderRow">

            <th>Icon</th>
            <th>Name</th>
            <th>Category</th>
            <th>Value</th>
            <th>Damage Type</th>
            <th>Properties</th>
            <th>Weight</th>
            <th>Cost</th>
            <th>A.</th>
            <th>Equip</th>
            <th>Remove</th>

        </tr>

    `;


    character.inventory.forEach(
        storedItem => {

            const item =
                getItemById(
                    storedItem.id
                );


            if (!item)
                return;


            let properties = "";


            if (item.properties) {

                if (
                    Array.isArray(
                        item.properties
                    )
                ) {

                    properties =
                        item.properties.join(", ");

                }
                else {

                    properties =
                        item.properties;

                }

            }


            const row =
                document.createElement("tr");


            const equipped =
                character.equipped.weapon ===
                    storedItem.id ||

                character.equipped.armor ===
                    storedItem.id ||

                character.equipped.shield ===
                    storedItem.id;


            if (equipped) {

                row.classList.add(
                    "equippedItem"
                );

            }


            row.innerHTML = `

                <td>

                    <img
                        src="icons/${item.id}.svg"
                        class="itemIcon"
                        onerror="
                            this.onerror=null;
                            this.src='icons/default.svg';
                        "
                    >

                </td>


                <td>
                    ${item.name}
                </td>


                <td>
                    ${item.category ?? item.type}
                </td>


                <td>

                    ${
                        item.displayDamage ??
                        item.damage ??
                        item.armor ??
                        item.armorValue ??
                        item.bonus ??
                        item.armorBonus ??
                        "-"
                    }

                </td>


                <td>

                    ${
                        item.damageType ??
                        (
                            item.type === "armor"
                                ? "Armor"
                                : "-"
                        )
                    }

                </td>


                <td>
                    ${properties || "-"}
                </td>


                <td>
                    ${item.weight ?? "-"} kg
                </td>


                <td>
                    ${item.cost ?? "-"}
                </td>


                <td>
                    ${storedItem.amount}
                </td>


                <td>

                    <button
                        onclick="${
                            equipped
                                ? `unequipItem('${storedItem.id}')`
                                : `equipItem('${storedItem.id}')`
                        }"
                    >

                        ${
                            equipped
                                ? "Unequip"
                                : "Equip"
                        }

                    </button>

                </td>


                <td>

                    <button
                        onclick="
                            removeItem(
                                '${storedItem.inventoryId}'
                            )
                        "
                    >
                        X
                    </button>

                </td>

            `;


            table.appendChild(row);

        }
    );


    updateInventoryWeight();

}


/* =========================================================
   EQUIP
   ========================================================= */

function equipItem(id) {

    const item =
        getItemById(id);


    if (!item)
        return;


    if (item.type === "weapon") {

        character.equipped.weapon =
            id;

    }
    else if (item.type === "armor") {

        character.equipped.armor =
            id;

    }
    else if (item.type === "shield") {

        character.equipped.shield =
            id;

    }


    saveCharacter();

    createInventoryTable();

    recalculateDerivedStats();

}


/* =========================================================
   UNEQUIP
   ========================================================= */

function unequipItem(id) {

    if (
        character.equipped.weapon ===
        id
    ) {

        character.equipped.weapon = null;

    }


    if (
        character.equipped.armor ===
        id
    ) {

        character.equipped.armor = null;

    }


    if (
        character.equipped.shield ===
        id
    ) {

        character.equipped.shield = null;

    }


    saveCharacter();

    createInventoryTable();

    recalculateDerivedStats();

}


/* =========================================================
   CALCULATOR ITEM
   ========================================================= */

function getCalculatorItem() {

    const input =
        document.getElementById(
            "itemCalculatorSearch"
        );


    if (!input)
        return null;


    const name =
        input.value.trim();


    if (!name)
        return null;


    return window.items.find(
        item =>
            item.name.toLowerCase() ===
            name.toLowerCase()
    );

}


/* =========================================================
   CALCULATOR MATERIAL SELECTOR
   ========================================================= */

function loadItemCalculatorMaterials(
    item = null
) {

    const select =
        document.getElementById(
            "itemMaterial"
        );


    if (!select)
        return;


    select.innerHTML = "";


    if (!item) {

        select.innerHTML = `

            <option value="">
                Select an item first
            </option>

        `;

        return;

    }


    const materials =
        ItemCalculator.getAvailableMaterials(
            item
        );


    materials.forEach(material => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            material;


        option.textContent =
            formatItemName(
                material
            );


        select.appendChild(option);

    });

}


/* =========================================================
   CALCULATOR STATUS SELECTOR
   ========================================================= */

function loadItemCalculatorStatuses(
    item = null
) {

    const select =
        document.getElementById(
            "itemStatus"
        );


    if (!select)
        return;


    select.innerHTML = "";


    if (!item) {

        select.innerHTML = `

            <option value="">
                Select an item first
            </option>

        `;

        return;

    }


    const statuses =
        ItemCalculator.getAvailableStatuses(
            item
        );


    statuses.forEach(status => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            status;


        option.textContent =
            formatItemName(
                status
            );


        select.appendChild(option);

    });

}


/* =========================================================
   FORMAT SELECTOR TEXT
   ========================================================= */

function formatItemName(name) {

    return name
        .split(" ")
        .map(
            word =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");

}


/* =========================================================
   UPDATE CALCULATOR SELECTORS
   ========================================================= */

function updateItemCalculatorSelectors() {

    const item =
        getCalculatorItem();


    if (!item) {

        loadItemCalculatorMaterials(null);

        loadItemCalculatorStatuses(null);

        return;

    }


    loadItemCalculatorMaterials(item);

    loadItemCalculatorStatuses(item);

}


/* =========================================================
   CREATE CUSTOM ITEM ID
   ========================================================= */

function createModifiedItemId(
    item,
    material,
    status
) {

    const materialPart =
        material === "iron"
            ? ""
            : `${material}_`;


    const statusPart =
        status === "normal"
            ? ""
            : `${status.replaceAll(" ", "_")}_`;


    return (
        materialPart +
        statusPart +
        item.id
    );

}


/* =========================================================
   ADD MODIFIED ITEM
   ========================================================= */

function addModifiedItem() {

    console.log("=== ADD MODIFIED ITEM ===");

    const item = getCalculatorItem();

    console.log("CALCULATOR ITEM:", item);

    if (!item) {
        alert("Item not found");
        return;
    }


    const materialSelect =
        document.getElementById("itemMaterial");

    const statusSelect =
        document.getElementById("itemStatus");


    if (!materialSelect || !statusSelect) {
        alert("Item calculator selectors not found.");
        return;
    }


    const material =
        materialSelect.value;

    const status =
        statusSelect.value || "normal";


    console.log("MATERIAL:", material);
    console.log("STATUS:", status);


    if (!material) {
        alert("Select a material");
        return;
    }


    /*
     * NORMAL ITEM
     */

    if (
        material === "iron" &&
        status === "normal"
    ) {

        console.log("NORMAL ITEM - NO CUSTOM ITEM CREATED");

        let existing =
            character.inventory.find(
                storedItem =>
                    storedItem.id === item.id
            );


        if (existing) {

            existing.amount++;

        }
        else {

            character.inventory.push({

                inventoryId:
                    crypto.randomUUID(),

                id:
                    item.id,

                amount:
                    1

            });

        }


        saveCharacter();

        createInventoryTable();

        return;
    }


    /*
     * CALCULATE MODIFIED ITEM
     */

    console.log("CALCULATING MODIFIED ITEM");


    const calculated =
        ItemCalculator.calculate(
            item,
            {
                material: material,
                status: status
            }
        );


    console.log("CALCULATED ITEM:", calculated);
    console.log("CALCULATED ARMOR:", calculated.armorValue);


    if (calculated.invalidModification) {

        alert(
            calculated.invalidModification
        );

        return;

    }


    /*
     * CREATE MODIFIED ID
     */

    const modifiedId =
        createModifiedItemId(
            item,
            material,
            status
        );


    console.log("MODIFIED ID:", modifiedId);


    /*
     * FIND EXISTING CUSTOM ITEM
     */

    let customItem =
        character.customItems.find(
            custom =>
                custom.id === modifiedId
        );


    console.log(
        "EXISTING CUSTOM ITEM:",
        customItem
    );


    /*
     * CREATE CUSTOM ITEM
     */

    if (!customItem) {

        customItem = {

            ...calculated,

            id:
                modifiedId,

            baseItemId:
                item.id

        };


        console.log(
            "CREATING CUSTOM ITEM:",
            customItem
        );


        character.customItems.push(
            customItem
        );


        console.log(
            "SAVED CUSTOM ITEM:",
            customItem
        );


        console.log(
            "SAVED CUSTOM ARMOR:",
            customItem.armorValue
        );

    }


    /*
     * ADD CUSTOM ITEM TO INVENTORY
     */

    let existing =
        character.inventory.find(
            storedItem =>
                storedItem.id ===
                modifiedId
        );


    if (existing) {

        existing.amount++;

    }
    else {

        character.inventory.push({

            inventoryId:
                crypto.randomUUID(),

            id:
                modifiedId,

            amount:
                1

        });

    }


    saveCharacter();

    createInventoryTable();


    const input =
        document.getElementById(
            "itemCalculatorSearch"
        );


    if (input) {

        input.value = "";

    }


    loadItemCalculatorMaterials(null);

    loadItemCalculatorStatuses(null);

}


/* =========================================================
   CALCULATOR PREVIEW
   ========================================================= */

function updateItemCalculator() {

    const item =
        getCalculatorItem();


    const result =
        document.getElementById(
            "itemCalculatorResult"
        );


    if (!result)
        return;


    if (!item) {

        result.innerHTML = `
            <p>Select an item.</p>
        `;

        return;

    }


    const material =
        document.getElementById(
            "itemMaterial"
        )?.value || "";


    const status =
        document.getElementById(
            "itemStatus"
        )?.value ||
        "normal";


    if (!material) {

        result.innerHTML = `
            <p>Select a material.</p>
        `;

        return;

    }


    const calculated =
        ItemCalculator.calculate(
            item,
            {
                material:
                    material,

                status:
                    status
            }
        );


    result.innerHTML = `

        <strong>
            ${calculated.name}
        </strong>

        <br><br>

        Material:
        ${formatItemName(material)}

        <br>

        Status:
        ${formatItemName(status)}

        <br>

        Cost:
        ${calculated.cost ?? item.cost}

        <br>

        Damage:
        ${
            calculated.displayDamage ??
            calculated.damage ??
            "-"
        }

    `;

}


/* =========================================================
   CALCULATOR SEARCH EVENTS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "itemCalculatorSearch"
            );


        if (input) {

            input.addEventListener(
                "input",
                () => {

                    const item =
                        getCalculatorItem();


                    loadItemCalculatorMaterials(
                        item
                    );


                    loadItemCalculatorStatuses(
                        item
                    );


                    updateItemCalculator();

                }
            );

        }


        const material =
            document.getElementById(
                "itemMaterial"
            );


        if (material) {

            material.addEventListener(
                "change",
                updateItemCalculator
            );

        }


        const status =
            document.getElementById(
                "itemStatus"
            );


        if (status) {

            status.addEventListener(
                "change",
                updateItemCalculator
            );

        }

    }
);