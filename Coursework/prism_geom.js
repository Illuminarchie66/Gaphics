import * as THREE from 'three';

class PrismGeometry extends THREE.ExtrudeGeometry {
    constructor(vertices, height) {
        const shape = new THREE.Shape();

        (function f(ctx) {
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);
        })(shape);

        const settings = {
            depth: height,
            bevelEnabled: false,
        };

        super(shape, settings);
    }
}

export { PrismGeometry };