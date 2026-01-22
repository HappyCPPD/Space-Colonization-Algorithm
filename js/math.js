const MathLib = {
    lerp: (a, b, t) => a + (b - a) * t,

    hexToRgb: (hex) => {
        const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return res ? {
            r: parseInt(res[1], 16),
            g: parseInt(res[2], 16),
            b: parseInt(res[3], 16)
        } : null;
    },

    lerpColor: (h1, h2, t) => {
        const c1 = MathLib.hexToRgb(h1);
        const c2 = MathLib.hexToRgb(h2);
        if (!c1 || !c2) return h1;
        const r = Math.round(MathLib.lerp(c1.r, c2.r, t));
        const g = Math.round(MathLib.lerp(c1.g, c2.g, t));
        const b = Math.round(MathLib.lerp(c1.b, c2.b, t));
        return `rgb(${r}, ${g}, ${b})`;
    },

    debounce: (fn, ms) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), ms);
        };
    }
};

class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    scale(s) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    normalize() {
        const l = this.len();
        if (l > 0) this.scale(1 / l);
        return this;
    }

    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    static distSq(v1, v2) {
        return (v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2;
    }

    static clone(v) {
        return new Vec2(v.x, v.y);
    }
}