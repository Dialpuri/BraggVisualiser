<!-- © Jordan Dialpuri 2021 -->

<html>
<head>
    <script type="text/javascript" src="../static/js/rotated.js"></script>
    <link rel="stylesheet" href="../static/css/stylesheet.css">
</head>
<body>
    <div class="slidecontainer" id = "sidebar">

        <!-- <a href="/ewald"> -->
        <h1 class="title">X-ray diffraction</h1>
        <!-- </a> -->
        <h2 class="sliderTitle">Adjust variables</h2>
        θ
        <input type="range" min="15" max="38" step="0.1" value="22" class="slider" id="theta" />
        <label id="thetaValue">30.00 °</label>
        <p></p>
        d
        <input type="range" min="3" max="10" step="0.25" value="5" class="slider" id="d" />
        <label id="dValue">5.00 Å</label>
        <p></p>
        λ
        <input type="range" min="3" max="6" step="1" value="3" class="slider" id="wavelength" />
        <label id="wavelengthValue">3 nm</label>
        <p></p>
        <div class="information">
             <label id="information"> </label>
        </div>
        <h2 class="sliderTitle">Bragg Equation</h2>

        <div class = "braggEquation">
            2dsin(θ) = <label id = "2dsintheta"></label>
            <p></p>
            nλ = <label id = "nlambda"></label>
        </div>

        <div class = "credits">
            © Jordan Dialpuri 2021
        </div>

    </div>

    <div class="container" width="1400">
        <canvas id="myCanvas" class="canvas" width="1400px" height="700px">
            Your browser does not support the HTML canvas tag.</canvas>
        <p></p>
        <canvas id="ewald" class="ewaldCanvas" width="400px" height="400px">Your browser does not support the HTML
            canvas tag.</canvas>
    </div>

</body>

</html>