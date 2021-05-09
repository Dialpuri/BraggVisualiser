// Created by Jordan Dialpuri 2021, jsd523@york.ac.uk

window.onload = function () {
    //Initialise links to the HTML file
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var thetaSlider = document.getElementById('theta');
    var dSlider = document.getElementById('d');
    var wavelengthSlider = document.getElementById('wavelength')

    var ce = document.getElementById("ewald");
    var ctxe = ce.getContext("2d");


    //FOR DEBUGGING ONLY 
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

    //Initialise key variables first
    width = canvas.width;
    height = canvas.height;
    ewidth = ce.width
    eheight = ce.height
    //CONSTANTS
    const CENTER_POINT = { x: width / 2, y: height / 2 }
    const EW_CENTER_POINT = { x: ewidth / 2, y: eheight / 2 }
    const CRYSTAL_LENGTH = 400;
    const BRAGG_PLANES = 3;
    const REFLECTION_POINT = [CENTER_POINT.x - 300, CENTER_POINT.y + 100]; // Change this to change the position of the diagram
    
    const DETECTOR_POSITION = width - 600
    const DETECTOR_WIDTH = 500

    const ATOM_SPACING = 40

    //Constants for the apperance of the X-ray source.
    const XRAY_SOURCE = { 
        xPos: 50, 
        yPos: REFLECTION_POINT[1] + 15,
        width: 100,
        height: 150
    }
    const XRAY_SOURCE_X = (XRAY_SOURCE.xPos + XRAY_SOURCE.width)
    const SECOND_XRAY_Y = REFLECTION_POINT[1] + (0.25 * XRAY_SOURCE.height)
    const XRAY_SOURCE_OUTER_WIDTH = 100
    const XRAY_SOURCE_OUTER_HEIGHT = 150
    const XRAY_SOURCE_INNER_WIDTH = 50
    const XRAY_SOURCE_INNER_HEIGHT = 50
    const XRAY_COIL_HEIGHT = 20
    const XRAY_ANODE_PROTRUSION = 40
    const WAVELENGTH_FACTOR = 500
    const D_FACTOR = 500

    //VARIABLES
    var bottomXrayCrystalCrossX;
    var radians, radians_90;
    var d = 5
    var inverseD;
    var theta = 30;
    var wavelength = 5;
    var isBraggSatisfied = false;
    var correctPos;
    var passthroughCoords;
    var refractedCoords;
    var inverseWavelength = 1/5;
    var gradient;

    //Animate the electron coming from the coil.
    var ey = XRAY_SOURCE.yPos - 45 + XRAY_SOURCE_OUTER_HEIGHT - XRAY_COIL_HEIGHT
    var ex = 80

    function animate() {
        requestAnimationFrame(animate)
        ctx.clearRect(70, 300, 65, 500)
        ctx.beginPath()
        ctx.font = "12px Verdana";
        ctx.fillText("e⁻", ex, ey)
        ctx.stroke()
        ey -= 2
        var anodeY = ((-1 * ex) + 80) + y + (XRAY_SOURCE_OUTER_HEIGHT / 2) - 5
        if (ey < anodeY) {
            ey = XRAY_SOURCE.yPos - 45 + XRAY_SOURCE_OUTER_HEIGHT - XRAY_COIL_HEIGHT
            ex = 80 + (Math.random() * 20)
        }
        draw_xray_source()
    }

    //Bounding boxes for the appearance of tooltips, a rectangle surrounding the area. 
    boundingBoxes = [{
            name: "X-ray source",
            description: "Generates X-ray source",
            x: XRAY_SOURCE.xPos - 2,
            y: XRAY_SOURCE.yPos - 45,
            width: XRAY_SOURCE_OUTER_WIDTH,
            height: XRAY_SOURCE_OUTER_HEIGHT
        },

        {
            name: "Diffraction Pattern",
            description: "What is shown on the detector",
            x: DETECTOR_POSITION,
            y: XRAY_SOURCE.yPos - 400,
            width: 500,
            height: 600
        },
    ]

    //Safe trial of the animation and update.
    try {
        update()
        animate()
    } catch (err) {
        console.log(err)
    }

    //----HTML SLIDER INPUTS----
    thetaSlider.oninput = function () {
        theta = parseFloat(this.value)
        document.getElementById('thetaValue').innerHTML = (String(theta.toFixed(2) + " °"))
        update()
    }

    dSlider.oninput = function () {
        d = parseFloat(this.value)
        inverseD = (1 / d) * D_FACTOR
        document.getElementById('dValue').innerHTML = (String(d.toFixed(2) + " Å"))
        update()
    }

    wavelengthSlider.oninput = function () {
        wavelength = parseFloat(this.value)
        inverseWavelength = (1 / wavelength) * WAVELENGTH_FACTOR
        wavelength = parseInt(this.value)
        document.getElementById('wavelengthValue').innerHTML = (String(this.value + " nm"))
        update()
    }

    //Update and redraw all the parts of the canvas, called everytime a slider changes.
    function update() {
        //Update and redraw all the parts of the canvas.
        ctx.clearRect(0, 0, c.width, c.height);
        ctxe.clearRect(0, 0, ce.width, ce.height);

        radians = theta * (Math.PI / 180)
        radians_90 = (90 - theta) * (Math.PI / 180)
        draw_crystal()
        draw_xray_source()
        drawIncidentRays()
        drawRefractedRays()
        draw_xray_passthrough()
        draw_detector()
        draw_s()
        check_bragg(d)
        draw_circle()
        draw_horizontal_lines()
        draw_angled_lines()
        draw_d_line()
        if (isBraggSatisfied == true) {
            draw_correct_diffraction_spot()
        }
    }
    //Draw the X-ray source box.
    function draw_xray_source() {
        x = XRAY_SOURCE.xPos - 2
        y = XRAY_SOURCE.yPos - 45

        ctx.lineWidth = 1.5;

        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.rect(x, y, XRAY_SOURCE_OUTER_WIDTH, XRAY_SOURCE_OUTER_HEIGHT)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(x + XRAY_SOURCE_OUTER_WIDTH / 4, y - XRAY_ANODE_PROTRUSION)
        ctx.lineTo(x + (3 * XRAY_SOURCE_OUTER_WIDTH / 4), y - XRAY_ANODE_PROTRUSION)
        ctx.lineTo(x + (3 * XRAY_SOURCE_OUTER_WIDTH / 4), y + (XRAY_SOURCE_INNER_HEIGHT / 2))
        ctx.lineTo(x + XRAY_SOURCE_OUTER_WIDTH / 4, y + (XRAY_SOURCE_INNER_HEIGHT / 2) + 50)
        ctx.lineTo(x + XRAY_SOURCE_OUTER_WIDTH / 4, y - XRAY_ANODE_PROTRUSION)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineWidth = 3;

        ctx.moveTo(x + (3 * XRAY_SOURCE_OUTER_WIDTH / 4), y + (XRAY_SOURCE_INNER_HEIGHT / 2) - 2)
        ctx.lineTo(x + XRAY_SOURCE_OUTER_WIDTH / 4, y + (XRAY_SOURCE_INNER_HEIGHT / 2) + 48)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineWidth = 1.5;

        ctx.moveTo(x + XRAY_SOURCE_OUTER_WIDTH / 4, y + XRAY_SOURCE_OUTER_HEIGHT + 20)
        ctx.lineTo(+x + XRAY_SOURCE_OUTER_WIDTH / 4, y + XRAY_SOURCE_OUTER_HEIGHT - XRAY_COIL_HEIGHT)
        for (var i = 0; i < XRAY_SOURCE_INNER_WIDTH / 2; i++) {
            var delta = 3
            if (i % 2 == 0) {
                ctx.lineTo((x + XRAY_SOURCE_OUTER_WIDTH / 4) + (2 * i), y + XRAY_SOURCE_OUTER_HEIGHT - XRAY_COIL_HEIGHT + delta)
            } else {
                ctx.lineTo((x + XRAY_SOURCE_OUTER_WIDTH / 4) + (2 * i), y + XRAY_SOURCE_OUTER_HEIGHT - XRAY_COIL_HEIGHT - delta)
            }
        }
        ctx.lineTo(x + (3 * XRAY_SOURCE_OUTER_WIDTH / 4) - 2, y + XRAY_SOURCE_OUTER_HEIGHT + 20)
        ctx.stroke()

        ctx.beginPath()
        ctx.strokeStyle = 'red'
        ctx.rect(x + XRAY_SOURCE_OUTER_WIDTH - 2, y + (XRAY_SOURCE_INNER_HEIGHT / 2), 4, 50)
        ctx.fill()
    }

    //Draw the indident rays coming from the X-ray source.
    function drawIncidentRays() {
        var topXRayLength = REFLECTION_POINT[0] - XRAY_SOURCE_X //Calculate the length of the top incident X-ray, because it is at 0 degrees no pythag needed.
        var bottomXRayLength = bottomXrayCrystalCrossX - XRAY_SOURCE_X //Calculate the length of the bottom incident X-ray, because it is at 0 degrees no pythag needed.
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

        var topXRayLength = REFLECTION_POINT[0] - XRAY_SOURCE_X //Calculate the length of the top incident X-ray, because it is at 0 degrees no pythag needed.
        var bottomXRayLength = bottomXrayCrystalCrossX - XRAY_SOURCE_X //Calculate the length of the bottom incident X-ray, because it is at 0 degrees no pythag needed.

        //Displacement of the incident X-ray with equal length to the incident rays.
        var topYDisplacement = topXRayLength * Math.sin(2 * radians)
        var bottomYDisplacement = bottomXRayLength * Math.sin(2 * radians)
        var topXDisplacment = topXRayLength * Math.cos(2 * radians)
        var bottomXDisplacement = bottomXRayLength * Math.cos(2 * radians)

        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.strokeStyle = 'green'

        ctx.moveTo(REFLECTION_POINT[0], REFLECTION_POINT[1])
        ctx.lineTo(REFLECTION_POINT[0] + topXDisplacment, REFLECTION_POINT[1] - topYDisplacement)

        ctx.moveTo(bottomXrayCrystalCrossX, SECOND_XRAY_Y)
        ctx.lineTo(bottomXrayCrystalCrossX + bottomXDisplacement, SECOND_XRAY_Y - bottomYDisplacement)
        ctx.stroke()

        //Dictionary of end of the bottom refracted ray for use with the s vector arrow.
        refractedCoords = {
            x: bottomXrayCrystalCrossX + bottomXDisplacement,
            y: SECOND_XRAY_Y - bottomYDisplacement
        }

        sinWave(REFLECTION_POINT[0], REFLECTION_POINT[1], 2 * theta, topXRayLength, -1)
        sinWave(bottomXrayCrystalCrossX, SECOND_XRAY_Y, 2 * theta, bottomXRayLength, -1)
    }

    //Draw the x-ray that goes through the crytal.
    function draw_xray_passthrough() {

        ctx.setLineDash([5, 4])
        ctx.strokeStyle = 'red'
        var bottomXRayLength = bottomXrayCrystalCrossX - XRAY_SOURCE_X //Calculate the length of the bottom incident X-ray, because it is at 0 degrees no pythag needed.

        ctx.beginPath()
        ctx.moveTo(bottomXrayCrystalCrossX, SECOND_XRAY_Y)
        ctx.lineTo(bottomXrayCrystalCrossX + bottomXRayLength, SECOND_XRAY_Y)

        //Dictionary of end of the passthrough ray for use with the s vector arrow.
        passthroughCoords = {
            x: bottomXrayCrystalCrossX + bottomXRayLength,
            y: SECOND_XRAY_Y
        }

        ctx.stroke()
    }

    //Draw the detector with diffraction spots. 
    function draw_detector() {
        ctx.beginPath()
        ctx.strokeStyle = 'black'
        ctx.setLineDash([0, 0])
        ctx.rect(DETECTOR_POSITION, XRAY_SOURCE.yPos - 400, DETECTOR_WIDTH, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(DETECTOR_POSITION + (DETECTOR_WIDTH / 2), SECOND_XRAY_Y, 3, 0, 2 * Math.PI)
        ctx.fill()

        deltaPos = {
            x: passthroughCoords.x - refractedCoords.x,
            y: passthroughCoords.y - refractedCoords.y
        }

        ctx.beginPath()
        ctx.arc(DETECTOR_POSITION + (DETECTOR_WIDTH / 2) - deltaPos.x, SECOND_XRAY_Y - deltaPos.y, 3, 0, 2 * Math.PI)
        //canvas_arrow(ctx,DETECTOR_POSITION + (DETECTOR_WIDTH/2) - 2, SECOND_XRAY_Y - 2 , DETECTOR_POSITION + (DETECTOR_WIDTH/2) - deltaPos.x + 5, SECOND_XRAY_Y - deltaPos.y + 5)
        ctx.stroke()
    }

    //Calculate the rotation of the sin waves that are required
    function rotate(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }

    //Draw sin waves from a starting coordinate with length lineLength and with positive or negative sign.
    function sinWave(startX, startY, angle, lineLength, amplitudeSign) {
        ctx.beginPath();
        ctx.lineWidth = 1;

        var amplitude = 10;
        var frequency = wavelength;

        for (var x = 0; x < lineLength; x++) {
            var y = startY + amplitude * amplitudeSign * Math.sin(x / frequency)
            r = rotate(startX, startY, startX + x, y, angle)
            ctx.lineTo(r[0], r[1])
        }
        ctx.stroke();
    }

    //Draw the s arrow from the end of the passthrough x-ray to the bottom incident ray.
    function draw_s() {
        ctx.beginPath()
        canvas_arrow(ctx, passthroughCoords.x - 2, passthroughCoords.y - 2, refractedCoords.x + 2, refractedCoords.y + 2)
        ctx.stroke()
    }

    //Draw arrow template.
    function canvas_arrow(context, fromx, fromy, tox, toy) {
        var headlen = 10; // length of head in pixels
        var dx = tox - fromx;
        var dy = toy - fromy;
        var angle = Math.atan2(dy, dx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    }

    //Draw the crystal with distance d and rotation theta. 
    function draw_crystal() {
        ctx.setLineDash([0, 0])
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        indent = 200
        numberOfAtoms = (CRYSTAL_LENGTH / ATOM_SPACING) + 1

        for (var i = 0; i < BRAGG_PLANES; i++) {

            var x = Math.sin(radians_90) * (CRYSTAL_LENGTH / 2)
            var y = Math.cos(radians_90) * (CRYSTAL_LENGTH / 2)

            var dx = (d * 8) * Math.cos(radians_90)
            var dy = (d * 8) * Math.sin(radians_90)

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

    //Checks if the bragg equation has been satisified. sin(theta) = wavelength/2d.
    function check_bragg(d) {
        n = 1
        factor = 1
        console.log("Theta:", theta)
        console.log("Radians:", Math.sin(factor * radians), Math.sin(factor * radians).toFixed(3))
        console.log("Bragg:", wavelength / (2 * d), (wavelength / (2 * d)).toFixed(3))

        if ((Math.sin(factor * radians).toFixed(3)) == (wavelength / (2 * d)).toFixed(3)) {
            isBraggSatisfied = true
            correctPos = { x: DETECTOR_POSITION + (DETECTOR_WIDTH / 2) - deltaPos.x, y: SECOND_XRAY_Y - deltaPos.y }
        }
    }

    //Draws the diffraction spot that satisifies the bragg equation.
    function draw_correct_diffraction_spot() {
        ctx.beginPath()
        ctx.arc(correctPos.x, correctPos.y, 3, 0, 2 * Math.PI)
        ctx.fill()
    }

    function draw_circle() {
        ctxe.beginPath()
        ctxe.arc(EW_CENTER_POINT.x, EW_CENTER_POINT.y, inverseWavelength, 0, Math.PI * 2)
        ctxe.stroke()
    }

    function draw_horizontal_lines() {
        var left_edge = EW_CENTER_POINT.x - inverseWavelength
        var right_edge = EW_CENTER_POINT.x + inverseWavelength
        ctxe.beginPath()
        ctxe.moveTo(left_edge, EW_CENTER_POINT.y)
        ctxe.lineTo(right_edge, EW_CENTER_POINT.y)
        ctxe.stroke()
    }

    function draw_angled_lines() {
        var deltaX = inverseWavelength * Math.cos(2 * radians)
        var deltaY = inverseWavelength * Math.sin(2 * radians)

        ctxe.beginPath()
        ctxe.moveTo(EW_CENTER_POINT.x, EW_CENTER_POINT.y)
        ctxe.lineTo(EW_CENTER_POINT.x + deltaX, EW_CENTER_POINT.y - deltaY)
        ctxe.stroke()
    }

    function draw_d_line() {
        var right_edge = EW_CENTER_POINT.x + inverseWavelength

        var deltaX = inverseD * Math.cos(radians_90)
        var deltaY = inverseD * Math.sin(radians_90)

        ctxe.beginPath()
        ctxe.moveTo(right_edge, EW_CENTER_POINT.y)
        ctxe.lineTo(right_edge - deltaX, EW_CENTER_POINT.y - deltaY)
        ctxe.stroke()
    }

    //Calcluate the gradient of the x-ray crystal to determine where the bottom incident x-ray should reflect from. 
    function calculateGradient(x1, y1, y, m) {
        x = ((-y + y1) / m) + x1
        return x
    }

    //Gets correct XY coordinates for use in tooltips with CSS.
    function getXY(canvas, event) {
        var rect = canvas.getBoundingClientRect(); // absolute position of canvas
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
    }

    //Event listener for mouse movements which checks array of boundingBoxes to get which tooltip to show if any. 
    canvas.addEventListener('mousemove', function (e) {
        ctx.clearRect(0, 0, 500, 75)
        document.getElementById('information').innerHTML = ""
        var pos = getXY(canvas, e)
        boundingBoxes.forEach(function (d) {
            if ((pos.x < (d.x + d.width)) && ((pos.x > d.x))) {
                if ((pos.y < (d.y + d.height)) && ((pos.y > d.y))) {
                    document.getElementById('information').innerHTML = (d.name + " " + d.description)
                }
            }
        })
    })
}