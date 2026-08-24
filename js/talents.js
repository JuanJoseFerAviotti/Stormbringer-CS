let talentsData;
let currentTalentTree = "creation";

document.addEventListener("DOMContentLoaded", () => {
  fetch("js/talents.json")
    .then((response) => response.json())
    .then((data) => {
      talentsData = data;

      updateTalentTreeSelector();

      if (document.getElementById("talentTreeSelect").options.length > 0) {
        loadTalentTree(currentTalentTree);
      }
    });

  document
    .getElementById("talentTreeSelect")
    .addEventListener("change", function () {
      currentTalentTree = this.value;

      loadTalentTree(currentTalentTree);
    });
});

function loadTalentTree(treeName) {
  currentTalentTree = treeName;

  const select = document.getElementById("talentTreeSelect");

  if (select) select.value = treeName;
  console.log("Talent tab:", document.getElementById("talents"));
  console.log("SVG:", document.getElementById("talentLines"));

  const container = document.getElementById("talentContainer");

  container.innerHTML = "";

  const tree = talentsData.trees.find((t) => t.id === treeName);
  const positions = calculatePositions(tree.talents);
  const treeOffsetX = 100;
  const treeOffsetY = 50;
  if (!tree) return;

  const normalTalents = tree.talents.filter(
    (t) => !isStandaloneTalent(t, tree.talents),
  );

  const standaloneTalents = tree.talents.filter((t) =>
    isStandaloneTalent(t, tree.talents),
  );

  normalTalents.forEach((talent) => {
    let div = document.createElement("div");

    div.className = "talent";
    div.id = talent.id;
    div.addEventListener("mouseenter", (e) => {
      showTalentTooltip(e, talent);
    });

    div.addEventListener("mousemove", (e) => {
      moveTalentTooltip(e);
    });

    div.addEventListener("mouseleave", () => {
      hideTalentTooltip();
    });

    div.innerHTML = `
    <div>${talent.name}</div>
    <small>${getTalentRank(talent.id)} / ${talent.maxRank}</small>
`;
    div.addEventListener("click", () => {
      buyTalent(talent);
    });

    div.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      unlearnTalent(talent);
    });
    if (hasTalent(talent.id)) div.classList.add("owned");

    div.style.left = positions[talent.id].x + treeOffsetX + "px";

    div.style.top = positions[talent.id].y + treeOffsetY + "px";

    container.appendChild(div);
  });

  standaloneTalents.forEach((talent, index) => {
    let div = document.createElement("div");

    div.className = "talent";
    div.id = talent.id;
    div.addEventListener("mouseenter", (e) => {
      showTalentTooltip(e, talent);
    });

    div.addEventListener("mousemove", (e) => {
      moveTalentTooltip(e);
    });

    div.addEventListener("mouseleave", () => {
      hideTalentTooltip();
    });

    div.innerHTML = `
    <div>${talent.name}</div>
    <small>${getTalentRank(talent.id)} / ${talent.maxRank}</small>
`;
    div.addEventListener("click", () => {
      buyTalent(talent);
    });

    div.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      unlearnTalent(talent);
    });
    if (hasTalent(talent.id)) div.classList.add("owned");

    const columns = Math.floor(container.clientWidth / 150); // talents per row

    const x = (index % columns) * 150;

    const y = 700 + Math.floor(index / columns) * 100;

    div.style.left = x + "px";

    div.style.top = y + "px";

    container.appendChild(div);
  });

  resizeTalentContainer(tree);
  drawTalentLines(tree);
}

function getTalentDepth(talent, allTalents) {
  if (!talent.requires || talent.requires.length === 0) {
    return 0;
  }

  let depths = talent.requires.map((req) => {
    let parent = allTalents.find((t) => t.id === req);

    return getTalentDepth(parent, allTalents);
  });

  return Math.max(...depths) + 1;
}
function drawTalentLines(tree) {
  const svg = document.getElementById("talentLines");

  if (!svg) {
    console.log("SVG LOST BEFORE DRAW");
    return;
  }

  svg.innerHTML = "";

  tree.talents.forEach((talent) => {
    if (!talent.requires) return;

    const child = document.getElementById(talent.id);

    if (!child) return;

    talent.requires.forEach((req) => {
      const parent = document.getElementById(req);

      if (!parent) return;

      const x1 = parent.offsetLeft + parent.offsetWidth / 2;

      const y1 = parent.offsetTop + parent.offsetHeight;

      const x2 = child.offsetLeft + child.offsetWidth / 2;

      const y2 = child.offsetTop;

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );

      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);

      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);

      line.setAttribute("stroke", "black");

      line.setAttribute("stroke-width", "3");

      
      svg.appendChild(line);
    });
  });
}

function isStandaloneTalent(talent, allTalents) {
  // Has a parent?
  if (talent.requires && talent.requires.length > 0) return false;

  // Does another talent point to it?
  const used = allTalents.some(
    (t) => t.requires && t.requires.includes(talent.id),
  );

  if (used) return false;

  return true;
}
function calculatePositions(talents) {
  let positions = {};

  let roots = talents.filter((t) => !t.requires || t.requires.length === 0);

  roots.forEach((talent, index) => {
    positions[talent.id] = {
      x: index * 150,
      y: 0,
    };
  });

  function placeChildren(talent) {
    let children = talents.filter(
      (t) => t.requires && t.requires.includes(talent.id),
    );

    if (children.length === 0) return;

    let spacing = 120;

    if (children.length > 4) {
      spacing = 80;
    }

    let start = positions[talent.id].x - ((children.length - 1) * spacing) / 2;

    children.forEach((child, index) => {
      positions[child.id] = {
        x: start + index * 120,

        y: positions[talent.id].y + 120,
      };

      placeChildren(child);
    });
  }

  roots.forEach(placeChildren);

  return positions;
}
function resizeTalentContainer() {
  const container = document.getElementById("talentContainer");

  let maxX = 0;
  let maxY = 0;

  document.querySelectorAll(".talent").forEach((t) => {
    maxX = Math.max(maxX, t.offsetLeft + t.offsetWidth);

    maxY = Math.max(maxY, t.offsetTop + t.offsetHeight);
  });

  container.style.width = maxX + 100 + "px";

  container.style.height = maxY + 100 + "px";
}
function hasTalent(id) {
  return character.talents[id] !== undefined;
}
function meetsRequirements(talent) {
  if (!talent.requires || talent.requires.length === 0) return true;

  return talent.requires.every((id) => {
    let parent = getCurrentTree().talents.find((t) => t.id === id);

    return getTalentRank(id) >= parent.maxRank;
  });
}
function buyTalent(talent) {
  let rank = getTalentRank(talent.id);

  if (rank >= talent.maxRank) return;

  if (!meetsRequirements(talent)) return;

  if (getAvailablePoints() < 4) return;

  character.talents[talent.id] = rank + 1;

  saveCharacter();

  loadTalentTree(currentTalentTree);
  MagicSystems();
  updateStats();
  updateLiveBloodTable();
  updateActionsTable();
}
function unlearnTalent(talent) {
  let rank = getTalentRank(talent.id);

  if (rank <= 0) return;

  if (hasDependentTalents(talent.id)) return;

  character.talents[talent.id] = rank - 1;

  if (character.talents[talent.id] === 0) delete character.talents[talent.id];

  saveCharacter();

  loadTalentTree(currentTalentTree);
  updateStats();
  MagicSystems();
  updateLiveBloodTable();
  updateActionsTable();
}
function getTalentRank(id) {
  return character.talents[id] || 0;
}
function getSpentPoints() {
  let spent = 0;

  for (const stat in character.investedStats) {
    spent += Rules.getStatCost(getStatScore(stat));
  }

  for (const talentId in character.talents) {
    spent += character.talents[talentId] * 4;
  }

  return spent;
}
function getMaxTalentPoints() {
  return character.level;
}

function getCurrentTree() {
  const treeName = document.getElementById("talentTreeSelect").value;

  return talentsData.trees.find((t) => t.id === treeName);
}
function hasDependentTalents(talentId) {
  for (const tree of talentsData.trees) {
    for (const talent of tree.talents) {
      if (
        talent.requires &&
        talent.requires.includes(talentId) &&
        getTalentRank(talent.id) > 0
      ) {
        return true;
      }
    }
  }

  return false;
}
function updateTalentTreeSelector() {
  const select = document.getElementById("talentTreeSelect");

  const selected = currentTalentTree;

  select.innerHTML = "";

  const stats = Rules.getFinalStats(character);

  talentsData.trees.forEach((tree) => {
    if (stats[tree.requiredStat] < tree.minimumStat) return;

    const option = document.createElement("option");

    option.value = tree.id;
    option.textContent = tree.name;

    select.appendChild(option);
  });

  if ([...select.options].some((o) => o.value === selected)) {
    select.value = selected;
  } else {
    currentTalentTree = select.value;
  }
}
function showTalentTooltip(event, talent) {
  const tooltip = document.getElementById("talentTooltip");

  tooltip.textContent = talent.description || "No description.";

  tooltip.style.display = "block";

  moveTalentTooltip(event);
}

function moveTalentTooltip(event) {
  const tooltip = document.getElementById("talentTooltip");

  tooltip.style.left = event.clientX + 15 + "px";

  tooltip.style.top = event.clientY + 15 + "px";
}

function hideTalentTooltip() {
  document.getElementById("talentTooltip").style.display = "none";
}
