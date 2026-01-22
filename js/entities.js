class Target {
    constructor(x, y) {
        this.pos = new Vec2(x, y);
    }
}

class Node {
    /**
     * @param {Node|null} parent - parent node
     * @param {Vec2} pos - screen pos
     * @param {Vec2} dir - gdv
     * @param {object} config - gbc
     */
    constructor(parent, pos, dir, config) {
        this.parent = parent;
        this.pos = Vec2.clone(pos);
        this.dir = Vec2.clone(dir);
        this.config = config;
    }


    createChild() {
        const d = Vec2.clone(this.dir).normalize();
        const p = Vec2.clone(this.pos).add(d.scale(this.config.segLength));
        return new Node(this, p, Vec2.clone(this.dir), this.config);
    }
}