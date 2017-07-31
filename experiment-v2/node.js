function Node(a_outputFunc,a_combinatorFunc,a_isBinary,a_nullValFunc,a_index) {
    var isBinary = a_isBinary;
    var nullValFunc = a_nullValFunc || isBinary ? function(actor) {return false;} : function() {return 0;};
    var combinatorFunc = a_combinatorFunc || isBinary ? function(a_val1, a_val2) {return a_val1 || !!a_val2;} : function(a_val1, a_val2) {return a_val1 + a_val2;};
    var outputFunc = a_outputFunc || function(){};
    var index = a_index;
    var val = 0;

    this.isBinary = function () {
        return isBinary;
    };

    this.deepClone = function() {
        var _index = index;
        return new Node(outputFunc,combinatorFunc,isBinary,nullValFunc,_index);
    };

    this.setNullVal = function (actor) {
        val = nullValFunc(actor);
    };

    this.contribute = function(a_val) {
        val = combinatorFunc(this.getVal(),a_val);
    };

    this.executeOutput = function(actor) {
        if (isBinary && this.getVal()) {
            outputFunc(actor);
        }
    };

    this.getIndex = function () {
        return index;
    };

    this.getVal = function () {
        return val;
    };
};
