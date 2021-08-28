class Node {
    constructor(numCol){
        // Relational data       reference to adjacent nodes
        numCol = parseInt(numCol);
        this.up = -numCol;
        this.down = numCol;
        this.left = -1;
        this.right = 1;

        this.up_left = -numCol -1;
        this.up_right = -numCol + 1;
        this.down_left = numCol - 1;
        this.down_right = numCol + 1;

        // Booleans
        this.start = false;
        this.end = false;
        this.obstacle = false;

        // Pathfinding data
        this.g = null; // Distance from start, true distance, 
        this.h = null; // Distance to end, manhattan distance heuristic
        this.f = null; // F value, g + h

        this.head = null;
    }

    updateF() {
        this.f = this.g + this.h;
    }
}

class Nav {
    constructor(numCol, numRow) {
        this.numCol = numCol;
        this.numRow = numRow;

        this.startNode = null; // Index of the startNode in the Array
        this.endNode = null; // Index of the endNode in the Array

// **** Array Representing unfilled grid ****
        this.grid = [];
        for(let i = 0; i < numCol*numRow; i++) {
            this.grid.push(new Node(numCol));
        }
        this.setRelationalData();
// *******************************************

        this.open = []; // Visited but not expanded nodes
        this.close = []; // Visited and expanded nodes
    }

    setStart(startNode){
        if(startNode > this.numCol * this.numRow || startNode < 0) return;
        this.grid[startNode].start = true;
        this.grid[startNode].g = 0;
        this.startNode = startNode;
    }

    setEnd(endNode) {
        if(endNode > this.numCol * this.numRow || endNode < 0) return;
        this.grid[endNode].end = true;
        this.endNode = endNode;
    }

    setObstacle(obstacleNode) {
        if(obstacleNode > this.numCol * this.numRow || obstacleNode < 0) return;
        this.grid[obstacleNode].obstacle = true;
    }

    setRelationalData(){ // Set reference to adjacent nodes, out of bounds reference is null
        for(let i = 0; i < this.grid.length; i++){
            this.grid[i].up += i;
            if(this.grid[i].up < 0 || this.grid[i].up >= this.grid.length) this.grid[i].up = null;

            this.grid[i].down += i;
            if(this.grid[i].down < 0 || this.grid[i].down >= this.grid.length) this.grid[i].down = null;

            this.grid[i].left += i;
            if(this.grid[i].left < 0 || this.grid[i].left >= this.grid.length || i % this.numCol == 0) this.grid[i].left = null;

            this.grid[i].right += i;
            if(this.grid[i].right < 0 || this.grid[i].right >= this.grid.length || i % this.numCol == (this.numCol - 1)) this.grid[i].right = null;

            this.grid[i].up_left += i;
            if(this.grid[i].up_left < 0 || this.grid[i].up_left >= this.grid.length || i % this.numCol == 0) this.grid[i].up_left = null;

            this.grid[i].up_right += i;
            if(this.grid[i].up_right < 0 || this.grid[i].up_right >= this.grid.length || i % this.numCol == (this.numCol - 1)) this.grid[i].up_right = null;

            this.grid[i].down_left += i;
            if(this.grid[i].down_left < 0 || this.grid[i].down_left >= this.grid.length || i % this.numCol == 0) this.grid[i].down_left = null;

            this.grid[i].down_right += i;
            if(this.grid[i].down_right < 0 || this.grid[i].down_right >= this.grid.length || i % this.numCol == (this.numCol - 1)) {
                this.grid[i].down_right = null;
            }
        }
    }

    findDistance(node1, node2) { // Find the Manhattan(heuristic) distance between two points
        let across = Math.abs(node1 % this.numCol - node2 % this.numCol);
        let vert = parseInt((Math.max(node1, node2) - Math.min(node1, node2)) / this.numCol);
        return vert + across;
    }

    // Prevent path from traversing diagonal obstacles
    /**
     * Is currentNode on the opposite site of diagonal obstacles
     * @param {number} currentNode Current Node
     * @param {number} visitedNode Visited Node
     * @returns {boolean} - is the node on the opposite site of diagonal obstacles
     */

    isDiagonalObstacle(currentNode, visitedNode) {
        // If visitedNode is UpLeft of Current and Left and Top of Current are Obstacles
        console.log(currentNode);
        if (visitedNode === this.grid[currentNode[0]].up_left && this.grid[this.grid[currentNode[0]].left].obstacle && this.grid[this.grid[currentNode[0]].up].obstacle) return true;

        // If visitedNode is UpRight of Current and Right and Top of Current are Obstacles
        if (visitedNode === this.grid[currentNode[0]].up_right && this.grid[this.grid[currentNode[0]].right].obstacle && this.grid[this.grid[currentNode[0]].up].obstacle) return true;

        // If visitedNode is DownLeft of Current and Left and Down of Current are Obstacles
        if (visitedNode === this.grid[currentNode[0]].down_left && this.grid[this.grid[currentNode[0]].left].obstacle && this.grid[this.grid[currentNode[0]].down].obstacle) return true;

        // If visitedNode is DownRight of Current and Left and Down of Current are Obstacles
        if (visitedNode === this.grid[currentNode[0]].down_right && this.grid[this.grid[currentNode[0]].right].obstacle && this.grid[this.grid[currentNode[0]].down].obstacle) return true;


        return false;
    }


    visitNode(currentNode, visitedNode){
        console.log(currentNode);
        // Check if node is in Closed list, check if node is an obstacle, push to Open list if not there already, update g and f values
        if (visitedNode == null || this.grid[visitedNode].obstacle == true || this.close.findIndex(checkNode => checkNode[0] == visitedNode) != -1 || this.isDiagonalObstacle(currentNode, visitedNode)) return;

        if(this.open.findIndex(openNodes => openNodes[0] == visitedNode) != -1){ // If vNode is in Open
            if(this.grid[visitedNode].g > this.grid[currentNode[0]].g + this.findDistance(currentNode[0], visitedNode)){ // And newG is lower than oldG
                
                this.open.splice(
                    this.open.findIndex(node => node[0] == visitedNode && node[1] == this.grid[visitedNode].f),  //
                    this.open.findIndex(node => node[0] == visitedNode && node[1] == this.grid[visitedNode].f)+1); // Remove previous version
                
                
                
                this.grid[visitedNode].g = this.grid[currentNode[0]].g + this.findDistance(currentNode[0], visitedNode); // Update g and f values
                this.grid[visitedNode].updateF(); // Update f
                this.open.push([visitedNode, this.grid[visitedNode].f]); // Push updated visited node back to the open list
                this.grid[visitedNode].head = currentNode[0];
                return;
            }
            return;
        }
        // else we update g and f and push the node into the open list
        this.grid[visitedNode].g = this.grid[currentNode[0]].g + this.findDistance(currentNode[0], visitedNode);
        this.grid[visitedNode].updateF();
        this.open.push([visitedNode, this.grid[visitedNode].f]);
        this.grid[visitedNode].head = currentNode[0];
    }

    expandNode(currentNode){
        this.visitNode(currentNode, this.grid[currentNode[0]].up);          // Visit Up
        this.visitNode(currentNode, this.grid[currentNode[0]].down);        // Visit Down
        this.visitNode(currentNode, this.grid[currentNode[0]].left);        // Visit Left
        this.visitNode(currentNode, this.grid[currentNode[0]].right);       // Visit Right
        this.visitNode(currentNode, this.grid[currentNode[0]].up_left);     // Visit Up Left
        this.visitNode(currentNode, this.grid[currentNode[0]].up_right);    // Visit Up Right
        this.visitNode(currentNode, this.grid[currentNode[0]].down_left);   // Visit Down Left
        this.visitNode(currentNode, this.grid[currentNode[0]].down_right);  // Visit Down Right

        
        // Remove from Open, Push to Close
        this.close.push(
        this.open.splice(
            this.open.findIndex(node => node[0] == currentNode[0]), 
            this.open.findIndex(node => node[0] == currentNode[0])+1)[0]); 
    }
    // The code above is a bit of an abortion but since splice returns an array I will need to push the first element in said array

    storeShortestPath(cameFrom, current) { // Store and return shortest path, return value of a successful findPath function
        let totalPath = [];
        let head = this.grid[current[0]].head;
        totalPath.push(current[0]);
        while(head != null){
            totalPath.push(head);
            head = this.grid[head].head;
            }
        return totalPath;
    }

    findPath() { // Main algorithm implementation
        let cameFrom = [];

        if(this.startNode == null || this.endNode == null) return;
        for(let i = 0; i < this.grid.length; i++){
            this.grid[i].g = 0;
            this.grid[i].h = this.findDistance(i, this.endNode);
            this.grid[i].f = this.grid[i].g + this.grid[i].h;
        }
        
        let currentNode = [this.startNode, this.grid[this.startNode].f];
        this.open.push(currentNode);

        while(this.open.length > 0) {
            if(this.grid[currentNode[0]].end) return this.storeShortestPath(cameFrom, currentNode);   // If currentNode is endNode, we have found a path!
            this.expandNode(this.open[0]);                          // Expand node with lowest f value, visit surrounding nodes and push them into open list, pop current node into closed list

            this.open.sort((a, b) => a[1] - b[1]);                  // Sort open list in order of lowest to highest f value
            cameFrom.push(this.grid[currentNode[0]]);
            currentNode = this.open[0];
        }


        return -1;
    }
}





// Elements
let pathCanvas = document.getElementById("pathCanvas");
let columns = document.getElementById("numCol");
let rows = document.getElementById("numRow");
let generate = document.getElementById('generateGridButton');
let colNum = document.getElementById('colNum');
let rowNum = document.getElementById('rowNum');
let selectStart = document.getElementById('selectStart');
let selectFinish = document.getElementById('selectFinish');
let createObstacle = document.getElementById('createObstacle');
let calcPath = document.getElementById('calcPath');
let clearButton = document.getElementById('clearButton');
let delaySlider = document.getElementById('delay');
let pathNotFoundBanner = document.getElementById('pathNotFound');

let nodes;

// Check whether mouse is pressed or not since js doesn't do that natively
let bMousePressed = false;
document.body.onmousedown = () => {
    bMousePressed = true;
}
document.body.onmouseup = () => {
    bMousePressed = false;
}

// Variables
let numberOfRows = 50;
let numberOfColumns = 50;
let startPos;
let endPos;
let obsPos = [];
let grid;

let start = false;
let finish = false;
let obs = false;


let startSet = false;
let finishSet = false;
let gridSet = false;
let result;
let delayTime = 0;
let stopDrawingObstacles = false;

// Function declarations
function buildGrid(nrCol, nrRow) {
    pathCanvas.style.gridTemplateColumns = "repeat(" + nrCol + ", auto)";
    pathCanvas.style.gridTemplateRows = "repeat(" + nrRow + ", auto)";

    for(let i = 0; i < nrCol*nrRow; i++){
        let newNode = document.createElement("button");
        newNode.setAttribute("data-button", '');
        pathCanvas.appendChild(newNode);
    }
    stopDrawingObstacles = false;
}

function destroyGrid() {
    if(pathCanvas.childElementCount <= 0) return;
    pathCanvas.innerHTML = '';
    startSet = false;
    finishSet = false;
    gridSet = false;
    obsPos = [];
    pathNotFoundBanner.innerText = "";
}

function setNodeToStart(someNode, iterator){
    if(!start || startSet) return;
    if(obsPos.includes(iterator)) return;
    someNode.style.backgroundColor = 'green';
    startPos = iterator;
        startSet = true;
}

function setNodeToFinish(someNode, iterator){
    if(!finish || finishSet) return;
    if(obsPos.includes(iterator)) return;
    someNode.style.backgroundColor = 'blue';
    endPos = iterator;
    finishSet = true;
}

function setNodeToObstacle(someNode, iterator){
    if(!obs || stopDrawingObstacles) return;
    if(iterator == startPos || iterator == endPos) return;
    someNode.style.backgroundColor = 'black';
    if(obsPos.findIndex((check) =>  {
        return check == someNode;
    }) != -1) { 
        return; 
    }
    obsPos.push(iterator);
}

function resetButtonColor(button1, button2){
    button1.style.backgroundColor = "rgb(182, 103, 57)";
    button2.style.backgroundColor = "rgb(182, 103, 57)";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms), () => ms == 0);
}

async function drawPath(delay = 0){
    if(delay == 0){
        for(let i = result.length - 2; i > 0; i--){
            nodes[result[i]].style.backgroundColor = 'red';
        }
        return;
    }

    for(let i = result.length - 2; i > 0; i--){
        await sleep(delay);
        delay = 2000 - delaySlider.value;
        nodes[result[i]].style.backgroundColor = 'red';
    }
}

// EventHandlers
generate.addEventListener('click', () => { // Draw grid
    destroyGrid();
    numberOfColumns = columns.value;
    numberOfRows = rows.value;
    buildGrid(numberOfColumns, numberOfRows);
    grid = new Nav(numberOfColumns, numberOfRows);
    nodes = document.querySelectorAll("[data-button]");
    selectFinish.style.backgroundColor = 'rgb(182, 103, 57)';
    selectStart.style.backgroundColor = 'rgb(182, 103, 57)';
    createObstacle.style.backgroundColor = 'rgb(182, 103, 57)';

    start = false;
    finish = false;
    obs = false;

    for(let i = 0; i < nodes.length; i++){
        nodes[i].addEventListener('click', () => {
            setNodeToFinish(nodes[i], i);
            setNodeToStart(nodes[i], i);
            setNodeToObstacle(nodes[i], i);
        });
    }
    for(let i = 0; i < nodes.length; i++){  // Allows you to draw obstacle nodes on the canvas
        nodes[i].addEventListener('mouseover', () => {
            if(bMousePressed){
                setNodeToObstacle(nodes[i], i);
            }
        })
    }
    
    gridSet = true;
});

columns.oninput = function() {
    colNum.innerText = columns.value;
};

rows.oninput = function() {
    rowNum.innerText = rows.value;
};

selectStart.addEventListener('click', () => {
    if(start){
        selectStart.style.backgroundColor = "rgb(182, 103, 57)";
        start = false;
        return;
    }
    start = true;
    finish = false;
    obs = false;

    resetButtonColor(selectFinish, createObstacle);
    selectStart.style.backgroundColor = "seagreen";
});

selectFinish.addEventListener('click', () => {
    if(finish){
        selectFinish.style.backgroundColor = "rgb(182, 103, 57)";
        finish = false;
        return;
    }
    start = false;
    finish = true;
    obs = false;

    resetButtonColor(selectStart, createObstacle);
    selectFinish.style.backgroundColor = "royalblue";
});


createObstacle.addEventListener('click',() => {
    if(obs){
        createObstacle.style.backgroundColor = "rgb(182, 103, 57)";
        obs = false;
        return;
    }
    start = false;
    finish = false;
    obs = true;

    resetButtonColor(selectFinish, selectStart);
    createObstacle.style.backgroundColor = "grey";
});


clearButton.addEventListener('click', () => {
    destroyGrid();
    buildGrid(numberOfColumns, numberOfRows);

    selectFinish.style.backgroundColor = 'rgb(182, 103, 57)';
    selectStart.style.backgroundColor = 'rgb(182, 103, 57)';
    createObstacle.style.backgroundColor = 'rgb(182, 103, 57)';

    startSet = false;
    finishSet = false;
    obs = false;

    grid = new Nav(numberOfColumns, numberOfRows);
    nodes = document.querySelectorAll('[data-button]');
    for(let i = 0; i < nodes.length; i++){
        nodes[i].addEventListener('click', () => {
            setNodeToFinish(nodes[i], i);
            setNodeToObstacle(nodes[i], i);
            setNodeToStart(nodes[i], i);
        });
    }
    for(let i = 0; i < nodes.length; i++){  
        nodes[i].addEventListener('mouseover', () => {
            if(bMousePressed){
            setNodeToObstacle(nodes[i], i);
            }
        })
    }

    gridSet = true;
});

calcPath.addEventListener('click', () => {
    if(!startSet || !finishSet || !gridSet) return;
    stopDrawingObstacles = true;
    
    grid.setStart(startPos);
    grid.setEnd(endPos);
    for(let i = 0; i < obsPos.length; i++) {
        grid.setObstacle(obsPos[i]);
    }

    result = grid.findPath();
    console.log(grid.grid);

    if(result == -1){
        pathNotFoundBanner.innerText = "THERE IS NO PATH!!";
        return;
    }
    delayTime = 2000 - delaySlider.value;
    drawPath(delayTime);
});