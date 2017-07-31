function Brain(a_inputs,a_outputs) {
    var self = this;
    // Array of nodes to be executed from 0 - N
    var nodes = new Array(100);
    // Map of connections between nodes, indexed by source node index
    var connections = {};

    var inputs = a_inputs;
    var outputs = a_outputs;

    // The index of the first non-input node
    var firstNodeIndex = 0;
    // The index of the last non-input node
    var lastNodeIndex = nodes.length-1;

    // Setup input nodes
    for (var inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
        nodes[firstNodeIndex++] = new Node(null,null,false,inputs[inputIndex].func,inputIndex);
    }

    // Setup output nodes
    for (var outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
        var func = outputs[outputIndex].func;
        nodes[lastNodeIndex] = new Node(func,null,true,null,lastNodeIndex--);
    }

    this.deepClone = function() {
        console.log("deep clone");
        this.log();
        var clone = new Brain(a_inputs,a_outputs);
        this.log();

        for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            if (nodes[nodeIndex]) {
                clone.setNode(nodes[nodeIndex].deepClone(),nodeIndex);
            }
        }

        for (var connectionKey in connections) {
            for (var connectionIndex = 0; connectionIndex < connections[connectionKey].length; connectionIndex++) {
                clone.addConnection(connections[connectionKey][connectionIndex].deepClone(),connectionKey);
            }
        }

        console.log("old");
        this.log();
        console.log("new");
        clone.log();

        return clone;
    };

    this.log = function() {
        console.log(nodes);
        console.log(connections);
    };

    this.addConnection = function (connection,connectionKey) {
        if (!connections[connectionKey]) {
            connections[connectionKey] = [];
        }
        connections[connectionKey].push(connection);
    };

    this.setNode = function(node,nodeIndex) {
        nodes[nodeIndex] = node;
    };

    this.getNode = function(index) {
        return nodes[index];
    };

    this.eval = function(actor) {
        for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            var sourceNode = nodes[nodeIndex];
            if (sourceNode) {
                var connectionsAtIndex = connections[nodeIndex] || [];
                for (var connectionIndex = 0; connectionIndex < connectionsAtIndex.length; connectionIndex++) {
                    var connection = connectionsAtIndex[connectionIndex];
                    var destNode = nodes[connection.getDestIndex()];
                    if (destNode) {
                        connection.fire(sourceNode,destNode);
                    }
                }
                if (sourceNode.getIndex() > lastNodeIndex) {
                    sourceNode.executeOutput(ACTOR);
                }
                sourceNode.setNullVal(actor);
            }
        }
    };

    this.getRandomSourceNode = function() {
        var node = null;
        for (var limit = 0; !node && limit < 100; limit++) {
            node = nodes[randomIntFromInterval(0,lastNodeIndex+1)];
        }
        return node;
    };

    this.getRandomDestNode = function(sourceNode) {
        var destNode = null;

        // net node
        for(var limit = 0; limit < 100 && !destNode; limit++) {
            var node = nodes[randomIntFromInterval(sourceNode.getIndex()+1,nodes.length)];
            if (sourceNode.isBinary() && node && node.isBinary()) {
                destNode = node;
            } else if (!sourceNode.isBinary()) {
                destNode = node;
            }
        }
        return destNode;
    };

    this.getRandomFunction = function(sourceNode, destNode) {
        if (sourceNode.isBinary() && destNode.isBinary()) {
            return BinaryToBinaryConnectionFunctions[randomIntFromInterval(0,BinaryToBinaryConnectionFunctions.length)];
        } else if (!sourceNode.isBinary() && destNode.isBinary()) {
            return DiscreteToBinaryConnectionFunctions[randomIntFromInterval(0,DiscreteToBinaryConnectionFunctions.length)];
        } else if (!sourceNode.isBinary() && !destNode.isBinary()) {
            return DiscreteToDescreteConnectionFunctions[randomIntFromInterval(0,DiscreteToDescreteConnectionFunctions.length)];
        }
    };

    function mutateNewNode() {
        // Add new node
        for (var limit = 0; limit < 100; limit++) {
            var nodeIndex = randomIntFromInterval(firstNodeIndex,lastNodeIndex+1);
            if (!nodes[nodeIndex]) {
                var binary = !!randomIntFromInterval(0,2);
                var combinatorFunc = null;
                var combinatorFunction = binary ?
                    BinaryCombinatorFunctions[randomIntFromInterval(0,BinaryCombinatorFunctions.length)] :
                    DiscreteCombinatorFunctions[randomIntFromInterval(0,DiscreteCombinatorFunctions.length)];
                nodes[nodeIndex] = new Node(null,combinatorFunc,binary,null,nodeIndex);
                break;
            }
        }
    };

    function mutateNewConnection() {
        // Add new connection
        for (var limit = 0; limit < 100; limit++) {
            var sourceNode = self.getRandomSourceNode();
            if (sourceNode) {
                var destNode = self.getRandomDestNode(sourceNode);
                if (destNode) {
                    var coef = Math.random();
                    var func = self.getRandomFunction(sourceNode,destNode);
                    self.addConnection(new Connection(sourceNode.getIndex(),destNode.getIndex(),coef,func),sourceNode.getIndex());
                    break;
                }
            }
        }

    }

    this.mutate = function() {
        if (randomIntFromInterval(0,100) < 20){
            mutateNewNode();
        }

        if (randomIntFromInterval(0,100) < 40){
            mutateNewConnection();
        }
    };
};
