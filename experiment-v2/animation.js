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

    if (ACTOR.getFitness() > MAX_SCORE + 40) {
        ACTOR.kill();
    }

    if (ACTOR.isDead()) {
        if (ACTOR.getFitness() > MAX_SCORE) {
            BRAIN = MUTATED_BRAIN;
            GENERATIONS++;
            console.log("Generation ", GENERATIONS);
            LAST_MUTATION = ITERATIONS;
            MAX_SCORE = ACTOR.getFitness();
        }
        console.log(ACTOR.getFitness());

        ACTOR = new Actor(HEIGHT,WIDTH);

        MUTATED_BRAIN = BRAIN.deepClone();

        for (var i = 0; i < randomIntFromInterval(0,Math.max(100,(ITERATIONS-LAST_MUTATION)/10)); i++) {
            MUTATED_BRAIN.mutate();
        }
        console.log("mutation");
        MUTATED_BRAIN.log();

        ITERATIONS++;
        console.log(ITERATIONS,MAX_SCORE,GENERATIONS);
    }
    ACTOR.reset();
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
