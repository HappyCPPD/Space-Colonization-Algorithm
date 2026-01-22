class LabEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.targets = [];
        this.nodes = [];
        this.config = {};
        this.active = false;
        this.fpsTime = 0;
    }

    configure(cfg) {
        this.config = cfg;
        this.config.infSq = cfg.influenceRadius ** 2;
        this.config.killSq = 100; 
    }

    reset() {
        this.targets = [];
        this.nodes = [];
        const { width: w, height: h } = this.canvas;

        for (let i = 0; i < this.config.numPoints; i++) {
            let x, y;
            if (this.config.preset === 'radial') {
                const a = Math.random() * Math.PI * 2, r = Math.random() * Math.min(w, h) * 0.45;
                x = w / 2 + Math.cos(a) * r; y = h / 2 + Math.sin(a) * r;
            } else if (this.config.preset === 'top_down') {
                x = Math.random() * w; y = h * 0.1 + Math.random() * h * 0.8;
            } else if (this.config.preset === 'veins') {
                x = w * 0.2 + Math.random() * w * 0.75; y = Math.random() * h;
            } else {
                x = Math.random() * w; y = Math.random() * h * 0.9;
            }
            this.targets.push(new Target(x, y));
        }

        if (this.config.preset === 'radial') {
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * Math.PI * 2;
                this.nodes.push(new Node(null, new Vec2(w / 2, h / 2), new Vec2(Math.cos(a), Math.sin(a)), this.config));
            }
        } else if (this.config.preset === 'top_down') {
            this.nodes.push(new Node(null, new Vec2(w / 2, 5), new Vec2(0, 1), this.config));
        } else if (this.config.preset === 'veins') {
            this.nodes.push(new Node(null, new Vec2(10, h / 2), new Vec2(1, 0), this.config));
        } else {
            this.nodes.push(new Node(null, new Vec2(w / 2, h - 5), new Vec2(0, -1), this.config));
        }
    }

    update() {
        if (this.targets.length === 0) return false;
        const influence = new Map();

        for (let i = this.targets.length - 1; i >= 0; i--) {
            const t = this.targets[i];
            let best = null, dMinSq = this.config.infSq;

            for (const n of this.nodes) {
                const dSq = Vec2.distSq(t.pos, n.pos);
                if (dSq < this.config.killSq) {
                    this.targets.splice(i, 1);
                    best = null; break;
                } else if (dSq < dMinSq) {
                    best = n; dMinSq = dSq;
                }
            }
            if (best) {
                if (!influence.has(best)) influence.set(best, []);
                influence.get(best).push(t.pos);
            }
        }

        const spawned = [];
        influence.forEach((pts, node) => {
            const dir = new Vec2(0, 0);
            pts.forEach(p => dir.add(Vec2.clone(p).sub(node.pos)));
            node.dir = dir.normalize();
            const child = node.createChild();
            if (child.pos.x > 0 && child.pos.x < this.canvas.width && child.pos.y > 0 && child.pos.y < this.canvas.height) {
                spawned.push(child);
            }
        });

        if (spawned.length === 0) return false;
        this.nodes.push(...spawned);
        return true;
    }

    draw() {
        const { ctx, canvas: cvs, config: cfg } = this;
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.lineCap = 'round';

        this.nodes.forEach(n => {
            if (!n.parent) return;
            let t = (cfg.preset === 'radial' || cfg.preset === 'veins')
                ? Math.min(1, Math.sqrt(Vec2.distSq(n.pos, new Vec2(cvs.width / 2, cvs.height / 2))) / (cvs.width * 0.4))
                : (cfg.preset === 'top_down' ? n.pos.y / cvs.height : (cvs.height - n.pos.y) / cvs.height);

            ctx.strokeStyle = MathLib.lerpColor(cfg.startColor, cfg.endColor, t);
            ctx.lineWidth = Math.max(0.4, MathLib.lerp(cfg.maxThickness, 0.4, t * t));
            ctx.beginPath();
            ctx.moveTo(n.parent.pos.x, n.parent.pos.y);
            ctx.lineTo(n.pos.x, n.pos.y);
            ctx.stroke();
        });
    }
}