const fileInput = document.getElementById("saveFile");
const button = document.getElementById("loadButton");
const status = document.getElementById("status");

button.addEventListener("click", () => {

    const file = fileInput.files[0];

    if (!file) {
        status.textContent = "Please choose a save file.";
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            // Convert the JSON text into an object
            const character = JSON.parse(e.target.result);

            // Save it for the next page
            localStorage.setItem("character", JSON.stringify(character));

            status.textContent = "Character loaded!";

            window.location.href = "character.html";

        }
        catch(error) {
            status.textContent = "Invalid save file.";
            console.error(error);
        }

    };

    reader.readAsText(file);

});

function newCharacter(){

    const character = createDefaultCharacter();

    localStorage.setItem(
        "currentCharacter",
        JSON.stringify(character)
    );

    window.location.href = "character.html";

}

function exportCharacter(){

    const json =
    JSON.stringify(character,null,4);

    const blob =
    new Blob([json],{type:"application/json"});

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href=url;

    a.download=
    (character.name || "Character") + ".json";

    a.click();

    URL.revokeObjectURL(url);

}
function importCharacter(event){

    const file = event.target.files[0];

    if(!file)
        return;

    const reader = new FileReader();

    reader.onload = function(){

        localStorage.setItem(
            "currentCharacter",
            reader.result
        );

        window.location.href = "character.html";

    };

    reader.readAsText(file);

}
let character = createDefaultCharacter();

localStorage.setItem("character", JSON.stringify(character));

location.href = "character.html";
function continueCharacter(){

    if(localStorage.getItem("currentCharacter")){

        window.location.href = "character.html";

    }
    else{

        alert("No character found.");

    }

}
reader.onload=function(){

    localStorage.setItem(
        "currentCharacter",
        reader.result
    );

    location.href="character.html";

}
const data=
localStorage.getItem("currentCharacter");