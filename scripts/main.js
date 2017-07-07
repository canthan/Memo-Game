//=================================== DEKLARACJE ================================================
    const ctx = document.getElementById('canvas').getContext('2d');
    const canvas = document.getElementById('canvas');
    const navButtonStart = document.getElementById('navButtonStart');
    const navButtonPause = document.getElementById('navButtonPause');
    const pTries = document.getElementById('pTries');
    const pProgress = document.getElementById('pProgress');
    const pTime = document.getElementById('pTime');
    const pVictory = document.getElementById('captionVictory');

    var size = Number(document.getElementById('sizeInput').value);

    var fields = [];
    var mouseX = 0;
    var mouseY = 0;
    var checker = 0;

    var tries = 0;
    var time = 0;
    var progress = 0;
    var intervalTime = 0;
    var gameStopped = false;

//=================================== FUNCTION RANDOM ================================================
    function random(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

//=================================== FIELD OBJECT ================================================
    class Field {
        constructor(rnd, x, number, color, covered, fieldSize){        
            this.rnd = rnd;
            this.x = x;
            this.number = number;
            this.color = color;
            this.covered = covered;
            this.fieldSize = fieldSize;
        }
        get getRnd() {return this.rnd;}
        get getX() {return this.x;}
        get getNumber() {return this.number;}
        get getColor() {return this.color;}
        get getCovered() {return this.covered;}
        get getFieldSize() {return this.fieldSize;}

        set setX(x) {this.x = x;}
        set setCovered(covered) {this.covered = covered;} 
    }

//=================================== CALCULATE FIELD POSITION ================================================
    Field.prototype.calcX = function () {
        return (this.getX % size * this.getFieldSize);
    }

    Field.prototype.calcY = function () {
        return (Math.floor(this.getX / size) * this.getFieldSize);
    }
//=================================== DRAW FIELDS ================================================
    Field.prototype.draw = function () {
        if (this.getCovered === false) {
            ctx.beginPath();
            ctx.fillStyle = this.getColor;
            ctx.rect(this.calcX(),
                this.calcY(),
                this.getFieldSize,
                this.getFieldSize);
            ctx.fill();
        }
        //DRAW BORDERS BETWEEN FIELDS
        ctx.beginPath();
        ctx.rect(this.calcX(),
            this.calcY(),
            this.getFieldSize,
            this.getFieldSize);
        ctx.stroke();
    }
//=================================== DRAW NUMBERS OF FIELDS ================================================
    Field.prototype.drawNumber = function () {
        const POSITION_X = 2.8;
        const POSITION_Y = 1.6;
        if (this.getCovered === false) {
            ctx.fillStyle = 'black';
            ctx.font = this.getFieldSize / 2 + "px Calibri";
            ctx.fillText(this.getNumber,
                this.calcX() + this.getFieldSize / POSITION_X,
                this.calcY() + this.getFieldSize / POSITION_Y);
        }
    }
//=================================== CREATING FIELDS ================================================
    function fieldsCreate() {
        for (var i = 1; fields.length < size * size; i++) {

            if (i % 2 === 1) {//first field
                var field = new Field(
                    Math.random(), //random number to shuffle fields
                    i - 1,
                    (i + i % 2) / 2, //number of pair of fields
                    'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')', //random color
                    true,
                    canvas.width / size
                );
            }
            else { //second field with the same number
                var field = new Field(
                    Math.random(),
                    i - 1,
                    (i + i % 2) / 2,
                    fields[i - 2].getColor,
                    true,
                    canvas.width / size
                );

            }
            fields.push(field);
        }
    }

//=================================== SHUFFLE FIELDS ================================================
    function setOrder() {
        fields.sort(function (a, b) {
            return a.getRnd - b.getRnd;
        })
        for (var i = 0; i < fields.length; i++) {
            fields[i].setX = i;
        }
    }

//=================================== UNCOVER FIELDS ================================================
    function revealField() {
        var this1 = 0;
        var this2 = 0;
        for (var i = 0; i < fields.length; i++) {
            if (!gameStopped) {
                if ((fields[i].calcX() < mouseX) && (fields[i].calcX() + fields[i].getFieldSize > mouseX)) {

                    if ((fields[i].calcY() < mouseY) && (fields[i].calcY() + fields[i].getFieldSize > mouseY)) {

                        switch (checker) {
                            case 0://FIRST CLICK - FIRST FIELD
                                uncoverCase0(i);
                                break;

                            case 1://SECOND CLICK - SECOND FIELD
                                uncoverCase1(i);
                                break;

                            case 2://THIRD CLICK
                                uncoverCase2();
                                break;
                        }
                    }
                }
            }
        }
    }

//=================================== FIRST CLICK - FIRST FIELD
    function uncoverCase0(i) {

        if (fields[i].getCovered) {
            fields[i].setCovered = false;
            updateTries();
            refresh();
            this1 = fields[i];
            checker = 1;
        }
    }

//=================================== SECOND CLICK - SECOND FIELD
    function uncoverCase1(i) {
        if (fields[i].getCovered) {
            fields[i].setCovered = false;
            updateTries();
            this2 = fields[i];
            refresh();

            if (this1.getNumber !== this2.getNumber) {
                this1.setCovered = true;
                this2.setCovered = true;
                checker = 2;
            }
            else {
                progress += 2;
                updateProgress();
                checker = 0;
                if (progress === size * size) {
                    endGame();
                }
            }
        }
    }

//=================================== THIRD CLICK
    function uncoverCase2() {
        this1.setCovered = true;
        this2.setCovered = true;
        refresh();
        checker = 0;
    }

//=================================== MOUSE POSITION ================================================
    function getPosition(e) {
        const CANVAS_SIZE = 500;
        const CANVAS_WITH_BORDER = 506;
        if (window.innerWidth < CANVAS_WITH_BORDER) {
            mouseX = (e.pageX - canvas.offsetLeft) * CANVAS_SIZE / window.innerWidth;
            mouseY = (e.pageY - canvas.offsetTop) * CANVAS_SIZE / window.innerWidth;
        }
        else {
            mouseX = e.pageX - canvas.offsetLeft;
            mouseY = e.pageY - canvas.offsetTop;
        }
    }

//=================================== START GAME ================================================
    function startGame() {
        pVictory.style.display = "none";
        gameStopped = false;
        changeSize();
        tries = 0;
        time = 0;
        intervalTime = setInterval(clock, 100);
        progress = 0;
        checker = 0;
        fields = [];
        fieldsCreate();
        setOrder();

        updateTries();
        updateProgress();

        navButtonPause.textContent = "PAUSE";
        navButtonPause.style.backgroundColor = "deepskyblue";

        refresh();
    }

//=================================== PAUSE GAME ================================================
    function pauseGame() {
        if (!gameStopped) {
            clearInterval(intervalTime);
            navButtonPause.textContent = "RESUME";
            navButtonPause.style.backgroundColor = "red";
        }
        else {
            intervalTime = setInterval(clock, 100);
            navButtonPause.textContent = "PAUSE";
            navButtonPause.style.backgroundColor = "deepskyblue";
        }
        gameStopped = !gameStopped;
    }

//=================================== END GAME ================================================
    function endGame() {
        gameStopped = true;
        clearInterval(intervalTime);
        pVictory.style.display = "block";

    }

//=================================== SCREEN REFRESH ================================================
    function refresh() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < fields.length; i++) {
            fields.sort(function (a, b) {
                return a.getRnd - b.getRnd;
            });
            fields[i].draw();
            fields[i].drawNumber();
        }
    }

//=================================== CHANGE BOARD SIZE ================================================
    function changeSize() {
        let MIN_SIZE = 4;
        let MAX_SIZE = 12;
                size = Number(document.getElementById('sizeInput').value)


        if (isNaN(size) || size < MIN_SIZE || size % 2 === 1){
            size = MIN_SIZE;
        }

        if (size > MAX_SIZE){
            size = MAX_SIZE;
        }

    }

//=================================== COUNT NUMBER OF TRIES, PROGRESS AND TIME ================================================
    function updateTries() {
        pTries.textContent = 'TRIES: ' + tries;
        tries++;
    }

    function updateProgress() {
        pProgress.textContent = 'PROGRESS: ' + progress + '/' + size * size;
    }

    function clock() {
        pTime.textContent = 'TIME: ' + (Math.round(time * 100) / 100).toFixed(1) + 's';
        time += 0.1;
    }

//=================================== EVENTS ================================================
    navButtonStart.addEventListener("click", startGame);
    navButtonPause.addEventListener("click", pauseGame);
    canvas.addEventListener("mousemove", getPosition);
    canvas.addEventListener("click", revealField);

//=================================== STYLING SPINNER JQUERY-UI ================================================
$(document).ready(function() {
$( "#sizeInput" ).spinner();
});