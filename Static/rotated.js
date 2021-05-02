window.onload = function () {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var thetaSlider = document.getElementById('theta');
    var dSlider = document.getElementById('d');

    function getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        console.log("x: " + x + " y: " + y)
    }

    const canvas = document.querySelector('canvas')
    canvas.addEventListener('mousedown', function (e) {
        getCursorPosition(canvas, e)
    })

    width = canvas.width;
    height = canvas.height;
    gradient = 0

    //CONSTANTS
    const CRYSTAL_LENGTH = 400;
    const BRAGG_PLANES = 3;
    const CENTRAL_X = width / 2;
    const CENTRAL_Y = height / 2;
    const REFLECTION_POINT = [CENTRAL_X - 150, CENTRAL_Y + 100]; // Change this to change the position of the diagram
    const XRAY_SOURCE = [20, REFLECTION_POINT[1] + 15, 100, 150] // xPos, yPos, width, height
    const XRAY_SOURCE_X = (XRAY_SOURCE[0] + XRAY_SOURCE[2])
    const DETECTOR_POSITION = width - 300
    const SECOND_XRAY_Y = REFLECTION_POINT[1] + (0.25 * XRAY_SOURCE[3])
    const ATOM_SPACING = 40

    //VARIABLES
    var bottomXrayCrystalCrossX;
    var radians;
    var radians_90;
    var d = 50;
    var theta = 7;
    var topRefDetY;
    var bottomRefDetY;
    var isBraggSatisfied = false;
    var currentAverageY;
    var correctAverageY;

    update()

    thetaSlider.oninput = function () {
        oldtheta = theta
        theta = parseInt(this.value)
        document.getElementById('thetaValue').innerHTML = (String(this.value + " °"))
        update()
    }

    dSlider.oninput = function () {
        d = parseInt(this.value)
        update()
    }

    function update() {
        //Update and redraw all the parts of the canvas.
        ctx.clearRect(0, 0, c.width, c.height);
        radians = theta * (Math.PI / 180)
        radians_90 = (90 - theta) * (Math.PI / 180)
        draw_crystal(parseInt(d), theta)
        draw_xray_source()
        drawIncidentRays()
        drawRefractedRays()
        draw_xray_passthrough()
        output()
        check_bragg(theta, d)
        if (isBraggSatisfied == true) {
            showCorrectDiffractionSpot()
        }
    }

    function draw_xray_source() {
        //Draw the X-ray source box.
        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.rect(XRAY_SOURCE[0], (XRAY_SOURCE[1] - (XRAY_SOURCE[3] / 2)), XRAY_SOURCE[2], XRAY_SOURCE[3])
        ctx.stroke()
    }

    function drawIncidentRays() {
        //Draw the indident rays coming from the X-ray source. 

        var topXRayLength = REFLECTION_POINT[0] - XRAY_SOURCE[0] - XRAY_SOURCE[2] //Calculate the length of the top incident X-ray, because it is at 0 degrees no pythag needed.
        var bottomXRayLength = bottomXrayCrystalCrossX - XRAY_SOURCE[0] - XRAY_SOURCE[2]    //Calculate the length of the bottom incident X-ray, because it is at 0 degrees no pythag needed.

        //Configure appearance of the lines
        ctx.lineWidth = 2; 
        ctx.setLineDash([0, 0])
        ctx.strokeStyle = 'red'

        //Draw the incident x-ray solid line
        ctx.beginPath()
        ctx.moveTo(XRAY_SOURCE_X, REFLECTION_POINT[1])
        ctx.lineTo(REFLECTION_POINT[0], REFLECTION_POINT[1])

        ctx.moveTo(XRAY_SOURCE_X, SECOND_XRAY_Y)
        ctx.lineTo(bottomXrayCrystalCrossX, SECOND_XRAY_Y)
        ctx.stroke()

        //Draw the incident x-ray waves
        sinWave(XRAY_SOURCE_X, REFLECTION_POINT[1], 0, topXRayLength, 1)
        sinWave(XRAY_SOURCE_X, SECOND_XRAY_Y, 0, bottomXRayLength, 1)

    }

    function drawRefractedRays() {

        topRefDetY = (DETECTOR_POSITION - REFLECTION_POINT[0]) * Math.tan(2 * radians) //Calculate the y displacement from the reflection point to where the top diffracted ray crosses the detector
        bottomRefDetY = (DETECTOR_POSITION - bottomXrayCrystalCrossX) * Math.tan(2 * radians) //Calculate the y displacement from the reflection point to where the bottom diffracted ray crosses the detector

        var topXRayLength = Math.sqrt((DETECTOR_POSITION - REFLECTION_POINT[0]) ** 2 + topRefDetY ** 2)
        var bottomXRayLength = Math.sqrt((DETECTOR_POSITION - bottomXrayCrystalCrossX) ** 2 + bottomRefDetY ** 2)

        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.strokeStyle = 'orange'

        ctx.moveTo(REFLECTION_POINT[0], REFLECTION_POINT[1])
        ctx.lineTo(DETECTOR_POSITION, REFLECTION_POINT[1] - topRefDetY)

        ctx.moveTo(bottomXrayCrystalCrossX, SECOND_XRAY_Y)
        ctx.lineTo(DETECTOR_POSITION, SECOND_XRAY_Y - bottomRefDetY)
        ctx.stroke()

        sinWave(REFLECTION_POINT[0], REFLECTION_POINT[1], 2 * theta, topXRayLength, -1)
        sinWave(bottomXrayCrystalCrossX, SECOND_XRAY_Y, 2 * theta, bottomXRayLength, -1)
    }

    function draw_xray_passthrough() {

        ctx.setLineDash([5, 4])
        ctx.strokeStyle = 'red'

        ctx.beginPath()
        ctx.moveTo(bottomXrayCrystalCrossX, SECOND_XRAY_Y)
        ctx.lineTo(canvas.width - 300, SECOND_XRAY_Y)
        ctx.stroke()
    }

    function output() {
        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.setLineDash([0, 0])
        ctx.rect(canvas.width - 250, XRAY_SOURCE[1] - 400, 200, 600)
        ctx.rect(canvas.width - 300, XRAY_SOURCE[1] - 400, 0, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(canvas.width - 150, SECOND_XRAY_Y, 2, 0, 2 * Math.PI)
        ctx.fill()

        currentAverageY = (SECOND_XRAY_Y - bottomRefDetY + REFLECTION_POINT[1] - topRefDetY) / 2

        ctx.beginPath()
        ctx.arc(canvas.width - 150, currentAverageY, 2, 0, 2 * Math.PI)
        ctx.stroke()
    }

    function rotate(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }

    function sinWave(startX, startY, angle, lineLength, amplitudeSign) {

        ctx.beginPath();
        ctx.lineWidth = 1;

        var amplitude = 10;
        var frequency = 4;


        for (var x = 0; x < lineLength; x++) {
            var y = startY + amplitude * amplitudeSign * Math.sin(x / frequency)
            r = rotate(startX, startY, startX + x, y, angle)
            ctx.lineTo(r[0], r[1])
        }
        ctx.stroke();
    }

    function draw_crystal(d, theta) {
        ctx.setLineDash([0, 0])
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        indent = 200
        numberOfAtoms = (CRYSTAL_LENGTH / ATOM_SPACING) + 1

        for (var i = 0; i < BRAGG_PLANES; i++) {

            var x = Math.sin(radians_90) * (CRYSTAL_LENGTH / 2)
            var y = Math.cos(radians_90) * (CRYSTAL_LENGTH / 2)

            var dx = d * Math.cos(radians_90)
            var dy = d * Math.sin(radians_90)

            var arcx = ATOM_SPACING * Math.cos(radians_90)
            var arcy = ATOM_SPACING * Math.sin(radians_90)

            for (var j = 0; j < numberOfAtoms; j++) {
                ctx.beginPath()
                ctx.arc(
                    REFLECTION_POINT[0] - x + (i * dx) + (j * arcy),
                    REFLECTION_POINT[1] + y + (i * dy) - (j * arcx),
                    2, 0, 2 * Math.PI
                ) // Calculate the position of the arcs by starting from the bottom left then incrementing x and y up per the offset and d length. Honestly don't fully understand it but hey it works.
                ctx.stroke()
            }
            ctx.beginPath()

            ax = REFLECTION_POINT[0] + x + (i * dx)
            bx = REFLECTION_POINT[1] - y + (i * dy)
            cx = REFLECTION_POINT[0] - x + (i * dx)
            dx = REFLECTION_POINT[1] + y + (i * dy)

            ctx.moveTo(ax, bx)
            ctx.lineTo(cx, dx)
            if (i == 1) {
                gradient = (dx - bx) / (ax - cx)

                bottomXrayCrystalCrossX = calculateGradient(ax, bx, SECOND_XRAY_Y, gradient)
            }
            ctx.stroke()
        }
    }

    function check_bragg(value, d) {

        wavelength = 15
        n = 1
        d = d / 4

        console.log("Theta:", value)
        console.log("Radians:", Math.sin(10 * radians), Math.sin(10 * radians).toFixed(2))
        console.log("Bragg:", wavelength / (2 * d), (wavelength / (2 * d)).toFixed(2))

        if ((Math.sin(10 * radians).toFixed(2)) == (wavelength / (2 * d)).toFixed(2)) {
            isBraggSatisfied = true
            correctAverageY = currentAverageY
            console.log("YES")
        }
    }

    function showCorrectDiffractionSpot() {
        console.log("SATISIFIED CALLED")
        ctx.beginPath()
        ctx.arc(canvas.width - 150, correctAverageY, 2, 0, 2 * Math.PI)
        ctx.fill()

    }

    function calculateGradient(x1, y1, y, m) {
        x = ((-y + y1) / m) + x1
        return x
    }
}