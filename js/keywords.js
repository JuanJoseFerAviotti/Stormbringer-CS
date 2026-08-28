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


function formatKeyword(keywordId) {

    const keyword = getKeyword(keywordId);

    if (!keyword) {
        return keywordId;
    }

    return `
        <span
            class="keyword"
            title="${keyword.description.replace(/"/g, "&quot;")}"
        >
            ${keyword.name}
        </span>
    `;
}