let magicArtifactsData = [];

fetch("js/magicartifacts.json")
    .then(response => response.json())
    .then(data => {

        magicArtifactsData = data;

        console.log(
            "Magic Artifacts loaded:",
            magicArtifactsData.length
        );

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

    for (const artifact of magicArtifactsData) {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${artifact.name}</td>
            <td>${artifact.cost ?? ""}</td>
            <td>${artifact.weight ?? ""}</td>
            <td>
                ${getMagicArtifactEffectsText(artifact)}
            </td>
        `;

        table.appendChild(row);
    }
}
function getMagicArtifactEffectsText(artifact) {

    if (!artifact.effects)
        return "";

    return Object.values(artifact.effects)
        .map(effect => effect.name ?? "")
        .join(", ");
}