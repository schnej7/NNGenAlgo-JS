function Connection(a_sourceNodeIndex,a_destNodeIndex,a_coef,a_func) {
    var sourceNodeIndex = a_sourceNodeIndex;
    var destNodeIndex = a_destNodeIndex;
    var coef = a_coef || 1;
    var func = a_func || function(sourceVal,coef){return sourceVal};

    this.getDestIndex = function() {
        return destNodeIndex;
    };

    this.getSourceIndex = function() {
        return sourceNodeIndex;
    };

    this.deepClone = function() {
        return new Connection(sourceNodeIndex,destNodeIndex,coef,func);
    };

    this.fire = function(sourceNode,destNodex) {
        destNodex.contribute(func(sourceNode.getVal(),coef));
    };

    this.changeCoef = function(a_coef) {
        coef = a_coef;
    };

    this.changeFunc = function(a_func) {
        func = a_func;
    };
};
