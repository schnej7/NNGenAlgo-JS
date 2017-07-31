function Brain(a_inputs,a_outputs) {
    // Array of nodes to be executed from 0 - N
    nodes = new Array(1000);
    // Map of connections between nodes, indexed by source node index
    connections = {};

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
        nodes[lastNodeIndex--] = new Node(func,null,false,null,lastNodeIndex);
    }

    this.deepClone = function() {
        var clone = new Brain(a_inputs,a_outputs);

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
        for (var nodeIndex = 0; nodeIndex <= nodes.length; nodeIndex++) {
            var sourceNode = nodes[nodeIndex];
            if (sourceNode) {
                sourceNode.setNullVal(actor);
                var connectionsAtIndex = connections[nodeIndex] || [];
                for (var connectionIndex = 0; connectionIndex < connectionsAtIndex.length; connectionIndex++) {
                    var connection = connectionsAtIndex[connectionIndex];
                    var destNode = nodes[connection.getDestIndex()];
                    if (destNode) {
                        connection.fire(sourceNode,destNode);
                    }
                }
                nodes[nodeIndex].executeOutput(ACTOR);
            }
        }
    };

    this.getRandomSourceNode = function() {
        var node = null;
        for (var limit = 0; !node && limit < 100; limit++) {
            node = nodes[randomIntFromInterval(0,lastNodeIndex)+1];
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

    this.mutate = function() {
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

        // Add new connection
        for (var limit = 0; limit < 100; limit++) {
            var sourceNode = this.getRandomSourceNode()
            if (sourceNode) {
                if (!connections[sourceNode.getIndex()]) {
                    connections[sourceNode.getIndex()] = [];
                }
                var destNode = this.getRandomDestNode(sourceNode);
                if (destNode) {
                    var coef = randomIntFromInterval(Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER);
                    var func = null;
                    if (sourceNode.isBinary() && destNode.isBinary()) {
                        func = BinaryToBinaryConnectionFunctions[randomIntFromInterval(0,BinaryToBinaryConnectionFunctions.length+1)];
                    } else if (!sourceNode.isBinary() && destNode.isBinary()) {
                        func = DiscreteToBinaryConnectionFunctions[randomIntFromInterval(0,DiscreteToBinaryConnectionFunctions.length+1)];
                    } else if (!sourceNode.isBinary() && !destNode.isBinary()) {
                        func = DiscreteToDescreteConnectionFunctions[randomIntFromInterval(0,DiscreteToDescreteConnectionFunctions.length+1)];
                    }
                    connections[sourceNode.getIndex()].push(new Connection(sourceNode.getIndex(),destNode.getIndex(),coef,func));
                }
            }
        }
        console.log("mutation");
        this.log();
    };
};
