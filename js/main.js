(function () {
    const canvas = document.getElementById('colonizationCanvas');
    const engine = new LabEngine(canvas);
    const status = document.getElementById('growth-status');

    const UI = {
        preset: document.getElementById('preset'),
        numPoints: document.getElementById('numPoints'),
        inf: document.getElementById('influenceRadius'),
        step: document.getElementById('segLength'),
        start: document.getElementById('startColor'),
        end: document.getElementById('endColor'),
        thick: document.getElementById('maxThickness'),
        btn: document.getElementById('runSimulation'),
        stats: {
            n: document.getElementById('stat-nodes'),
            t: document.getElementById('stat-targets'),
            fps: document.getElementById('stat-fps')
        }
    };

    function resize() {
        const b = canvas.parentElement.getBoundingClientRect();
        canvas.width = b.width;
        canvas.height = b.height;
    }

    function sync() {
        const cfg = {
            preset: UI.preset.value,
            numPoints: parseInt(UI.numPoints.value),
            influenceRadius: parseFloat(UI.inf.value),
            segLength: parseFloat(UI.step.value),
            startColor: UI.start.value,
            endColor: UI.end.value,
            maxThickness: parseFloat(UI.thick.value)
        };

        document.getElementById('numPointsValue').textContent = cfg.numPoints;
        document.getElementById('influenceRadiusValue').textContent = cfg.influenceRadius;
        document.getElementById('segLengthValue').textContent = cfg.segLength;
        document.getElementById('maxThicknessValue').textContent = cfg.maxThickness;

        engine.configure(cfg);
    }

    function start() {
        engine.active = false;
        resize();
        sync();
        engine.reset();
        engine.active = true;

        status.textContent = "Status: Growing";
        status.className = "status-tag mono uppercase border-blue-900 text-blue-500 bg-blue-900/10 text-[9px]";

        requestAnimationFrame(loop);
    }

    function loop(t) {
        if (!engine.active) return;

        const growing = engine.update();
        engine.draw();

        UI.stats.n.textContent = engine.nodes.length;
        UI.stats.t.textContent = engine.targets.length;
        UI.stats.fps.textContent = Math.round(1000 / (t - engine.fpsTime));
        engine.fpsTime = t;

        if (growing) {
            requestAnimationFrame(loop);
        } else {
            engine.active = false;
            status.textContent = "Status: Stable";
            status.className = "status-tag mono uppercase border-green-900 text-green-500 bg-green-900/10 text-[9px]";
        }
    }

    // UI Events
    UI.btn.addEventListener('click', start);

    const autoRestart = MathLib.debounce(start, 400);

    const interactive = [UI.preset, UI.numPoints, UI.inf, UI.step, UI.thick, UI.start, UI.end];
    interactive.forEach(el => el.addEventListener('input', autoRestart));

    window.addEventListener('resize', MathLib.debounce(() => {
        resize();
        start();
    }, 300));

    // Initial Execution
    window.onload = start;
})();