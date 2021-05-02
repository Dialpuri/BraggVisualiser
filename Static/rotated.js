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
    let CRYSTAL_LENGTH = 400;
    let BRAGG_PLANES = 3;
    let CENTRAL_X = width / 2;
    let CENTRAL_Y = height / 2;
    let REFLECTION_POINT = [CENTRAL_X - 150, CENTRAL_Y + 100]; // Change this to change the position of the diagram
    let XRAY_SOURCE = [20, REFLECTION_POINT[1] + 15, 100, 150] // xPos, yPos, width, height
    let XRAY_SOURCE_X = (XRAY_SOURCE[0] + XRAY_SOURCE[2])
    let XRAY_LENGTH = 500
    let DETECTOR_POSITION = width - 300
    let SECOND_XRAY_Y = REFLECTION_POINT[1] + (0.25 * XRAY_SOURCE[3])

    //VARIABLES
    var topXRayLength = 0
    var secondx;
    var radians;
    var d = 50;
    var theta = 7;
    var dy;
    var satisfiedBragg = false;
    var averageY;
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
        ctx.clearRect(0, 0, c.width, c.height);
        radians = theta * (Math.PI / 180)
        draw_crystal(parseInt(d), theta)
        draw_xray_source()
        drawIncidentRays()
        drawRefractedRays()
        draw_xray_passthrough()
        output()
        check_bragg(theta, d)
        if (satisfiedBragg == true) {
            isSatisfiedBragg()
        }
    }

    function draw_xray_source() {
        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.rect(XRAY_SOURCE[0], (XRAY_SOURCE[1] - (XRAY_SOURCE[3] / 2)), XRAY_SOURCE[2], XRAY_SOURCE[3])
        ctx.stroke()
    }

    function drawIncidentRays() {

        var topXRayLength = REFLECTION_POINT[0] - XRAY_SOURCE[0] - XRAY_SOURCE[2]
        var bottomXRayLength = secondx - XRAY_SOURCE[0] - XRAY_SOURCE[2]

        ctx.lineWidth = 2;
        ctx.setLineDash([0, 0])
        ctx.strokeStyle = 'red'

        ctx.beginPath()
        ctx.moveTo(XRAY_SOURCE_X, REFLECTION_POINT[1])
        ctx.lineTo(REFLECTION_POINT[0], REFLECTION_POINT[1])

        ctx.moveTo(XRAY_SOURCE_X, SECOND_XRAY_Y)
        ctx.lineTo(secondx, SECOND_XRAY_Y)
        ctx.stroke()

        sinWave(XRAY_SOURCE_X, REFLECTION_POINT[1], 0, topXRayLength)
        sinWave(XRAY_SOURCE_X, SECOND_XRAY_Y, 0, bottomXRayLength)

    }

    function drawRefractedRays() {

        var y = (DETECTOR_POSITION - REFLECTION_POINT[0]) * Math.tan(2 * radians)
        dy = (DETECTOR_POSITION - secondx) * Math.tan(2 * radians)

        var secondXRayY = SECOND_XRAY_Y
        var topXRayLength = Math.sqrt((DETECTOR_POSITION - REFLECTION_POINT[0]) ** 2 + y ** 2)
        var bottomXRayLength = Math.sqrt((DETECTOR_POSITION - secondx) ** 2 + dy ** 2)

        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.strokeStyle = 'orange'

        ctx.moveTo(REFLECTION_POINT[0], REFLECTION_POINT[1])
        ctx.lineTo(DETECTOR_POSITION, REFLECTION_POINT[1] - y)

        ctx.moveTo(secondx, secondXRayY)
        ctx.lineTo(DETECTOR_POSITION, secondXRayY - dy)
        ctx.stroke()

        negativeSinWave(REFLECTION_POINT[0], REFLECTION_POINT[1], 2 * theta, topXRayLength)
        negativeSinWave(secondx, secondXRayY, 2 * theta, bottomXRayLength)
    }

    function draw_xray_passthrough() {

        ctx.setLineDash([5, 4])
        ctx.strokeStyle = 'red'

        ctx.beginPath()
        ctx.moveTo(secondx, SECOND_XRAY_Y)
        ctx.lineTo(canvas.width - 300, SECOND_XRAY_Y)
        ctx.stroke()
    }

    function output() {
        //var secondXRayY = SECONDXRAYY
        var y = XRAY_LENGTH * Math.sin(2 * radians)

        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.setLineDash([0, 0])
        ctx.rect(canvas.width - 250, XRAY_SOURCE[1] - 400, 200, 600)
        ctx.rect(canvas.width - 300, XRAY_SOURCE[1] - 400, 0, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(canvas.width - 150, SECOND_XRAY_Y, 2, 0, 2 * Math.PI)
        ctx.fill()

        averageY = (SECOND_XRAY_Y - dy + REFLECTION_POINT[1] - y) / 2

        ctx.beginPath()
        ctx.arc(canvas.width - 150, averageY, 2, 0, 2 * Math.PI)
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

    function sinWave(startX, startY, angle, lineLength) {

        var width = lineLength
        var height = ctx.canvas.height;
        var scale = 20;

        ctx.beginPath();
        ctx.lineWidth = 1;

        var x = 0;
        var y = 0;
        var amplitude = 10;
        var frequency = 4;


        for (x = 0; x < width; x++) {
            y = startY + amplitude * Math.sin(x / frequency)
            r = rotate(startX, startY, startX + x, y, angle)
            ctx.lineTo(r[0], r[1])
        }
        ctx.stroke();
    }

    function negativeSinWave(startX, startY, angle, lineEndHeight) {

        ctx.beginPath();
        ctx.lineWidth = 1;
        var x = 0;
        var y = 0;
        var amplitude = 10;
        var frequency = 4;


        for (x = 0; x < lineEndHeight; x++) {
            y = startY + amplitude * - Math.sin(x / frequency)
            r = rotate(startX, startY, startX + x, y, angle)
            ctx.lineTo(r[0], r[1])
        }
        ctx.stroke();
    }

    function draw_crystal(d, theta) {
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.setLineDash([0, 0])

        ctx.lineWidth = 2;
        offset = 40
        ctx.strokeStyle = 'black';
        indent = 200
        numberOfAtoms = (CRYSTAL_LENGTH / offset) + 1

        theta_r = (90 - theta) * (Math.PI / 180)


        for (var i = 0; i < BRAGG_PLANES; i++) {

            var x = Math.sin(theta_r) * (CRYSTAL_LENGTH / 2)
            var y = Math.cos(theta_r) * (CRYSTAL_LENGTH / 2)

            var dx = d * Math.cos(theta_r)
            var dy = d * Math.sin(theta_r)

            var arcx = offset * Math.cos(theta_r)
            var arcy = offset * Math.sin(theta_r)

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

                secondx = calculateGradient(ax, bx, SECOND_XRAY_Y, gradient)
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
            satisfiedBragg = true
            correctAverageY = averageY
            console.log("YES")
        }
    }

    function isSatisfiedBragg() {
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