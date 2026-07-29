let items = [];


fetch("js/items.json")
.then(response => response.json())
.then(data => {

    items = data;
      console.log("Items loaded:", items.length);
    loadItemSuggestions();

    createInventoryTable();

});

/* function createInventoryTable(){

    const table =
    document.getElementById("inventoryTable");

    if(!table)
        return;


    table.innerHTML = "";


    character.inventory.forEach((storedItem,index)=>{


        const item =
        items.find(i => i.id === storedItem.id);


        if(!item)
            return;


        let row=document.createElement("tr");


        row.innerHTML=`

        <td>${item.name}</td>

        <td>${item.type}</td>

        <td>${item.weight} kg</td>

        <td>
            ${storedItem.amount}
        </td>

        <td>
            <button 
            onclick="removeItem(${index})">
            X
            </button>
        </td>

        `;


        table.appendChild(row);

    });


    updateInventoryWeight();

} */
function removeItem(index){

    character.inventory.splice(index,1);

    saveCharacter();

    createInventoryTable();

}
function updateInventoryWeight(){

    let weight = 0;


    character.inventory.forEach(storedItem=>{

        const item =
        items.find(i=>i.id === storedItem.id);


        if(item){

            weight += item.weight * storedItem.amount;

        }

    });



    const stats = Rules.getFinalStats(character);


    const max =
    stats.strength * 5;


    const encumbered =
    stats.strength * 10;


    const heavy =
    stats.strength * 15;



    document.getElementById("currentWeight")
    .textContent =
    weight.toFixed(1);


/* 
    document.getElementById("maxWeight")
    .textContent =
    max;



    document.getElementById("encumberedLabel")
    .textContent =
    encumbered;



    document.getElementById("heavyEncumberedLabel")
    .textContent =
    heavy;



    document.getElementById("maxWeightLabel")
    .textContent =
    max;

 */

 /*    let percent =
    (weight / max) * 100;


    if(percent > 100)
        percent = 100;


    document.getElementById("weightFill").style.width = percent + "%";
 */
}
function loadItemSelector(){

    const select =
    document.getElementById("itemSelect");


    items.forEach(item=>{

        let option =
        document.createElement("option");


        option.value =
        item.id;


        option.textContent =
        item.name;


        select.appendChild(option);

    });

}
/* function addSelectedItem(){

    const id =
    document.getElementById("itemSelect").value;


    let existing =
    character.inventory.find(
        item=>item.id === id
    );


    if(existing){

        existing.amount++;

    }
    else{

        character.inventory.push({

            id:id,
            amount:1

        });

    }


    saveCharacter();

    createInventoryTable();

} */
function loadItemSuggestions(){

    const list =
    document.getElementById("itemSuggestions");


    items.forEach(item=>{

        let option =
        document.createElement("option");


        option.value =
        item.name;


        list.appendChild(option);

    });

}
function addSelectedItem(){

    const name =
    document.getElementById("itemSearch").value;


    const item =
    items.find(i => i.name === name);


    if(!item){

        alert("Item not found");
        return;

    }


    let existing =
    character.inventory.find(
        i=>i.id === item.id
    );


    if(existing){

        existing.amount++;

    }
    else{

        character.inventory.push({

            id:item.id,
            amount:1

        });

    }


    saveCharacter();

    createInventoryTable();


    document.getElementById("itemSearch").value="";

}
function removeItem(id){

    const index =
    character.inventory.findIndex(
        item=>item.id === id
    );


    if(index !== -1){

        character.inventory[index].amount--;


        if(character.inventory[index].amount <= 0){

            character.inventory.splice(index,1);

        }

    }


    saveCharacter();

    createInventoryTable();

}
function createInventoryTable(){

    const table =
    document.getElementById("inventoryTable");

    const header =
    document.getElementById("inventoryHeader");


    table.innerHTML="";
    header.innerHTML="";


    header.innerHTML=`

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


    character.inventory.forEach(storedItem=>{


        const item =
        items.find(i=>i.id === storedItem.id);


        if(!item)
            return;


        let properties = "";

        if(item.properties){

            properties =
            item.properties.join(", ");

        }


        let row = document.createElement("tr");
const equipped =

    character.equipped.weapon === item.id ||
    character.equipped.armor === item.id ||
    character.equipped.shield === item.id;

if(equipped){

    row.classList.add("equippedItem");

}

        row.innerHTML=`
<td>
<img
    src="icons/${item.id}.svg"
    class="itemIcon"
    onerror="this.onerror=null; this.src='icons/default.svg';">
</td>
<td>${item.name}</td>
        <td>${item.category ?? item.type}</td>


        <td>

${
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
(item.type === "armor" ? "Armor" : "-")
}

</td>


        <td>
        ${properties || "-"}
        </td>


        <td>
        ${item.weight} kg
        </td>
        <td>
        ${item.cost}
        </td>


        <td>
        ${storedItem.amount}
        </td>


        <td>

<button onclick="${
    equipped
        ? `unequipItem('${item.id}')`
        : `equipItem('${item.id}')`
}">
${equipped ? "Unequip" : "Equip"}
</button>

</td>


<td>

<button onclick="removeItem('${item.id}')">
X
</button>

</td>

        `;


        table.appendChild(row);


    });


    updateInventoryWeight();

}
function equipItem(id){

    const item =
    items.find(i=>i.id === id);


    if(!item) return;


    if(item.type === "armor"){

        character.equipped.armor = id;

    }


    else if(item.type === "weapon"){

        character.equipped.weapon = id;

    }


    else if(item.type === "shield"){

        character.equipped.shield = id;

    }


saveCharacter();

createInventoryTable();
recalculateDerivedStats();

}
function unequipItem(id){

    if(character.equipped.weapon === id)
        character.equipped.weapon = null;

    if(character.equipped.armor === id)
        character.equipped.armor = null;

    if(character.equipped.shield === id)
        character.equipped.shield = null;

    saveCharacter();

    createInventoryTable();

    recalculateDerivedStats();

}