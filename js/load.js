// ==========================
// New Character
// ==========================

function newCharacter() {

    const character = createDefaultCharacter();

    localStorage.setItem(
        "currentCharacter",
        JSON.stringify(character)
    );

    window.location.href = "character.html";

}

// ==========================
// Continue Character
// ==========================

function continueCharacter() {

    const saved = localStorage.getItem("currentCharacter");

    if (saved) {

        window.location.href = "character.html";

    } else {

        alert("No saved character found.");

    }

}

// ==========================
// Export Character
// ==========================

function exportCharacter() {

    const data = localStorage.getItem("currentCharacter");

    if (!data) {

        alert("No character to export.");
        return;

    }

    const character = JSON.parse(data);

    const blob = new Blob(
        [JSON.stringify(character, null, 4)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = (character.name || "Character") + ".json";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);

}

// ==========================
// Import Character
// ==========================

function importCharacter(event) {

    const file = event.target.files[0];

    if (!file)
        return;

    const reader = new FileReader();

    reader.onload = function () {

        try {

            JSON.parse(reader.result);

            localStorage.setItem(
                "currentCharacter",
                reader.result
            );

            window.location.href = "character.html";

        }
        catch {

            alert("That isn't a valid character file.");

        }

    };

    reader.readAsText(file);

}