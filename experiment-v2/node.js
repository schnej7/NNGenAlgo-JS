function Node(a_outputFunc,a_combinatorFunc,a_isBinary,a_nullValFunc,a_index,a_isASource) {
    var isBinary = a_isBinary;
    var nullValFunc = a_nullValFunc != null ? a_nullValFunc : isBinary ? function(actor) {return 0;} : function(actor) {return Math.random();};
    var combinatorFunc = a_combinatorFunc != null ? a_combinatorFunc : isBinary ? function(a_val1){return a_val1 ? 1 : -1;} : function(a_val1, a_val2) {return a_val1 + a_val2;};
    var outputFunc = a_outputFunc || function(){};
    var index = a_index;
    var val = 0;
    var permSource = !!a_isASource;
    var sourceDetected = false;

    this.isBinary = function () {
        return isBinary;
    };

    this.deepClone = function() {
        return new Node(outputFunc,combinatorFunc,isBinary,nullValFunc,index,permSource);
    };

    this.setNullVal = function (actor) {
        val = nullValFunc(actor);
        while (val>1) {
            val /= 10;
        }
    };

    this.isSource = function () {
        return sourceDetected || permSource;
    };

    this.setSource = function () {
        sourceDetected = true;
    };

    this.contribute = function(a_val) {
        if (isBinary) {
            val += combinatorFunc(a_val);
        } else {
            val = combinatorFunc(this.getVal(),a_val);
        }
        sourceDetected = true;
    };

    this.executeOutput = function(actor) {
        if (this.getIndex()==98) {
            //console.log("exec",val,this.getVal());
        }
        if (isBinary && this.getVal()) {
            outputFunc(actor);
        }
    };

    this.getIndex = function () {
        return index;
    };

    this.getVal = function () {
        return isBinary ? val > 0 : val;
    };

    this.logVal = function () {
        console.log(this.getIndex(),val, this.getVal());
    };

    this.changeCombinator = function(newFunc) {
        combinatorFunc = newFunc;
    };

    this.changeNullValFunc = function(newFunc) {
        nullValFunc = newFunc || isBinary ? function(actor) {return Math.random();} : function(actor) {return Math.random();};
    };
};
