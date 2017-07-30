var x0 = 270;
function randomIntFromInterval(min,max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
var MAX_SCORE = 0;
var LAST_MUTATION = 0;
var LAST_FIT = 0;
var LAST_TURN = 0;
var earth = new Image();
var maxAgeFunc = function(maxScore) {
    return generations < 10 ? maxScore + 100 : 0;
}
var DiscreteNodeInitFunctions = [
    function() {return 0;},
    function() {return Math.random();},
    function() {return Math.random() * (Math.pow(10,Math.random()))},
]
var BinaryToBinaryConnectionFunctions = [
    function(val,coef) { return val },
    function(val,coef) { return !val }
];
var DiscreteToBinaryConnectionFunctions = [
    function(val,coef) { return val > coef },
    function(val,coef) { return val < coef },
    function(val,coef) { return val == coef }
];
var DiscreteToDescreteConnectionFunctions = [
    function(val,coef) { return val * val },
    function(val,coef) { return val * coef },
    function(val,coef) { return val / coef },
    function(val,coef) { return val + coef },
    function(val,coef) { return val - coef },
    function(val,coef) { return val },
    function(val,coef) { return coef }
];

function Actor() {
    this.x = x0;
    this.y = 150;
    this.dir = 0;
    this.dist = 0;
    this.age = 0;
    this.maxX = this.x;
    this.minX = this.x;
    this.maxY = this.y;
    this.minY = this.y;
    this.turned = 0;
    this.moved = false;
    this.stillInARow = 0;
    
    this.reset = function () {
        this.turned = 0;
        this.moved = false;
    }
    
    this.crashed = function() {
        return this.x < 0 || this.y < 0 || this. x > 300 || this.y > 300;
    }
    
    this.getFitness = function () {
        var crashBonus = this.crashed() ? -40 : -40;
        return Math.max(0,/*this.dist/1000 * */(this.maxX - x0)*10 + (x0 - this.minX)*10 + (this.maxY - 150)*10 + (150 - this.minY)*10 + crashBonus);
    }
    
    this.isDead = function() {
        if (!this.moved) {
            this.stillInARow ++;
        }
        this.reset();
        return this.turned > 1 || this.crashed() || this.stillInARow > 10 || this.getFitness() > MAX_SCORE+Math.max(100,iterations-LAST_TURN)|| this.age-LAST_TURN> 40;
    };
    
    this.getInputs = function() {
        return [
            new Node(null,false,function(){ return this.dir;},0),
            new Node(null,false,function(){ return this.x;},0),
            new Node(null,false,function(){ return this.y;},0),
            new Node(null,false,function(){ return this.age;},0),
        ];
    };
    
    this.getOutputs = function() {
        return [
            /*new Node(function(){actor.move();},true,null,0),*/
            new Node(this.rotateLeft,true,null,0),
            new Node(this.rotateRight,true,null,0)
        ];
    };
    
    this.move = function() {
        this.stillInARow = 0;
        this.moved = true;
        if (!this.x || !this.y)
        {
            null.length;
        }
        this.x += Math.cos(this.dir * Math.PI / 180);
        this.y += Math.sin(this.dir * Math.PI / 180);
        this.dist += 1;
        this.maxX = Math.max(this.x,this.maxX);
        this.minX = Math.max(this.x,this.minX);
        this.maxY = Math.max(this.y,this.maxY);
        this.minY = Math.min(this.y,this.minY);
    };

    this.rotateRight = function() {
        this.turned ++;
        actor.dir = (actor.dir + 2) % 360;
    };
    
    this.rotateLeft = function() {
        this.turned ++;
        actor.dir = (actor.dir - 2) % 360;
    };
};

var actor = new Actor();

function Brain() {
    this.nodes = new Array(1000); // Array of nodes executed from 0 - N
    this.connections = {}; // Map of connections between nodes, indexed by source node
    this.inputConnections = {};
    this.inputs = actor.getInputs();
    this.outputs = actor.getOutputs();
    this.deepClone = function() {
        var clone = new Brain();
        for (var nodeIndex = 0; nodeIndex < this.nodes.length; nodeIndex++) {
            if (this.nodes[nodeIndex]) {
                clone.nodes[nodeIndex] = this.nodes[nodeIndex].deepClone();
            }
        }
        
        for (var connectionKey in this.inputConnections ) {
            for (var ci = 0; ci < this.inputConnections[connectionKey].length; ci++ ) {
                if (this.inputConnections[connectionKey][ci]) {
                    if (!clone.inputConnections[connectionKey]) {
                        clone.inputConnections[connectionKey] = [];
                    }
                    clone.inputConnections[connectionKey][ci] = this.inputConnections[connectionKey][ci].deepCloneInput(clone);
                }
            }
        }
        
        for (var connectionKey in this.connections) {
            for (var ci = 0; ci < this.connections[connectionKey].length; ci++ ) {
                if (this.connections[connectionKey][ci] ) {
                    if (!clone.connections[connectionKey]) {
                        clone.connections[connectionKey] = [];
                    }
                    clone.connections[connectionKey][ci] = this.connections[connectionKey][ci].deepCloneNet(clone);
                }
            }
        }

        return clone;
    };
    this.inputNodeAtIndex = function(index) {
        return this.inputs[index];
    };
    this. getInputNodeIndex = function(node) {
        return this.inputs.indexOf(node);
    };
    this.outputNodeAtIndex = function(index) {
        return this.outputs[index];
    };
    this.nodeAtIndex = function(index) {
        return this.nodes[index];
    };
    this. getNodeIndex = function(node) {
        return this.nodes.indexOf(node);
    };
    this.eval = function() {
        // Eval inputs
        for (var i = 0; i < this.inputs.length; i++) {
            var connections = this.inputConnections[i] || [];
            for (var j = 0; j < connections.length; j++)
            {
                connections[j].calc();
            }
        }
        
        // Eval net
        for (var i = 0; i < this.nodes.length; i++) {
            var connections = this.connections[i] || [];
            for (var j = 0; j < connections.length; j++)
            {
                connections[j].calc();
            }
            if (this.nodes[i])
            {
                this.nodes[i].reset();
            }
        }
        
        // Eval outputs
        for (var i = 0; i < this.outputs.length; i++) {
            this.outputs[i].executeOutput();
            this.outputs[i].reset();
        }
    };
    this.getSourceNode = function() {
        var node = null;
        var index = null;
        var limit = 0;
        while (node == null && limit < 100) {
            limit += 1;
            index = randomIntFromInterval(0,this.nodes.length);
            node = this.nodes[index];
        }
        return {"node": node, "index": index};
    };
    this.getDestNode = function(sourceNode,sourceNodePosition /* the index in this.nodes */) {
        var destNode = null;
        if (randomIntFromInterval(0,this.nodes.length) < this.nodes.length / 10)
        {
            // Small chance of chosing an output node
            if (sourceNode.isBinary)
            {
                // If the source is binary then so must be the destination
                for(var i = 0; i < 100 && !destNode; i++) {
                    var node = this.outputs[randomIntFromInterval(0,this.outputs.length)];
                    if (node.isBinary) {
                        destNode = node;
                    }
                }
            } else {
                destNode = this.outputs[randomIntFromInterval(0,this.outputs.length)];
            }
        } else {
            // net node
            for(var i = 0; i < 100 && !destNode; i++) {
                var node = this.nodes[randomIntFromInterval(sourceNodePosition+1,this.nodes.length)];
                if (sourceNode.isBinary && node && node.isBinary) {
                    destNode = node;
                } else if (!sourceNode.isBinary) {
                    destNode = node;
                }
            }
        }
        return destNode;
    };
    this.getRandomFunction = function(sourceNode, destNode) {
        if (sourceNode.isBinary && destNode.isBinary) {
            return BinaryToBinaryConnectionFunctions[randomIntFromInterval(0,BinaryToBinaryConnectionFunctions.length)];
        } else if (!sourceNode.isBinary && destNode.isBinary) {
            return DiscreteToBinaryConnectionFunctions[randomIntFromInterval(0,DiscreteToBinaryConnectionFunctions.length)];
        } else if (!sourceNode.isBinary && !destNode.isBinary) {
            return DiscreteToDescreteConnectionFunctions[randomIntFromInterval(0,DiscreteToDescreteConnectionFunctions.length)];
        }
    };
    this.mutate = function() {
        if (randomIntFromInterval(0,this.nodes.length) < this.nodes.length / 40) {
            for(var newNodeLimit = 0; newNodeLimit < 100; newNodeLimit++)
            {
                var newNodeIndex = randomIntFromInterval(0,this.nodes.length);
                if (!this.nodes[newNodeIndex]) {
                    this.nodes[newNodeIndex] = new Node(null,randomIntFromInterval(0,10) < 5,DiscreteNodeInitFunctions[randomIntFromInterval(0,DiscreteNodeInitFunctions.length)],newNodeIndex);
                    break;
                }
            }
        }
        if (randomIntFromInterval(0,this.nodes.length) < this.nodes.length / 40) {
            // Small chance of adding an input connection
            var inputIndex = randomIntFromInterval(0,this.inputs.length);
            var inputNode = this.inputs[inputIndex];
            var destNode = this.getDestNode(inputNode,-1);
            if (destNode) {
                var coef = Math.random();
                var func = this.getRandomFunction(inputNode, destNode);
                
                if (!this.inputConnections[inputIndex]) {
                    this.inputConnections[inputIndex] = [];
                }
                console.log("destNode", destNode);
                this.inputConnections[inputIndex].push( new Connection(inputNode, destNode, coef, func, inputIndex) );
            }
        } else {
            var source = this.getSourceNode();
            var sourceIndex = source.index;
            var sourceNode = source.node;
            if (sourceNode) {
                var destNode = this.getDestNode(sourceNode,sourceIndex);
                if (destNode) {
                    var coef = Math.random();
                    var func = this.getRandomFunction(sourceNode, destNode);
                    
                    if (!this.connections[sourceIndex])
                    {
                        this.connections[sourceIndex] = [];
                    }
                    this.connections[sourceIndex].push( new Connection(sourceNode, destNode, coef, func, -1) );
                }
            }
        }
    };
}
var brain = new Brain();

var mutatedBrain = brain.deepClone();

function Connection(sourceNode,destNode,coef,func,inputIndex,outputIndex) {
    this.val = 0;
    this.source = sourceNode;
    this.dest = destNode;
    this.coef = coef;
    this.func = func;
    this.inputIndex = inputIndex;
    this.outputIndex = outputIndex;
    
    this.deepCloneInput = function(newBrain) {
        var sourceNode = newBrain.inputNodeAtIndex(this.source.index);
        var destNode = newBrain.nodeAtIndex(this.dest.index);
        if (sourceNode && destNode) {
            return new Connection(sourceNode,destNode,this.coef,this.func,this.inputIndex,this.outputIndex);
        } else {
            console.log("ERROR");
        }
    }

    this.deepCloneNet = function(newBrain) {
        var sourceNode = newBrain.nodeAtIndex(this.source.index);
        var destNode = this.dest.outputFunc ? newBrain.outputNodeAtIndex(this.dest.index) : newBrain.nodeAtIndex(this.dest.index);
        return new Connection(sourceNode,destNode,this.coef,this.func,this.inputIndex,this.outputIndex);
    }
    
    this.calc = function() {
        if (this.dest.isBinary) {
            this.func(sourceNode.val,this.coef) ? this.dest.trueVotes += 1: this.dest.falseVotes += 1;
        } else {
            this.dest.val += this.func(sourceNode.val,this.coef);
        }
    };
}

function Node(outputFunc,isBinary,initFunc,index) {
    this.isBinary = isBinary;
    this.initFunc = initFunc;
    this.outputFunc = outputFunc;
    this.index = index;
    
    this.deepClone = function() {
        return new Node(this.outputFunc,this.isBinary,this.initFunc,this.index);
    }
    
    this.reset = function() {
        this.val = this.initFunc ? this.initFunc() : null; // Non-binary outputs use value
        this.trueVotes = 0;
        this.falseVotes = 0;
    }

    this.add = function(a_val) {
        this.val += a_val;
    }
    
    this.sub = function(a_val) {
        this.val += a_val;
    }
    
    this.executeOutput = function() {
        if (outputFunc) {
            if (this.isBinary && this.trueVotes > this.falseVotes )
            {
                this.outputFunc(this.val);
            } else if (!this.isBinary)
            {
                this.outputFunc(this.val);
            }
        }
    }
    
    this.reset();
}

function init() {
    earth.src = 'http://www.bludor.com/magazine/wp-content/themes/tma/images/bg/arrow.png';
    window.requestAnimationFrame(draw);
}

var iterations = 0;
var generations = 0;
var display = false;
function step() {
    //console.log(actor.age,LAST_TURN,actor.getFitness());
    mutatedBrain.eval();
    actor.age += 1;
    actor.move();
    if (LAST_FIT != actor.getFitness()) {
        LAST_TURN = actor.age;
    }
    LAST_FIT = actor.getFitness();
    if (actor.isDead()) {
        console.log("mutated")
        console.log(mutatedBrain.nodes);
        console.log(mutatedBrain.connectionns);
        console.log(mutatedBrain.inputConnections);
        console.log("brain")
        console.log(brain.nodes);
        console.log(brain.connections);
        console.log(brain.inputConnections);
        console.log(actor.getFitness(), MAX_SCORE);
        if (actor.getFitness() > MAX_SCORE) {
            brain = mutatedBrain.deepClone();
            console.log("SUCCESS");
            generations++;
            console.log("Generation ", generations);
            LAST_MUTATION = iterations;
        }
        mutatedBrain = brain.deepClone();
        MAX_SCORE = Math.max(MAX_SCORE,actor.getFitness());
        actor = new Actor();
        console.log(iterations);
        iterations ++;
        if (iterations % 5 == 0) {
            display = true;
        }
        if (iterations % 5 == 1) {
            display = false;
        }
        if (MAX_SCORE > 100) return;
        for (var i = 0; i < Math.max(Math.min(iterations-(LAST_MUTATION/6),400),10); i++) {
            mutatedBrain.mutate();
        }
    }
}

function draw() {
    step();
    
    if (display || true)
    {
        var ctx = document.getElementById('VIEWPORT').getContext('2d');
        ctx.globalCompositeOperation = 'destination-over';
        ctx.clearRect(0, 0, 300, 300); // clear canvas

        ctx.save();

        // Draw actor
        ctx.translate(actor.x,actor.y);
        ctx.rotate(actor.dir *Math.PI/180);
        ctx.translate(-earth.height/2, -earth.width/2);
        ctx.drawImage(earth, 0, 0);
        ctx.restore();
        
    }

    window.requestAnimationFrame(draw);
}

$(document).ready(function (){
    init();
});
