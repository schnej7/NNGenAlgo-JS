function Actor(a_areaHeight,a_areaWidth) {
    var dead = false;

    var MARGIN = 15;

    var X0 = randomIntFromInterval(MARGIN,a_areaWidth-MARGIN);
    var Y0 = randomIntFromInterval(MARGIN,a_areaWidth-MARGIN);
    var D0 = randomIntFromInterval(0,360);
    //var X0 = 280;
    //var Y0 = 150;
    //var D0 = 0;

    var areaWidth = a_areaWidth;
    var areaHeight = a_areaHeight;

    var x = X0;
    var y = Y0;
    var dir = D0;
    var maxX = x;
    var minX = x;
    var maxY = y;
    var minY = y;

    var dist = 0;
    var age = 0;

    var turnedThisStep = 0;

    var moved = false;
    var stillInARow = 0;

    var lastTurnFitnessChanged = 0;
    var lastFitness = 0;

    var lastOutputs = {};
    var thisOutputs = {};
    var changeItUpMultiplier = 0;

    function distToCenter() {
        var dx = Math.abs(x - areaWidth/2);
        var dy = Math.abs(y - areaHeight/2);
        return Math.sqrt(Math.pow(dx,2),Math.pow(dy,2));
    };

    this.getdirpercent = function () {
        return dir/360;
    };
    this.getdir = function () {
        return dir;
    };

    this.getypercent = function () {
        return y / areaHeight;
    };
    this.gety = function () {
        return y;
    };

    this.getxpercent = function () {
        return x/areaWidth;
    };
    this.getx = function () {
        return x;
    };

    this.getage = function () {
        return age;
    };

    function compareOutputs(o1,o2) {
        for (key in o1) {
            if (o1[key] !== o2[key]) {
                return false;
            }
        }
        for (key in o2) {
            if (o1[key] !== o2[key]) {
                return false;
            }
        }
        return true;
    };

    this.postEval = function() {
    };

    this.reset = function () {
        if (this.getFitness() != lastFitness) {
            lastTurnFitnessChanged = age;
            lastFitness = this.getFitness();
        }
        if (!moved) {
            stillInARow ++;
        }
        turnedThisStep = 0;
        moved = false;

        if (age > 1 && !compareOutputs(lastOutputs, thisOutputs)) {
            changeItUpMultiplier++;
            lastOutputs = thisOutputs;
        } else if (age <= 1) {
            lastOutputs = thisOutputs;
        }
        thisOutputs = {};

        age+= 1;
    };

    this.crashed = function() {
        return x < 0 || y < 0 ||  x > areaWidth || y > areaHeight;
    };

    this.turnsAgoFitnessChange = function() {
        return age - lastTurnFitnessChanged;
    };

    this.getFitness = function () {
        var crashedBonus = this.crashed() ? -10 * age : 0;
        var fit = Math.max(0,maxX-X0 + X0-minX + maxY-Y0 + Y0-minY + crashedBonus);
        fit += 100 * changeItUpMultiplier;
        //fit -= distToCenter() * 10;
        return Math.floor(fit > 30 ? fit : 0) / age;
    };

    this.kill = function() {
        dead = true;
    };

    this.isDead = function() {
        return turnedThisStep > 1 || this.crashed() || stillInARow > 400 || this.turnsAgoFitnessChange() > 60 || dead; // || age > 300;
    };

    this.getInputs = function() {
        return [
            {"func":function(actor){ return actor.getdirpercent(); }},
            {"func":function(actor){ return actor.getxpercent();   }},
            {"func":function(actor){ return actor.getypercent();   }},
            {"func":function(actor){ return actor.getage(); }},
        ];
    };

    this.getOutputs = function() {
        return [
            {"func":function(actor){actor.move();}},
            {"func":function(actor){actor.rotateLeft();}},
            {"func":function(actor){actor.rotateRight();}},
        ];
    };

    this.move = function() {
        thisOutputs["move"]=true;
        stillInARow = 0;
        moved = true;
        x += Math.cos(dir * Math.PI / 180);
        y += Math.sin(dir * Math.PI / 180);
        dist += 1;
        maxX = Math.max(x,maxX);
        minX = Math.min(x,minX);
        maxY = Math.max(y,maxY);
        minY = Math.min(y,minY);
    };

    this.rotateRight = function() {
        thisOutputs["right"]=true;
        turnedThisStep++;
        dir = (dir + 2) % 360;
    };

    this.rotateLeft = function() {
        thisOutputs["left"]=true;
        turnedThisStep++;
        dir = (dir - 2) % 360;
    };
};
