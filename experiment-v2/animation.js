var HEIGHT = 300;
var WIDTH = 300;

var ITERATIONS = 0;
var GENERATIONS = 0;
var MAX_SCORE = 0;
var LAST_MUTATION = 0;

var ACTOR = null;
var BRAIN = null;
var MUTATED_BRAIN = null;

var IMG = new Image();

function step() {
    MUTATED_BRAIN.eval();

    // Always walk for now
    ACTOR.move();

    if (ACTOR.getFitness() > MAX_SCORE + 10) {
        ACTOR.kill();
    }

    if (ACTOR.isDead()) {
        if (ACTOR.getFitness() > MAX_SCORE) {
            BRAIN = MUTATED_BRAIN.deepClone();
            GENERATIONS++;
            console.log("Generation ", GENERATIONS);
            LAST_MUTATION = ITERATIONS;
            MAX_SCORE = ACTOR.getFitness();
        }

        ACTOR = new Actor(HEIGHT,WIDTH);

        MUTATED_BRAIN = BRAIN.deepClone();

        for (var i = 0; i < 10; i++) {
            MUTATED_BRAIN.mutate();
        }

        ITERATIONS++;
        console.log(ITERATIONS);
        console.log(MAX_SCORE);
    }
};

function draw() {
    step();

    var ctx = document.getElementById('VIEWPORT').getContext('2d');
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, HEIGHT, WIDTH); // clear canvas

    ctx.save();

    // Draw actor
    ctx.translate(ACTOR.getx(),ACTOR.gety());
    ctx.rotate(ACTOR.getdir()*Math.PI/180);
    ctx.translate(-IMG.height/2, -IMG.width/2);
    ctx.drawImage(IMG, 0, 0);
    ctx.restore();

    window.requestAnimationFrame(draw);
};

function init() {
    IMG.src = 'http://www.bludor.com/magazine/wp-content/themes/tma/images/bg/arrow.png';
    window.requestAnimationFrame(draw);
};

$(document).ready(function (){
    ACTOR = new Actor(WIDTH,HEIGHT);
    BRAIN = new Brain(ACTOR.getInputs(),ACTOR.getOutputs());
    MUTATED_BRAIN = BRAIN.deepClone();
    init()
});
