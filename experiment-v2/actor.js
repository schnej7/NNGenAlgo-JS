function Actor(a_areaHeight,a_areaWidth) {
    var X0 = 270;
    var Y0 = 150;

    var areaWidth = a_areaWidth;
    var areaHeight = a_areaHeight;

    var x = X0;
    var y = Y0;
    var dir = 0;
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

    this.getdir = function () {
        return dir;
    };

    this.gety = function () {
        return y;
    };

    this.getx = function () {
        return x;
    };
    this.getage = function () {
        return age;
    };

    this.reset = function () {
        if (this.getFitness() != lastTurnFitnessChanged) {
            lastTurnFitnessChanged = age;
        }
        age+= 1;
        if (!moved) {
            stillInARow ++;
        }
        turnedThisStep = 0;
        moved = false;
    };

    this.crashed = function() {
        return x < 0 || y < 0 ||  x > areaWidth || y > areaHeight;
    };

    this.turnsAgoFitnessChange = function() {
        return age - lastTurnFitnessChanged;
    };

    this.getFitness = function () {
        return Math.max(0,maxX-X0 + X0-minX + maxY-Y0 + Y0-minY);
    };

    this.kill = function() {
        this.dead = true;
    };

    this.isDead = function() {
        return turnedThisStep > 1 || this.crashed() || stillInARow > 10 || age-lastTurnFitnessChanged > 40;
    };

    this.getInputs = function() {
        return [
            {"func":function(actor){ return actor.getdir();}},
            {"func":function(actor){ return actor.getx();}},
            {"func":function(actor){ return actor.gety();}},
            {"func":function(actor){ return actor.getage();}},
        ];
    };

    this.getOutputs = function() {
        return [
            // TODO: Add this.move()
            {"func":function(actor){actor.rotateLeft();}},
            {"func":function(actor){actor.rotateRight();}},
        ];
    };

    this.move = function() {
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
        turnedThisStep++;
        dir = (dir + 2) % 360;
    };

    this.rotateLeft = function() {
        turnedThisStep++;
        dir = (dir - 2) % 360;
    };
};
