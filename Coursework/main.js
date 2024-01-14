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
        //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.powerprefer
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
        this.camera.position.y = 1.2;
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
        this.plasticTex3 = this.maker.loadMaterial('plastic_10', 'Rubber material_', 'jpg', 1, 1, 'standard');

        this.stoneTex1 = this.maker.loadMaterial('wall_stone_22', 'Wall_Stone_022_', 'jpg', 2, 2, 'standard');

        this.ropeTex1 = this.maker.loadMaterial('ropetexsmall', 'Net_3_', 'png', 3.5, 4.9, 'phong');
        this.ropeTex2 = this.maker.loadMaterial('ropetexsmall', 'Net_3_', 'png', 4.9, 3.5, 'phong');
        this.ropeTex3 = this.maker.loadMaterial('ropetexsmall', 'Net_3_', 'png', 3.5, 9.8, 'phong');
        this.ropeTex4 = this.maker.loadMaterial('ropetexsmall', 'Net_3_', 'png', 5.145, 3.5, 'phong');
        this.ropeTex5 = this.maker.loadMaterial('ropetexsmall', 'Net_3_', 'png', 7, 3.5, 'phong');
        this.ropeTex6 = this.maker.loadMaterial('ropetexsmall', 'Net_3_', 'png', 3.5, 3.85, 'phong');
        this.ropeTex7 = this.maker.loadMaterial('ropetexsmall', 'Net_3_', 'png', 3.5, 3.5, 'phong');
        this.ropeTex8 = this.maker.loadMaterial('ropetexsmall', 'Net_3_', 'png', 7, 0.525, 'phong');
		this.ropeTex9 = this.maker.loadMaterial('ropetexsmall', 'Net_3_', 'png', 5.25, 3.85, 'phong');
		//this.ropeTex10 = this.maker.loadMaterial('ropetexsmall', 'Net_3_', 'png', 10.5, 3.85, 'phong');

        this.tilesTex1 = this.maker.loadMaterial('floor_tiles_06_4k', 'floor_tiles_06_','png', 50,50, 'standard');
        this.tilesTex2 = this.maker.loadMaterial('freepbr', 'vintage-tile1_', 'png', 1, 1.25,'standard');

        this.woodTex1 = this.maker.loadMaterial('wood_floor_worn_4k.blend', 'wood_floor_worn_', 'png', 8,6, 'standard');

        this.foamTex1 = this.maker.loadMaterial('fabric_padded', 'Fabric_Padded_Wall_001_', 'jpg', 6.5,1.4, 'standard');
        this.foamTex2 = this.maker.loadMaterial('fabric_padded', 'Fabric_Padded_Wall_001_', 'jpg', 0.5,1, 'standard');
        this.foamTex3 = this.maker.loadMaterial('fabric_padded', 'Fabric_Padded_Wall_001_', 'jpg', 3.5,3, 'standard');
        this.foamTex4 = this.maker.loadMaterial('fabric_padded', 'Fabric_Padded_Wall_001_', 'jpg', 1,3, 'standard');
        this.foamTex5 = this.maker.loadMaterial('fabric_padded', 'Fabric_Padded_Wall_001_', 'jpg', 0.4,1.4, 'standard');
        this.foamTex6 = this.maker.loadMaterial('fabric_padded', 'Fabric_Padded_Wall_001_', 'jpg', 1,1.5, 'standard');
        this.foamTex7 = this.maker.loadMaterial('fabric_padded', 'Fabric_Padded_Wall_001_', 'jpg', 2,0.8, 'standard');
		
    }

    initalizeBodyMats() {
        this.wallMaterial = new CANNON.Material();
        const wallPlayerContactMat = new CANNON.ContactMaterial(
            this.wallMaterial,
            this.playerMaterial,
            {friction: 0, restitution: 0}
        );
        this.world.addContactMaterial(wallPlayerContactMat);

		this.ballMaterial = new CANNON.Material({friction: 0.5, restitution: 0.7});
    }

    initalizePlayer() {
        this.playerMaterial = new CANNON.Material({restitution: 0});
        const playerShape = new CANNON.Cylinder(1.175, 1.175, 2.5, 30);
        this.playerBody = new CANNON.Body({
            mass: 30,
            material : this.playerMaterial,
            shape: playerShape,
            sleepSpeedLimit: 10,
        });
        this.playerBody.position.set(-8, 1.5, 10);
        this.playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        this.playerBody.angularFactor = new CANNON.Vec3(0,1,0);
        
        this.world.addBody(this.playerBody);

        this.playerControls = new Controls(this.camera, this.playerBody)
        this.playerControls.getObject().position.set(-8, 1.5, 10); 
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

        // Plastic
        this.makeBlocks();

        // Ropes
        this.makeRopeWalls();  
        
        // Foam 
        this.makeFoamWalls1();

        // Plastic wall
        this.makePlasticWalls();

        // Posts
        this.makePosts();

		// Balls
		this.ballList = [];
		let ball;
		const colors = [new THREE.Color(0x3d91ff), new THREE.Color(0xffef0f),  new THREE.Color(0xff002f)]
		for (let i=0; i<5; i++) {
			ball = this.maker.makeBall(new THREE.Vector3(20, 1, -15), 0.5, colors[i%3], 
								new THREE.MeshPhongMaterial({shininess: 50}),
								this.ballMaterial);
			this.scene.add(ball[0]);
			this.world.addBody(ball[1]);
			this.ballList.push(ball);
		}
		
        // Tube
        const tube = this.maker.makeTube(
            new THREE.Vector3(-17.5,8.25+0.15,-21), 
            12, 2, 
            new THREE.Color(0x7816f7),
            this.plasticTex3, 
            this.wallMaterial
        );
        this.scene.add(tube[0]);
        for (let i=0; i<4; i++) {
            this.world.addBody(tube[1][i]);
        }

        // Flashlight
        this.makeFlashlight();

    }

    makeBlocks() {
        const blocks = [];
        let block = this.maker.makeTexturedBox(
                new THREE.Vector3(20,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox(
                new THREE.Vector3(15,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xff002f),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(10,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(5,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xff002f),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(0,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex2,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox(
                new THREE.Vector3(-5,1.25,-5),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xff002f),
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

        // Leather blocks

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
                new THREE.Color(0x3d91ff),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-18.75,1.25,-5),
                new THREE.Vector3(2.5,14,5),
                new THREE.Color(0xff002f),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-17.5,7.25,-10),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-17.5,7.25,-22),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xff002f),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-12.5,7.25,-22),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-7.5,7.25,-22),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xff002f),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-2.5,7.25,-22),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-7.5,7.25,-17),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xff002f),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-2.5,7.25,-17),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.leatherTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(6-2*Math.sin(Math.atan(6/12)),4.25,-22),
                new THREE.Vector3(13.4164,2,5),
                new THREE.Color(0x3d91ff),
                this.leatherTex1,
                this.wallMaterial
        ); 
        block[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), -Math.atan(5/10));
        block[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), -Math.atan(5/10));
        blocks.push(block);

        block = this.maker.makeTexturedBox(
                new THREE.Vector3(15,1.25,-22),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xff002f),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(10,1.25,-22),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(10+5+5+2.5,0.35,-22+7.5-2.5),
                new THREE.Vector3(10,0.2,15),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox(
                new THREE.Vector3(15,1.25,-12),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0xff002f),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(10,1.25,-12),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(5+1.25,2.25,-12+1.25),
                new THREE.Vector3(2.5,4,2.5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(5+1.25,3.25,-12-1.25),
                new THREE.Vector3(2.5,6,2.5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(5-1.25,4.25,-12-1.25),
                new THREE.Vector3(2.5,8,2.5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(5-1.25,5.25,-12+1.25),
                new THREE.Vector3(2.5,10,2.5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(10,9.25,-12),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(15,9.25,-12),
                new THREE.Vector3(5,2,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(2.5,9.25,-8.5),
                new THREE.Vector3(30,2,2),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(-13.5, 11.25,-8.5),
                new THREE.Vector3(2,4,2),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(15-5/3,10.75,-12),
                new THREE.Vector3(5/3,1,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(15,11.25,-12),
                new THREE.Vector3(5/3,2,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        block = this.maker.makeTexturedBox( 
                new THREE.Vector3(15+5/3,11.75,-12),
                new THREE.Vector3(5/3,3,5),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(block);

        for (let i=0; i<3; i++) {
            block = this.maker.makeTexturedBox( 
                    new THREE.Vector3(20,12.5,-12-5*i),
                    new THREE.Vector3(5,2,5),
                    new THREE.Color(0x3d91ff),
                    this.plasticTex1,
                    this.wallMaterial
            ); blocks.push(block);

            block = this.maker.makeTexturedBox( 
                    new THREE.Vector3(25,12.5,-12-5*i),
                    new THREE.Vector3(5,2,5),
                    new THREE.Color(0x3d91ff),
                    this.plasticTex1,
                    this.wallMaterial
            ); blocks.push(block);
        }



        for (let i=0; i<blocks.length; i++) {
            this.scene.add(blocks[i][0]);
            this.world.addBody(blocks[i][1]);
        }
    }

    makeRopeWalls() {
        const blocks = [];

        let ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(5, 4.25, -2.49),
                new THREE.Vector2(5,8),
                this.ropeTex1,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(15, 4.25, -2.49),
                new THREE.Vector2(5,8),
                this.ropeTex1,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(20, 4.25, -2.49),
                new THREE.Vector2(5,8),
                this.ropeTex1,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(20+2.51, 4.25, -5),
                new THREE.Vector2(5,8),
                this.ropeTex1,
                this.wallMaterial
        ); blocks.push(ropewall);
        ropewall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
        ropewall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(20, 4.25, -7.51),
                new THREE.Vector2(5,8),
                this.ropeTex1,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(0, 4.25, -2.49),
                new THREE.Vector2(5,8),
                this.ropeTex1,
                this.wallMaterial 
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(-5, 4.25, -2.49),
                new THREE.Vector2(5,8),
                this.ropeTex1,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(-10, 4.25, -2.49),
                new THREE.Vector2(5,8),
                this.ropeTex1,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(-16.35, 4.25+4+2.5, -2.49),
                new THREE.Vector2(7.35,5),
                this.ropeTex4,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(5, 7.25, -14.5),
                new THREE.Vector2(5,14),
                this.ropeTex3,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(2.5, 7.25, -12),
                new THREE.Vector2(5,14),
                this.ropeTex3,
                this.wallMaterial
        ); 
        ropewall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        ropewall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        blocks.push(ropewall);

        for (let i=0; i<3; i++) {
            ropewall = this.maker.makeRopeWall(
                    new THREE.Vector3(-20.01, 4.25+4+2.5, -5-i*5),
                    new THREE.Vector2(5,5),
                    this.ropeTex1,
                    this.wallMaterial
            ); blocks.push(ropewall);
            ropewall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
            ropewall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        }

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(-20.01, 4.25+4+2.5, -21),
                new THREE.Vector2(7,5),
                this.ropeTex2,
                this.wallMaterial
        ); blocks.push(ropewall);
        ropewall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        ropewall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);

        for (let i=0; i<8; i++) {
            ropewall = this.maker.makeRopeWall(
                    new THREE.Vector3(-17.5+5*i, 4.25+4+2.5, -24.51),
                    new THREE.Vector2(5,5),
                    this.ropeTex1,
                    this.wallMaterial
            ); blocks.push(ropewall);
            ropewall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI);
            ropewall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI);
        }

        for (let i=0; i<8; i++) {
			ropewall = this.maker.makeRopeWall(
					new THREE.Vector3(-17.5+i*5, 16.25, -24.5),
					new THREE.Vector2(5,5.5),
					this.ropeTex6,
					this.wallMaterial
			); blocks.push(ropewall);
        }

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(12.5, 11.75, -9.49),
                new THREE.Vector2(10,5),
                this.ropeTex5,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeTriangleWall(
                new THREE.Vector3(12.5, 11.75+2.5, -9.49),
                5,
                [
                    new THREE.Vector3(-1, 0, 0),
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(1, 1, 0)
                ],
                this.ropeTex5,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeTriangleWall(
                new THREE.Vector3(12.5, 11.75+2.5, -14.51),
                5,
                [
                    new THREE.Vector3(-1, 0, 0),
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(1, 1, 0)
                ],
                this.ropeTex5,
                this.wallMaterial
        ); blocks.push(ropewall);

        for (let i=0; i<2; i++) {
            ropewall = this.maker.makeRopeWall(
                    new THREE.Vector3(20+i*5, 16.25, -9.5),
                    new THREE.Vector2(5,5.5),
                    this.ropeTex6,
                    this.wallMaterial
            ); blocks.push(ropewall);
        }

		ropewall = this.maker.makeRopeWall(
				new THREE.Vector3(23.75, 16.25, -24.5),
				new THREE.Vector2(7.5,5.5),
				this.ropeTex9,
				this.wallMaterial
		); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(5, 11.75, -12+2.51),
                new THREE.Vector2(5,5),
                this.ropeTex7,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeRopeWall(
                new THREE.Vector3(12.5, 13.875, -14.51),
                new THREE.Vector2(10,0.75),
                this.ropeTex8,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeTriangleWall(
                new THREE.Vector3(-7.5, 8.25, -2.5),
                5,
                [
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(-1, 0, 0),
                    new THREE.Vector3(-1, 1, 0)
                ],
                this.ropeTex5,
                this.wallMaterial
        ); blocks.push(ropewall);

        ropewall = this.maker.makeTriangleWall(
                new THREE.Vector3(-20, 8.25+5+3, -13.5),
                3,
                [
                    new THREE.Vector3(0, -1, 11/3),
                    new THREE.Vector3(0, -1, -11/3),
                    new THREE.Vector3(0, 1, -11/3)
                ],
                this.ropeTex5,
                this.wallMaterial
        ); 
        blocks.push(ropewall);

		ropewall = this.maker.makeRopeWall(
				new THREE.Vector3(27.51, 16.25, -17),
				new THREE.Vector2(15,5.5),
				this.ropeTex1,
				this.wallMaterial
		); blocks.push(ropewall);
		ropewall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
		ropewall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);

        for (let i=0; i<blocks.length; i++) {
            this.scene.add(blocks[i][0]);
            this.world.addBody(blocks[i][1]);
        }
    }

    makeFoamWalls1() {
        let foamWall;
        const blocks = [];

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(1.25, 4.75, -7.499),
                new THREE.Vector2(32.5,7),
                new THREE.Color(0xe8da1a),
                this.foamTex1,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI);
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(-13.75, 4.75+6, -7.499),
                new THREE.Vector2(2.5,5),
                new THREE.Color(0xe8da1a),
                this.foamTex2,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI);
        blocks.push(foamWall);
        
        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(-14.99, 4.75+6, -8.75),
                new THREE.Vector2(2.5,5),
                new THREE.Color(0xe8da1a),
                this.foamTex2,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        blocks.push(foamWall);

        foamWall = this.maker.makePlasticWall(
                new THREE.Vector3(-15, 6.75, -15+0.5),
                new THREE.Vector2(10,13),
                new THREE.Color(0xe8da1a),
                this.plasticTex1,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        blocks.push(foamWall);
        
        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(8.75, 6, -19.499),
                new THREE.Vector2(17.5,15),
                new THREE.Color(0xe8da1a),
                this.foamTex3,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI);
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(17.499, 6, -17),
                new THREE.Vector2(5,15),
                new THREE.Color(0xe8da1a),
                this.foamTex4,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(0.01, 6, -17),
                new THREE.Vector2(5,15),
                new THREE.Color(0xe8da1a),
                this.foamTex4,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(-2.5, 6, -14.499),
                new THREE.Vector2(5,15),
                new THREE.Color(0xe8da1a),
                this.foamTex4,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI);
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(-7.5, 6, -14.499),
                new THREE.Vector2(5,15),
                new THREE.Color(0xe8da1a),
                this.foamTex4,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI);
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(7.5, 6, -17),
                new THREE.Vector2(5,15),
                new THREE.Color(0xe8da1a),
                this.foamTex4,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(-10.01, 6, -17),
                new THREE.Vector2(5,15),
                new THREE.Color(0xe8da1a),
                this.foamTex4,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(-12.5, 6, -19.499),
                new THREE.Vector2(5,15),
                new THREE.Color(0xe8da1a),
                this.foamTex4,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI);
        blocks.push(foamWall);

        for (let i=0; i<7; i++) {
            foamWall = this.maker.makeFoamWall(
                    new THREE.Vector3(15-5*i, 4.75, -9.499),
                    new THREE.Vector2(5,7),
                    new THREE.Color(0xe8da1a),
                    this.foamTex6,
                    this.wallMaterial
            ); 
            foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI);
            foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI);
            blocks.push(foamWall);
        }

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(10, 4.75, -9.499-5),
                new THREE.Vector2(5,7),
                new THREE.Color(0xe8da1a),
                this.foamTex6,
                this.wallMaterial
        ); 
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(15, 4.75, -9.499-5),
                new THREE.Vector2(5,7),
                new THREE.Color(0xe8da1a),
                this.foamTex6,
                this.wallMaterial
        ); 
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(17.5, 3.75, -8.5),
                new THREE.Vector2(2, 9),
                new THREE.Color(0xe8da1a),
                this.foamTex5,
                this.wallMaterial
        ); 
        foamWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        foamWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        blocks.push(foamWall);

        foamWall = this.maker.makeFoamWall(
                new THREE.Vector3(12.5, 11.5, -14.51),
                new THREE.Vector2(10, 4),
                new THREE.Color(0xe8da1a),
                this.foamTex7,
                this.wallMaterial
        ); 
        blocks.push(foamWall);

        for (let i=0; i<blocks.length; i++) {
            this.scene.add(blocks[i][0]);
            this.world.addBody(blocks[i][1]);
        }
    }

    makePlasticWalls() {
        const blocks = [];
        let plasticWall = this.maker.makePlasticWall(
                new THREE.Vector3(-16.35, 4.25, -2.475),
                new THREE.Vector2(7.35,8),
                new THREE.Color(0xff002f),
                this.plasticTex1,
                this.wallMaterial
        ); blocks.push(plasticWall);

        plasticWall = this.maker.makePlasticWall(
                new THREE.Vector3(-20.025, 4.25, -5),
                new THREE.Vector2(5,8),
                new THREE.Color(0xe8da1a),
                this.plasticTex1,
                this.wallMaterial
        ); 
        plasticWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        plasticWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        blocks.push(plasticWall);

        plasticWall = this.maker.makePlasticWall(
                new THREE.Vector3(-20.025, 4.25, -10),
                new THREE.Vector2(5,8),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); 
        plasticWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        plasticWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        blocks.push(plasticWall);

        plasticWall = this.maker.makePlasticWall(
                new THREE.Vector3(-20.025, 4.25, -15),
                new THREE.Vector2(5,8),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); 
        plasticWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        plasticWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        blocks.push(plasticWall);

        plasticWall = this.maker.makePlasticWall(
                new THREE.Vector3(-20.025, 4.25, -21),
                new THREE.Vector2(7,8),
                new THREE.Color(0x3d91ff),
                this.plasticTex1,
                this.wallMaterial
        ); 
        plasticWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        plasticWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI/2);
        blocks.push(plasticWall);
        
        for (let i=0; i<8; i++) {
            plasticWall = this.maker.makePlasticWall(
                    new THREE.Vector3(-17.5+i*5, 4.25, -19.525-5),
                    new THREE.Vector2(5,8),
                    new THREE.Color(0xff002f),
                    this.plasticTex1,
                    this.wallMaterial
            );
            plasticWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI);
            plasticWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), -Math.PI);
            blocks.push(plasticWall);
        }

        plasticWall = this.maker.makePlasticWall(
                new THREE.Vector3(22.5, 0.25+1.25, -17+7.5+0.015),
                new THREE.Vector2(10,2.5),
                new THREE.Color(0xff002f),
                this.plasticTex1,
                this.wallMaterial
        );
        blocks.push(plasticWall);

        plasticWall = this.maker.makePlasticWall(
                new THREE.Vector3(22.5+5+0.015, 0.25+1.25, -17),
                new THREE.Vector2(15,2.5),
                new THREE.Color(0xff002f),
                this.plasticTex1,
                this.wallMaterial
        );
        plasticWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
        plasticWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
        blocks.push(plasticWall);

        plasticWall = this.maker.makePlasticWall(
                new THREE.Vector3(22.5+1.25, 0.25+1.25, -17-7.5-0.015),
                new THREE.Vector2(7.5,2.5),
                new THREE.Color(0xff002f),
                this.plasticTex1,
                this.wallMaterial
        );
        plasticWall[0].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI);
        plasticWall[1].quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI);
        blocks.push(plasticWall);

        for (let i=0; i<blocks.length; i++) {
            this.scene.add(blocks[i][0]);
            this.world.addBody(blocks[i][1]);
        }
    }

    makePosts() {
        let post = this.maker.makeCylinder(
                new THREE.Vector3(12.5,4.25,-2.5),
                8, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(7.5,4.25,-2.5),
                8, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(-2.5,4.25,-2.5),
                8, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(-12.5,6.75,-2.5),
                13, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(-12.5,6.75,-2.5-5),
                13, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(-20,6.75,-2.5),
                13, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        for (let i=0; i<5; i++) {
            post = this.maker.makeCylinder(
                    new THREE.Vector3(-20+i*10,9.75,-24.5),
                    19, 0.2, 
                    new THREE.Color(0xe8da1a),
                    this.plasticTex1
            ); this.scene.add(post);
        }

        post = this.maker.makeCylinder(
                new THREE.Vector3(22.5,4.25,-2.5),
                8, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(22.5,4.25,-7.5),
                8, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(17.5,4.25,-7.5),
                8, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(5+2.5,7.25,-12+2.5),
                14, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(5-2.5,7.25,-12+2.5),
                14, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(5+2.5,7.25,-12-2.5),
                14, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(5-2.5,7.25,-12-2.5),
                14, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(27.5,9.75,-9.5),
                19, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(27.5,9.75,-24.5),
                19, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(17.5,14.25,-9.5),
                10, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(17.5,14.25,-14.5),
                10, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(5,14.25,-12+2.5),
                5, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(5,14.25,-12-2.5),
                5, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(5-2.5,14.25,-12),
                5, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(12.5,16.75,-12+2.5),
                5*Math.sqrt(5), 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), -Math.atan(10/5));
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(12.5,16.75,-12-2.5),
                5*Math.sqrt(5), 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), -Math.atan(10/5));
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(27.5,15+1.25,-17),
                5.5, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(10,8.25,-5+2.5),
                25, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(5,8.25,-5-2.5),
                35, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(20+2.5,8.25,-5),
                5, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(-7.5,10.5+0.25,-5+2.5),
                5*Math.sqrt(5), 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.atan(10/5));
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(-7.5,10.5+0.25,-5-2.5),
                5*Math.sqrt(5), 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.atan(10/5));
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(-20,13.25,-13.5),
                17+5, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(3.75,13.25,-24.5),
                47.5, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(3.75,13.25+6,-24.5),
                47.5, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(-16.25,13.25,-2.5),
                7.5, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(-20,16.25,-13.5),
                2*Math.sqrt(130), 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.atan(22/6));
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(27.5,13.25+6,-17),
                15, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(17.5,13.25+6,-17),
                15, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
        this.scene.add(post);

        post = this.maker.makeCylinder(
                new THREE.Vector3(22.5,13.25+6,-9.5),
                10, 0.2, 
                new THREE.Color(0xe8da1a),
                this.plasticTex1
        ); 
        post.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
        this.scene.add(post);

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
            0xFFFFED, 15, 50, Math.PI/10, 0.2, 1.2);
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

        console.log(this.playerBody.position);

		for (let i=0; i<this.ballList.length; i++) {
			this.ballList[i][0].position.copy(this.ballList[i][1].position);
			this.ballList[i][0].quaternion.copy(this.ballList[i][1].quaternion);
		}

		console.log(this.ballList);
        
        //Merging the mesh and the physics
        // this.planeMesh.position.copy(this.planeBody.position);
        // this.planeMesh.quaternion.copy(this.planeBody.quaternion);

        // this.boxMesh.position.copy(this.boxBody.position);
        // this.boxMesh.quaternion.copy(this.boxBody.quaternion);

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