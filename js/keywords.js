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


// Find a keyword by ID
function getKeyword(keywordId) {

    const id = keywordId
        .toLowerCase()
        .replace(/-/g, "_");

    for (const category in keywordsData) {

        if (keywordsData[category][id]) {
            return keywordsData[category][id];
        }

    }

    return null;
}


// Used for item properties
// Example: "Heavy", "Two-handed", "Range (30/120)"
function formatKeyword(keywordText) {

    const match =
        keywordText.match(/^([^(]+?)(?:\s*\(.*\))?$/);

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
            data-description="${keyword.description.replace(/"/g, "&quot;")}"
        >
            ${keyword.name}
        </span>
    `;
}


// Used for normal text such as action descriptions
// categories determines which parts of keywords.json are searched
function formatKeywordsInText(text, categories = []) {

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
                        data-description="${keyword.description.replace(/"/g, "&quot;")}"
                    >
                        ${match}
                    </span>
                `
            );
        }
    }

    return result;
}


// Create the tooltip
function showKeywordTooltip(keyword) {

    // Remove existing tooltip
    document.querySelectorAll(".keyword-tooltip")
        .forEach(tooltip => tooltip.remove());

    const tooltip =
        document.createElement("div");

    tooltip.className = "keyword-tooltip";

    tooltip.textContent =
        keyword.dataset.description;

    document.body.appendChild(tooltip);

    const rect =
        keyword.getBoundingClientRect();

    tooltip.style.left =
        `${rect.left + window.scrollX}px`;

    tooltip.style.top =
        `${rect.bottom + window.scrollY + 5}px`;
}


// Remove tooltip
function hideKeywordTooltip() {

    document.querySelectorAll(".keyword-tooltip")
        .forEach(tooltip => tooltip.remove());

}


// CLICK
document.addEventListener("click", function(event) {

    const keyword =
        event.target.closest(".keyword");

    if (keyword) {

        event.stopPropagation();

        showKeywordTooltip(keyword);

        return;
    }

    hideKeywordTooltip();

});


// HOVER
document.addEventListener("mouseover", function(event) {

    const keyword =
        event.target.closest(".keyword");

    if (!keyword)
        return;

    showKeywordTooltip(keyword);

});