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
        let num = Math.floor(Math.random() * (max - min)) + min;
        return num;
    }

//=================================== FIELD OBJECT ================================================
    function Field(rnd, x, number, color, covered, fieldSize) {
        this.rnd = rnd;
        this.x = x;
        this.number = number;
        this.color = color;
        this.covered = covered;
        this.fieldSize = fieldSize;
    }

//=================================== CALCULATE FIELD POSITION ================================================
    Field.prototype.calcX = function () {
        return (this.x % size * this.fieldSize);
    }

    Field.prototype.calcY = function () {
        return (Math.floor(this.x / size) * this.fieldSize);
    }
//=================================== DRAW FIELDS ================================================
    Field.prototype.draw = function () {
        if (this.covered === false) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.rect(this.calcX(),
                this.calcY(),
                this.fieldSize,
                this.fieldSize);
            ctx.fill();
        }
        //DRAW BORDERS BETWEEN FIELDS
        ctx.beginPath();
        ctx.rect(this.calcX(),
            this.calcY(),
            this.fieldSize,
            this.fieldSize);
        ctx.stroke();
    }
//=================================== DRAW NUMBERS OF FIELDS ================================================
    Field.prototype.drawNumber = function () {
        let positionX = 2.8;
        let positionY = 1.6;
        if (this.covered === false) {
            ctx.fillStyle = 'black';
            ctx.font = this.fieldSize / 2 + "px Calibri";
            ctx.fillText(this.number,
                this.calcX() + this.fieldSize / positionX,
                this.calcY() + this.fieldSize / positionY);
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
                    fields[i - 2].color,
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
            return a.rnd - b.rnd;
        })
        for (var i = 0; i < fields.length; i++) {
            fields[i].x = i;
        }
    }

//=================================== UNCOVER FIELDS ================================================
    function revealField() {
        var _this1 = 0;
        var _this2 = 0;
        for (var i = 0; i < fields.length; i++) {
            if (!gameStopped) {
                if ((fields[i].calcX() < mouseX) && ((fields[i].calcX() + fields[i].fieldSize) > mouseX)) {

                    if ((fields[i].calcY() < mouseY) && ((fields[i].calcY() + fields[i].fieldSize) > mouseY)) {

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

        if (fields[i].covered) {
            fields[i].covered = false;
            updateTries();
            refresh();
            _this1 = fields[i];
            checker = 1;
        }
    }

//=================================== SECOND CLICK - SECOND FIELD
    function uncoverCase1(i) {
        if (fields[i].covered) {
            fields[i].covered = false;
            updateTries()
            _this2 = fields[i];
            refresh();

            if (_this1.number !== _this2.number) {
                _this1.covered = true;
                _this2.covered = true;
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
        _this1.covered = true;
        _this2.covered = true;
        refresh();
        checker = 0;
    }

//=================================== MOUSE POSITION ================================================
    function getPosition(e) {
        const canvasSize = 500;
        const canvasWithBorder = 506;
        if (window.innerWidth < canvasWithBorder) {
            mouseX = (e.pageX - canvas.offsetLeft) * canvasSize / window.innerWidth;
            mouseY = (e.pageY - canvas.offsetTop) * canvasSize / window.innerWidth;
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

        this.fieldSize = canvas.width / size;
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
                return a.rnd - b.rnd;
            });
            fields[i].draw();
            fields[i].drawNumber();
        }
    }

//=================================== CHANGE BOARD SIZE ================================================
    function changeSize() {
        size = Number(document.getElementById('sizeInput').value)

        if (isNaN(size) || size < 4 || size % 2 === 1){
            size = 4;
        }

        if (size > 14){
            size = 14;
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