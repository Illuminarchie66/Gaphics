import * as THREE from 'three';
import * as CANNON from 'cannon';

import { PrismGeometry } from 'prismgeom';

class Maker {
    constructor(anisotropy) {
        this.mapLoader = new THREE.TextureLoader();
        this.maxAnisotropy = anisotropy;
    }

    loadMaterial(dir, name, type, tilingX, tilingY, materialType) {
        const albedo = this.mapLoader.load('./resources/' + dir + '/' + name + 'albedo.' + type);
        if (albedo) {
            albedo.anisotropy = this.maxAnisotropy;
            albedo.wrapS = THREE.RepeatWrapping;
            albedo.wrapT = THREE.RepeatWrapping;
            albedo.repeat.set(tilingX, tilingY);
        }

        const metalMap = this.mapLoader.load('./resources/' + dir + '/' + name + 'metallic.' + type);
        if (metalMap) {
            metalMap.anisotropy = this.maxAnisotropy;
            metalMap.wrapS = THREE.RepeatWrapping;
            metalMap.wrapT = THREE.RepeatWrapping;
            metalMap.repeat.set(tilingX, tilingY);
        }

        const normalMap = this.mapLoader.load('./resources/' + dir + '/' + name + 'normal.' + type);
        if (normalMap) {
            normalMap.anisotropy = this.maxAnisotropy;
            normalMap.wrapS = THREE.RepeatWrapping;
            normalMap.wrapT = THREE.RepeatWrapping;
            normalMap.repeat.set(tilingX, tilingY);
        }

        const roughnessMap = this.mapLoader.load('./resources/' + dir + '/' + name + 'roughness.' + type);
        if (roughnessMap) {
            roughnessMap.anisotropy = this.maxAnisotropy;
            roughnessMap.wrapS = THREE.RepeatWrapping;
            roughnessMap.wrapT = THREE.RepeatWrapping;
            roughnessMap.repeat.set(tilingX, tilingY);
        }

        const aoMap = this.mapLoader.load('./resources/' + dir + '/' + name + 'ao.' + type);
        if (aoMap) {
            aoMap.anisotropy = this.maxAnisotropy;
            aoMap.wrapS = THREE.RepeatWrapping;
            aoMap.wrapT = THREE.RepeatWrapping;
            aoMap.repeat.set(tilingX, tilingY);
        }

        const bumpMap = this.mapLoader.load('./resources/' + dir + '/' + name + 'bump.' + type);
        if (bumpMap) {
            bumpMap.anisotropy = this.maxAnisotropy;
            bumpMap.wrapS = THREE.RepeatWrapping;
            bumpMap.wrapT = THREE.RepeatWrapping;
            bumpMap.repeat.set(tilingX, tilingY);
        }

        const opacityMap = this.mapLoader.load('./resources/' + dir + '/' + name + 'opacity.' + type);
        if (opacityMap) {
            opacityMap.anisotropy = this.maxAnisotropy;
            opacityMap.wrapS = THREE.RepeatWrapping;
            opacityMap.wrapT = THREE.RepeatWrapping;
            opacityMap.repeat.set(tilingX, tilingY);
        }

        const reflectionMap = this.mapLoader.load('./resources/' + dir + '/' + name + 'reflection.' + type);
        if (reflectionMap) {
            reflectionMap.anisotropy = this.maxAnisotropy;
            reflectionMap.wrapS = THREE.RepeatWrapping;
            reflectionMap.wrapT = THREE.RepeatWrapping;
            reflectionMap.repeat.set(tilingX, tilingY);
        }

        let material;
        if (materialType == 'standard') {
            material = new THREE.MeshStandardMaterial({
                metalnessMap: metalMap,
                map: albedo,
                normalMap: normalMap,
                roughnessMap: roughnessMap,
                alphaMap: opacityMap,
                bumpMap: bumpMap,
                aoMap: aoMap,
                envMap: reflectionMap,
            });
        } else if (materialType == 'phong') {
            material = new THREE.MeshPhongMaterial({
                map: albedo,
                normalMap: normalMap,
                alphaMap: opacityMap,
                bumpMap: bumpMap,
                aoMap: aoMap,
                envMap: reflectionMap,
            });
        }

        return material;
    }

    makeTexturedBox(position, scale, color, materialMesh, materialBody) {
        const boxMaterial = materialMesh;
        const boxMesh = new THREE.Mesh(
            new THREE.BoxGeometry(scale.x, scale.y, scale.z),
            boxMaterial,
        );
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        boxMesh.material.color.set(color);
        boxMesh.position.copy(position);

        const boxBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(scale.x/2,scale.y/2,scale.z/2)),
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            material: materialBody,
        });
        
        return [boxMesh, boxBody];
    }

    makeRamp(height, width, depth, position, thatConstant, materialMesh, materialBody) {
        const vertices = [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(width, 0),
            new THREE.Vector2(width, height),
        ];
        
        const prismGeometry = new PrismGeometry(vertices, depth);
        const rampMaterial = materialMesh.clone();
        rampMaterial.color.set(new THREE.Color(0xff002f));
        
        const ramp = new THREE.Mesh(prismGeometry, rampMaterial);
        ramp.setRotationFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
        ramp.position.set(position.x-depth/2, position.y, position.z+width/2);

        const x = depth;
        const z = Math.sqrt((height**2) + (width**2));
        const theta = Math.atan(height/width);
        const y = width*Math.sin(theta);

        const rampBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(x/2,y/2,z/2+thatConstant)),
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            material: materialBody,
        });

        rampBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), theta);

        return [ramp, rampBody];
    }

    makeCylinder(position, height, radius, color, materialMesh) {
        const cylinderMat = materialMesh;
        cylinderMat.color.set(color);
        const cylinderMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, height, 32 ),
            cylinderMat
        );
        cylinderMesh.position.set(position.x, position.y, position.z);
        return cylinderMesh;
    }

    makeStoneWall(position, scale, materialMesh, materialBody) {
        const texturedMaterial = materialMesh.clone();
        texturedMaterial.transparent = false;
        texturedMaterial.side = THREE.DoubleSide;
        texturedMaterial.shadowSide = THREE.FrontSide;
        //texturedMaterial.color = new THREE.Color(0x000000);
        const wall = new THREE.Mesh (
            new THREE.BoxGeometry(scale.x, scale.y, scale.z),
            texturedMaterial
        );
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.position.set(position.x, position.y, position.z);
        
        const wallBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(scale.x/2, scale.y/2, scale.z/2)),
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            material: materialBody,
        });

        return [wall, wallBody];
    }

    makeRopeWall(position, scale, materialMesh, materialBody) {
        const ropeMaterial = materialMesh;
        ropeMaterial.color.set(0x000000);
        ropeMaterial.side = THREE.DoubleSide;
        ropeMaterial.shininess = 50;    
        ropeMaterial.transparent = true;

        const invisMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            color: new THREE.Color(0x000000),
            opacity: 0,
        })
        const ropeMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(scale.x,scale.y),
            ropeMaterial
        );
        ropeMesh.castShadow = false;
        ropeMesh.receiveShadow = true;
        ropeMesh.position.set(position.x,position.y,position.z)

        const ropeBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(scale.x/2,scale.y/2,0.1)),
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            material: materialBody,
        });
        
        return [ropeMesh, ropeBody];
    }

    makeTriangleWall(position, scale, v, materialMesh, materialBody) {
        const ropeMaterial = materialMesh.clone();
        ropeMaterial.color.set(0x000000);
        ropeMaterial.side = THREE.DoubleSide;
        ropeMaterial.shininess = 50;    
        ropeMaterial.transparent = true;
        // vertices[0].multiplyScalar(scale);
        // vertices[1].multiplyScalar(scale);
        // vertices[2].multiplyScalar(scale);

        const invisMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            color: new THREE.Color(0x000000),
            opacity: 0,
        })

        let vertices = new Float32Array([
            7.5, 14.25, -9.5,    // vertex 1
            17.5, 14.25, -9.5,     // vertex 2
            17.5, 19.25, -9.5,      // vertex 3
        ]);

        vertices = new Float32Array([
            position.x+v[0].x*scale, position.y+v[0].y*scale, position.z+v[0].z*scale,    // vertex 1
            position.x+v[1].x*scale, position.y+v[1].y*scale, position.z+v[1].z*scale,     // vertex 2
            position.x+v[2].x*scale, position.y+v[2].y*scale, position.z+v[2].z*scale,      // vertex 3
        ]);

        const uvs = new Float32Array([
            0, 0,   // UV for Vertex 1
            1, 0,   // UV for Vertex 2
            1, 1    // UV for Vertex 3
          ]);
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        const material = new THREE.MeshBasicMaterial({ color: 'red' });
        const mesh = new THREE.Mesh(geometry, ropeMaterial);
        // const ropeMesh = new THREE.Mesh(
        //     new THREE.Triangle(                    
        //         new THREE.Vector3(-0.5, 0, 0),
        //         new THREE.Vector3(0.5, 0, 0),
        //         new THREE.Vector3(0.5, 0.5, 0)),
        //     new THREE.MeshNormalMaterial()
        // );
        // ropeMesh.castShadow = false;
        // ropeMesh.receiveShadow = true;
        // ropeMesh.position.set(position.x,position.y,position.z);

        const scaleX = scale*Math.abs(v[1].x - v[0].x);
        const scaleY = scale*Math.abs(v[2].y - v[1].y);
        console.log(scaleX);
        console.log(scaleY);
        const ropeBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(scaleX/2,scaleY/2,0.1)),
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            material: materialBody,
        });
        
        return [mesh, ropeBody];
    }

    makeFoamWall(position, scale, color, materialMesh, materialBody) {
        const foamMaterial = materialMesh;
        foamMaterial.color.set(color);
        foamMaterial.side = THREE.DoubleSide;
        foamMaterial.shininess = 50;    

        const foamMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(scale.x,scale.y),
            foamMaterial
        );
        foamMesh.castShadow = false;
        foamMesh.receiveShadow = true;
        foamMesh.position.set(position.x,position.y,position.z)

        const foamBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(scale.x/2,scale.y/2,0.1)),
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            material: materialBody,
        });
        
        return [foamMesh, foamBody];
    }

    makePlasticWall(position, scale, color, materialMesh, materialBody) {
        const plasticMaterial = materialMesh.clone();
        plasticMaterial.color.set(color);
        plasticMaterial.side = THREE.DoubleSide; 

        const plasticMesh = new THREE.Mesh(
            new THREE.BoxGeometry(scale.x, scale.y, 0.03),
            plasticMaterial
        );
        plasticMesh.castShadow = false;
        plasticMesh.receiveShadow = true;
        plasticMesh.position.set(position.x,position.y,position.z);
        
        const v = [new THREE.Vector2(-1,0),
            new THREE.Vector2(-0.5,0.866),
            new THREE.Vector2(0.5, 0.866),
            new THREE.Vector2(1, 0),
            new THREE.Vector2(0.5, -0.866),
            new THREE.Vector2(-0.5, -0.866)]

        function scalarMultiply(vector, scalar) { return new THREE.Vector2().copy(vector).multiplyScalar(scalar); }

        const geom = new PrismGeometry(
            v.map(vector => scalarMultiply(vector, 0.1)),
            0.2
        );
        const hexMaterial = materialMesh.clone();
        hexMaterial.color.set(new THREE.Color(0xc49206))

        let hexbolt = new THREE.Mesh(geom, hexMaterial);
        hexbolt.position.set(scale.x/2-0.15,scale.y/2-0.15,-0.15);
        plasticMesh.add(hexbolt)

        hexbolt = new THREE.Mesh(geom, hexMaterial);
        hexbolt.position.set(-scale.x/2+0.15,scale.y/2-0.15,-0.15);
        plasticMesh.add(hexbolt)

        hexbolt = new THREE.Mesh(geom, hexMaterial);
        hexbolt.position.set(scale.x/2-0.15,-scale.y/2+0.15,-0.15);
        plasticMesh.add(hexbolt)

        hexbolt = new THREE.Mesh(geom, hexMaterial);
        hexbolt.position.set(-scale.x/2+0.15,-scale.y/2+0.15,-0.15);
        plasticMesh.add(hexbolt)

        const plasticBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(scale.x/2,scale.y/2,0.25)),
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y, position.z),
            material: materialBody,
        });
        
        return [plasticMesh, plasticBody];
    }

    makeTube(position, tubeLength, tubeRadius, color, materialMesh, materialBody) {
        const path = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, tubeLength));

        const tubeGeometry = new THREE.TubeGeometry(path, 10, tubeRadius, 20);

        const material = materialMesh.clone()
        material.side = THREE.DoubleSide;
        material.color.set(color);

        const horiLength = tubeRadius*Math.sin(3*Math.PI/8);
        const tubeMesh = new THREE.Mesh(tubeGeometry, material);
        tubeMesh.position.set(position.x,position.y+horiLength,position.z);
        tubeMesh.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/8);

        const body = [];
        let tubeBody;

        tubeBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.1, 5)),
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y-0.05, position.z+tubeLength/2),
            material: materialBody,
        });
        body.push(tubeBody);

        tubeBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.1, 5)),
            mass: 0,
            position: new CANNON.Vec3(position.x, position.y+2*horiLength+0.05, position.z+tubeLength/2),
            material: materialBody,
        });
        body.push(tubeBody);

        tubeBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(0.2, 0.5, 5)),
            mass: 0,
            position: new CANNON.Vec3(position.x+horiLength, position.y, position.z+tubeLength/2),
            material: materialBody,
        });
        body.push(tubeBody);

        tubeBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(0.2, 0.5, 5)),
            mass: 0,
            position: new CANNON.Vec3(position.x-horiLength, position.y, position.z+tubeLength/2),
            material: materialBody,
        });
        body.push(tubeBody);

        return [tubeMesh, body];
    }

    makeBall(position, radius, color, materialMesh, materialBody) {
        materialMesh.color.set(color);
        const geometry = new THREE.SphereGeometry( radius, 32, 16 ); 
        const sphere = new THREE.Mesh( geometry, materialMesh ); 
        sphere.position.set(position.x, position.y, position.z);

        const sphereShape = new CANNON.Sphere(radius/2)
        const sphereBody = new CANNON.Body({ mass: 1, shape: sphereShape, material: materialBody })
        sphereBody.position.set(new CANNON.Vec3(position.x, position.y, position.z));

        return [sphere, sphereBody];
    }

}

export { Maker }