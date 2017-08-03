var HEIGHT = 300;
var WIDTH = 300;
var REPEATS = 3;
var ACTOR_IMAGE;

var ITERATIONS = 0;
var GENERATIONS = 0;
var MAX_SCORE = 0;
var LAST_MUTATION = 0;
var REPEAT_SCORES = [];

var ACTOR = null;
var BRAIN = null;
var MUTATED_BRAIN = null;

var IMG = new Image();

function step() {
    MUTATED_BRAIN.eval(ACTOR);
    ACTOR.postEval();

    if (ACTOR.getFitness() > Math.min(MAX_SCORE * 1.5, Math.max(MAX_SCORE+1,MAX_SCORE+20-GENERATIONS))) {
        ACTOR.kill();
    }

    if (ACTOR.isDead()) {
        REPEAT_SCORES.push(ACTOR.getFitness());

        if (REPEAT_SCORES.length === REPEATS) {
            var averageScore = REPEAT_SCORES
                .reduce(function(sum, fitness) {return sum + fitness;})
                / REPEATS;

            if (averageScore > MAX_SCORE) {
                BRAIN = MUTATED_BRAIN;
                GENERATIONS++;
                console.log("Generation ", GENERATIONS);
                LAST_MUTATION = ITERATIONS;
                MAX_SCORE = averageScore;
            }
            console.log(ACTOR.getFitness());

            REPEAT_SCORES = [];
            MUTATED_BRAIN = BRAIN.deepClone();

            for (var i = 0; i < randomIntFromInterval(10,Math.max(40,(ITERATIONS-LAST_MUTATION)*10)); i++) {
                MUTATED_BRAIN.mutate();
            }
            console.log("mutation");
            MUTATED_BRAIN.log();

            ITERATIONS++;
            console.log(ITERATIONS,MAX_SCORE,GENERATIONS);
        }

        ACTOR = new Actor(HEIGHT,WIDTH);
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

function drawFast() {
    displayData("repeat", REPEAT_SCORES.length);
    displayData("iteration", ITERATIONS);
    displayData("generation", GENERATIONS);
    displayData("bestScore", Math.round(MAX_SCORE));

    step();

    ACTOR_IMAGE.css({
        bottom: ACTOR.getx(),
        left: ACTOR.gety(),
        transform: "rotate(" + (ACTOR.getdir()-90) + "deg)"
    });
    setTimeout(drawFast, 0);
}

function init() {
    // IMG.src = 'http://www.bludor.com/magazine/wp-content/themes/tma/images/bg/arrow.png';
    // window.requestAnimationFrame(draw);

    ACTOR_IMAGE = $("#ACTOR_IMAGE");
    drawFast();
}

$(document).ready(function (){
    ACTOR = new Actor(WIDTH,HEIGHT);
    BRAIN = new Brain(ACTOR.getInputs(),ACTOR.getOutputs());
    MUTATED_BRAIN = BRAIN.deepClone();
    init()
});
