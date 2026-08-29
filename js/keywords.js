let keywordsData = {};

fetch("js/keywords.json")
    .then(response => response.json())
    .then(data => {

        keywordsData = data;

        console.log("Keywords loaded:", keywordsData);

    })
    .catch(error => {
        console.error("Error loading keywords:", error);
    });


function getKeyword(keywordId) {

    const id = keywordId.toLowerCase();

    for (const category in keywordsData) {

        if (keywordsData[category][id]) {
            return keywordsData[category][id];
        }

    }

    return null;
}

function formatKeyword(keywordText) {

    // Example:
    // "Loading (12)" -> keyword = "Loading"
    // "Range (30/120)" -> keyword = "Range"

    const match = keywordText.match(/^([^(]+?)(?:\s*\(.*\))?$/);

    const keywordId = match
    ? match[1].trim().toLowerCase().replace(/-/g, "_")
    : keywordText.toLowerCase().replace(/-/g, "_");

    let keyword = null;

    for (const category in keywordsData) {

        if (keywordsData[category][keywordId]) {
            keyword = keywordsData[category][keywordId];
            break;
        }

    }

    // Not a registered keyword
    if (!keyword) {
        return keywordText;
    }

    return `
        <span
            class="keyword"
            title="${keyword.description.replace(/"/g, "&quot;")}"
        >
            ${keyword.name}
        </span>
    `;
}function formatKeywordsInText(text, categories = []) {

    if (!text) return "";

    let result = text;

    for (const category of categories) {

        const categoryKeywords = keywordsData[category];

        if (!categoryKeywords)
            continue;

        for (const keywordId in categoryKeywords) {

            const keyword = categoryKeywords[keywordId];

            const escapedName =
                keyword.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            const regex =
                new RegExp(`\\b${escapedName}\\b`, "gi");

            result = result.replace(
                regex,
                match => `
                    <span
                        class="keyword"
                        title="${keyword.description.replace(/"/g, "&quot;")}"
                    >
                        ${match}
                    </span>
                `
            );

        }
    }

    return result;
}