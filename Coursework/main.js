import * as THREE from 'three';
import * as CANNON from 'cannon';

import { Controls } from 'controls';
import { ModelLoader } from 'loader';
import { Maker } from 'maker';

    
class Demo {
    constructor(models) {
        this.models = models;
        //this.textures = textures;
        
        this.initalize();
    }

    initalize() {
        this.prevTime = performance.now();

        this.initalizeRenderer();
        this.initalizeCamera();
        this.initalizeMeshMats();
        this.initalizeScene();
        this.initalizeWorld();

        this.initalizePlayer();

        this.initalizeBodyMats();
        this.initalizeLights();
        this.initalizeMap();

        this.animate();
        this.onWindowResize();
    }

    initalizeRenderer() {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.physicallyCorrectLights = true;

        this.maker = new Maker(this.renderer.capabilities.getMaxAnisotropy());
    
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener( 'resize', this.onWindowResize.bind(this) );

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xffffff );
        this.scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
    }

    initalizeCamera() {
        const fov = 70;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.05;
        const far = 1000;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far );
        this.camera.position.x = 0;
        this.camera.position.y = 1.5;
    }

    initalizeScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xffffff );
        this.scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
    }

    initalizeWorld() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -25, 0)
        });
    }

    initalizeMeshMats() {
        this.leatherTex1 = this.maker.loadMaterial('leather_8', 'Leather_008_', 'jpg', 1, 1, 'standard');
        this.plasticTex1 = this.maker.loadMaterial('plastic_scratched', 'plastic_0010_', 'png', 1, 1, 'standard');
        this.plasticTex2 = this.maker.loadMaterial('plastic_scratched_2', 'Scratched plastic_', 'jpg', 1, 1, 'standard');
        this.stoneTex1 = this.maker.loadMaterial('wall_stone_22', 'Wall_Stone_022_', 'jpg', 2, 2, 'standard');
        this.ropeTex1 = this.maker.loadMaterial('ropetextures', 'Net_3_', 'png', 3.5, 4.9, 'standard');
        this.tilesTex1 = this.maker.loadMaterial('floor_tiles_06_4k', 'floor_tiles_06_','png', 50,50, 'standard');
        this.woodTex1 = this.maker.loadMaterial('wood_floor_worn_4k.blend', 'wood_floor_worn_', 'png', 8,6, 'standard');
        this.tilesTex2 = this.maker.loadMaterial('freepbr', 'vintage-tile1_', 'png', 1, 1.25,'standard');
    }

    initalizeBodyMats() {
        this.wallMaterial = new CANNON.Material();
        const wallPlayerContactMat = new CANNON.ContactMaterial(
            this.wallMaterial,
            this.playerMaterial,
            {friction: 0, restitution: 0}
        );
        this.world.addContactMaterial(wallPlayerContactMat);
    }

    initalizePlayer() {
        this.playerMaterial = new CANNON.Material({restitution: 0});
        const playerShape = new CANNON.Cylinder(1.175, 1.175, 2.25, 30);
        this.playerBody = new CANNON.Body({
            mass: 30,
            material : this.playerMaterial,
            shape: playerShape,
            sleepSpeedLimit: 10,
        });
        this.playerBody.position.set(0, 10, 0);
        this.playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        this.playerBody.angularFactor = new CANNON.Vec3(0,1,0);
        
        this.world.addBody(this.playerBody);

        this.playerControls = new Controls(this.camera, this.playerBody)
        this.playerControls.getObject().position.set(0, 10, -60); 
        this.scene.add(this.playerControls.getObject());

        const instructions = document.getElementById('instructions');

        instructions.addEventListener('click', () => {
            this.playerControls.lock();
        });

        this.playerControls.addEventListener('lock', () => {
            this.playerControls.enabled = true;
            instructions.style.display = 'none';
        });

        this.playerControls.addEventListener('unlock', () => {
            this.playerControls.enabled = false;
            instructions.style.display = '';
        });
    }

    initalizeLights() {

        // Spotlight source
        const distance = 100.0;
        const angle = Math.PI / 4.0;
        const penumbra = 0.5;
        const decay = 1.0;

        let light = new THREE.SpotLight(
            0x89ECFF, 100.0, distance, Math.PI/2, penumbra, decay);
        light.castShadow = true;
        light.shadow.bias = -0.00001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 100;
    
        light.position.set(0, 50, 0);
        light.lookAt(0, 0, 0);
        this.scene.add(light);

        // Ambient light
        light = new THREE.AmbientLight( 0x404040, 0.4); // soft white light
        this.scene.add( light );
        
        // Hemisphere light

        // const upColour = 0x000000;
        // const downColour = 0x808080;
        // let light = new THREE.HemisphereLight(upColour, downColour, 10);
        // light.color.setHSL( 0.6, 1, 0.6 );
        // light.groundColor.setHSL( 0.095, 1, 0.75 );
        // light.position.set(0, 100, 0);
        // this.scene.add(light);
    }

    initalizeMap() {
        //Skybox
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            './resources/skybox/nightsky_ft.png',
            './resources/skybox/nightsky_bk.png',
            './resources/skybox/nightsky_up.png',
            './resources/skybox/nightsky_dn.png',
            './resources/skybox/nightsky_rt.png',
            './resources/skybox/nightsky_lf.png',
        ]);
    
        this.scene.background = texture;

        // Helper
        const axesHelper = new THREE.AxesHelper( 100 );
        axesHelper.position.set(0,2.5,0);
        this.scene.add( axesHelper );

        // Floor
        this.makeFloor();

        // Walls
        const [wallMesh1, wallBody1] = this.maker.makeStoneWall(new THREE.Vector3(12.5,5,72.5), 
                                            new THREE.Vector3(5, 10, 25), 
                                            this.stoneTex1, this.wallMaterial );
        this.scene.add(wallMesh1);
        this.world.addBody(wallBody1);
        
        const [wallMesh2, wallBody2] = this.maker.makeStoneWall(new THREE.Vector3(12.5,5,72.5), 
                                            new THREE.Vector3(5, 10, 25), 
                                            this.stoneTex1, this.wallMaterial);
        this.scene.add(wallMesh2);
        this.world.addBody(wallBody2);

        // Raised ground
        const tileMaterial = this.tilesTex1
        const tileMesh = new THREE.Mesh(
            new THREE.BoxGeometry(100, 0.5, 80),
            tileMaterial
        );
        tileMesh.position.set(0,0,-20);
        tileMesh.castShadow = true;
        tileMesh.receiveShadow = true;
        this.scene.add(tileMesh);

        this.tileBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(50,0.25,40)),
            mass: 0,
            position: new CANNON.Vec3(0, 0, -20),
            material: this.wallMaterial,
        });
        this.world.addBody(this.tileBody);

        // Ramp

        const ramp = this.maker.makeRamp(2,5,5, new THREE.Vector3(10,0.25,0), 0.6, this.leatherTex1, this.wallMaterial);
        this.scene.add(ramp[0]);
        this.world.addBody(ramp[1]);
        
        // 0x3d91ff  blue
        // 0xffef0f  yellow
        // 0xff002f  red

        const blocks = []

        // Plastic
        let block = this.maker.makeTexturedBox(
                new THREE.Vector3(15,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xff002f),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(10,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xffef0f),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(5,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(0,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xff002f),
                this.plasticTex2,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox(
                new THREE.Vector3(-5,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xffef0f),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-10,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-12-1.75,1.25,-5),
                new THREE.Vector3(2.5,6,5),
                new THREE.Color(0xff002f),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-15-1.25,1.25,-5),
                new THREE.Vector3(2.5,10,5),
                new THREE.Color(0xffef0f),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-18.75,1.25,-5),
                new THREE.Vector3(2.5,14,5),
                new THREE.Color(0x3d91ff),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        let ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(5, 4, -2.49),
                new THREE.Vector2(5,7),
                this.ropeTex1,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(0, 4, -2.49),
                new THREE.Vector2(5,7),
                this.ropeTex1,
                this.wallMaterial 
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(-5, 4, -2.49),
                new THREE.Vector2(5,7),
                this.ropeTex1,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(-10, 4, -2.49),
                new THREE.Vector2(5,7),
                this.ropeTex1,
                this.wallMaterial
        ); blocks.push(ropewall);

        for (let i=0; i<blocks.length; i++) {
            this.scene.add(blocks[i][0]);
            this.world.addBody(blocks[i][1]);
        }


        //other thing
        this.makeBox();

        // Flashlight
        this.makeFlashlight();

    }

    makeFloor() {
        const woodFloor = this.woodTex1;

        const plane1Mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(120, 120),
            woodFloor);
        plane1Mesh.castShadow = false;
        plane1Mesh.receiveShadow = true;
        plane1Mesh.rotation.x = -Math.PI / 2;
        this.scene.add(plane1Mesh);
        plane1Mesh.position.set(0,0,0);

        const checkeredFloor = this.tilesTex2;

        const plane2Mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 25),
            checkeredFloor);
        plane2Mesh.castShadow = false;
        plane2Mesh.receiveShadow = true;
        plane2Mesh.rotation.x = -Math.PI / 2;
        plane2Mesh.position.set(0, 0, 72.5);
        this.scene.add(plane2Mesh);

        const planeMaterial = new CANNON.Material();
        const planeBody = new CANNON.Body({
            shape: new CANNON.Plane(),
            mass: 0,
            material: planeMaterial
        });

        planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
        planeBody.position.set(0,0,0);
        this.world.addBody(planeBody);
        const groundPlayerContactMat = new CANNON.ContactMaterial(
            planeMaterial,
            this.playerMaterial,
            {friction: 0, restitution: 0}
        );
        this.world.addContactMaterial(groundPlayerContactMat);
    }

    connect(i1, j1, i2, j2, dist) {
        this.world.addConstraint(new CANNON.DistanceConstraint(
            this.particles[i1][j1],
            this.particles[i2][j2],
            dist
        ));
    }

    makeStretch() {
        const Nx = 15;
        const Ny = 15;
        const mass = 1;
        const clothSize = 5;
        const dist = clothSize / Nx;

        const shape = new CANNON.Particle();

        this.particles = [];

        for(let i = 0; i < Nx + 1; i++) {
            this.particles.push([]);
            for(let j = 0; j < Ny + 1; j++) {
                const particle = new CANNON.Body({
                    mass: j=== Ny ? 0 : mass,
                    shape,
                    position: new CANNON.Vec3((i - Nx * 0.5) * dist, (j - Ny * 0.5) * dist + 5, 0),
                    velocity: new CANNON.Vec3(0, 0, -0.1 * (Ny - j))
                });
                this.particles[i].push(particle);
                this.world.addBody(particle);
            }
        }


        for(let i = 0; i < Nx + 1; i++) {
            for(let j = 0; j < Ny + 1; j++) {
                if(i < Nx)
                    this.connect(i, j, i + 1, j, dist);
                if(j < Ny)
                    this.connect(i, j, i, j + 1, dist);
            }
        }

        const clothGeometry = new THREE.PlaneGeometry(1, 1, Nx, Ny);

        const clothMat = this.ropeTex1.clone();
        clothMat.transparent = true;
        clothMat.side = THREE.DoubleSide;

        this.clothMesh = new THREE.Mesh(clothGeometry, clothMat);
        this.scene.add(this.clothMesh);
    }

    updateParticules() {
        for(let i = 0; i < 15 + 1; i++) {
            for(let j = 0; j < 15 + 1; j++) {
                const index = j * (15 + 1) + i;
    
                const positionAttribute = this.clothMesh.geometry.attributes.position;
    
                const position = this.particles[i][15 - j].position;
    
                positionAttribute.setXYZ(index, position.x, position.y, position.z);
    
                positionAttribute.needsUpdate = true;
            }
        }
    }

    makeBox() {
        const boxMaterial = this.leatherTex1.clone();
        boxMaterial.transparent = false;
        boxMaterial.color.set(new THREE.Color(0xff002f));
        this.boxMesh = new THREE.Mesh(
            new THREE.BoxGeometry(10, 10, 10),
            boxMaterial,
        );
        this.boxMesh.castShadow = true;
        this.boxMesh.receiveShadow = true;
        this.scene.add(this.boxMesh);

        this.boxBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(5,5,5)),
            mass: 40,
            position: new CANNON.Vec3(0, 20, -30),
            material: new CANNON.Material({friction: 0}),
        });
        this.boxBody.position.y = 10;
        this.world.addBody(this.boxBody);
    }

    makeFlashlight() {
        const model = this.models[0];
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    specular: 0xFFFFFF,
                    shininess: 30,
                });
                child.rotation.y = 0.69;
            }
        });
        model.position.set(0,0,0);
        model.scale.set(8,8,8);
        this.scene.add(model);

        const light = new THREE.SpotLight(
            0xFFFFED, 30, 50, Math.PI/10, 0.2, 1.2);
        light.castShadow = true;
        light.shadow.bias = -0.00001;
        light.shadow.soft = true;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 0.0001;
        light.shadow.camera.far = 100;

    
        light.position.set(0, 0, 0);

        this.scene.add(light);

        const targetObject = new THREE.Object3D();
        this.scene.add(targetObject);
        light.add(targetObject);
        targetObject.position.set(0,0,1);
        light.target = targetObject;

        // const spotLightHelper = new THREE.SpotLightHelper( light );
        // this.scene.add( spotLightHelper );

        model.add(light);
        model.position.set(0,0,0);
        light.position.set(0, 0.03, 0);

        this.flashlight = new THREE.Object3D();
        this.scene.add(this.flashlight);
        this.flashlight.add(model); 
        this.flashlight.position.set(1,-1,-1);
        this.flashlight.rotation.setFromVector3(new THREE.Euler(0, Math.PI, 0, 'XYZ'));

        this.camera.add(this.flashlight);
        
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );

        const time = performance.now();
        const delta = 1/60; 
         
        this.world.step(delta);
        
        //Merging the mesh and the physics
        // this.planeMesh.position.copy(this.planeBody.position);
        // this.planeMesh.quaternion.copy(this.planeBody.quaternion);

        this.boxMesh.position.copy(this.boxBody.position);
        this.boxMesh.quaternion.copy(this.boxBody.quaternion);

        //Updating entities
        this.playerControls.update(delta);

        this.prevTime = time;
        this.renderer.render( this.scene, this.camera );
    }

}

let APP = null;

window.addEventListener('DOMContentLoaded', async () => {
    var loader = new ModelLoader();
    var models = await loader.getModels(); 
    //var textures = await loader.getTextures();
    APP = new Demo(models);
});