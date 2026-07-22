let talentsData;


document.addEventListener("DOMContentLoaded",()=>{


fetch("js/talents.json")
.then(response=>response.json())
.then(data=>{

    talentsData=data;

    

});


document
.getElementById("talentTreeSelect")
.addEventListener("change",function(){

    loadTalentTree(this.value);

});


});


function loadTalentTree(treeName){

console.log("Talent tab:", document.getElementById("talents"));
    console.log("SVG:", document.getElementById("talentLines"));

    const container =
    document.getElementById("talentContainer");


    container.innerHTML="";


    const tree =
    talentsData.trees.find(
        t=>t.id===treeName
    );
const positions =
calculatePositions(tree.talents);
const treeOffsetX = 100;
const treeOffsetY = 50;
    if(!tree)
        return;



   const normalTalents =
tree.talents.filter(t =>
    !isStandaloneTalent(t, tree.talents)
);


const standaloneTalents =
tree.talents.filter(t =>
    isStandaloneTalent(t, tree.talents)
);

normalTalents.forEach(talent=>{

        let div=document.createElement("div");

        div.className="talent";
        div.id = talent.id;

        div.textContent=talent.name;


div.style.left =
positions[talent.id].x + treeOffsetX + "px";


div.style.top =
positions[talent.id].y + treeOffsetY + "px";



        container.appendChild(div);


    });
    
standaloneTalents.forEach((talent,index)=>{


    let div=document.createElement("div");

    div.className="talent";
    div.id=talent.id;

    div.textContent=talent.name;


    const columns = Math.floor(
    container.clientWidth / 150
); // talents per row


    const x =
    (index % columns) * 150;


    const y =
    700 + Math.floor(index / columns) * 100;


    div.style.left = x + "px";

    div.style.top = y + "px";


    container.appendChild(div);


});

resizeTalentContainer(tree);
    drawTalentLines(tree);



}

function getTalentDepth(talent, allTalents){

    if(!talent.requires || talent.requires.length === 0){
        return 0;
    }


    let depths = talent.requires.map(req=>{

        let parent = allTalents.find(
            t=>t.id === req
        );

        return getTalentDepth(parent, allTalents);

    });


    return Math.max(...depths)+1;

}
function drawTalentLines(tree){

    const svg =
    document.getElementById("talentLines");


    if(!svg){
        console.log("SVG LOST BEFORE DRAW");
        return;
    }


    svg.innerHTML="";


    tree.talents.forEach(talent=>{


        if(!talent.requires)
            return;



        const child =
        document.getElementById(talent.id);



        if(!child)
            return;



        talent.requires.forEach(req=>{


            const parent =
            document.getElementById(req);



            console.log(
                talent.name,
                "requires",
                req,
                "parent:",
                parent
            );



            if(!parent)
                return;



            const x1 =
            parent.offsetLeft +
            parent.offsetWidth / 2;


            const y1 =
            parent.offsetTop +
            parent.offsetHeight;



            const x2 =
            child.offsetLeft +
            child.offsetWidth / 2;


            const y2 =
            child.offsetTop;



            const line =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );


            line.setAttribute("x1",x1);
            line.setAttribute("y1",y1);

            line.setAttribute("x2",x2);
            line.setAttribute("y2",y2);

            line.setAttribute(
                "stroke",
                "black"
            );

            line.setAttribute(
                "stroke-width",
                "3"
            );

console.log(
    "LINE",
    x1,y1,
    x2,y2
);
            svg.appendChild(line);


        });


    });


}

function isStandaloneTalent(talent, allTalents){

    // Has a parent?
    if(talent.requires && talent.requires.length > 0)
        return false;


    // Does another talent point to it?
    const used =
    allTalents.some(t =>
        t.requires &&
        t.requires.includes(talent.id)
    );


    if(used)
        return false;


    return true;

}
function calculatePositions(talents){


    let positions = {};


    let roots =
    talents.filter(t =>
        !t.requires ||
        t.requires.length === 0
    );


    roots.forEach((talent,index)=>{

        positions[talent.id]={
            x:index*150,
            y:0
        };

    });



    function placeChildren(talent){


        let children =
        talents.filter(t =>
            t.requires &&
            t.requires.includes(talent.id)
        );


        if(children.length === 0)
            return;



        let spacing = 120;

if(children.length > 4){
    spacing = 80;
}


let start =
positions[talent.id].x -
((children.length-1)*spacing)/2;


        children.forEach((child,index)=>{


            positions[child.id]={

                x:start + index*120,

                y:positions[talent.id].y + 120

            };


            placeChildren(child);


        });


    }


    roots.forEach(placeChildren);


    return positions;

}
function resizeTalentContainer(){

    const container =
    document.getElementById("talentContainer");


    let maxX = 0;
    let maxY = 0;


    document.querySelectorAll(".talent")
    .forEach(t=>{

        maxX = Math.max(
            maxX,
            t.offsetLeft + t.offsetWidth
        );


        maxY = Math.max(
            maxY,
            t.offsetTop + t.offsetHeight
        );

    });


    container.style.width =
    maxX + 100 + "px";


    container.style.height =
    maxY + 100 + "px";

}