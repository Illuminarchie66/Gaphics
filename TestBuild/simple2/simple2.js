import * as THREE from 'three';
import * as CANNON from 'cannon';
import { PointerLockControls } from 'plc';


class Controls {
    constructor(camera, scene, world, player) {
        this.camera = camera;
        this.scene = scene;
        this.world = world;
        this.controls = new PointerLockControls(camera, document.body);

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = true;

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

        this.playerMesh = player;

        this.playerPos = new THREE.Vector3();

        this.playerBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(2.5,5,2.5)),
            mass: 40,
            position: new CANNON.Vec3(0, 20, 0),
            material: new CANNON.Material({
                friction: 1, // Set the friction coefficient (adjust as needed)
                restitution: 1 // Set the restitution (bounciness) coefficient (adjust as needed)
              }),
        })
        this.world.addBody(this.playerBody);

        this.initalize();
    }

    initalize() {
        const blocker = document.getElementById('blocker');
        const instructions = document.getElementById('instructions');

        instructions.addEventListener('click', () => {
            this.controls.lock();
        });

        this.controls.addEventListener('lock', () => {
            instructions.style.display = 'none';
            blocker.style.display = 'none';
        });

        this.controls.addEventListener('unlock', () => {
            blocker.style.display = 'block';
            instructions.style.display = '';
        });

        this.scene.add(this.controls.getObject());

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
    }

    onKeyDown( event ) {
        switch ( event.code ) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = true;
                break;
            case 'Space':
                if ( this.canJump === true ) this.velocity.y += 250;
                this.canJump = false;
                break;
        }
    }

    onKeyUp( event ) {
        switch ( event.code ) {
            case 'ArrowUp':
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.moveRight = false;
                break;
        }
    }

    update(elapsed, onObject) {
        this.velocity.x -= this.velocity.x * 10.0 * elapsed;
        this.velocity.z -= this.velocity.z * 10.0 * elapsed;
        
        //this.velocity.y = 0;
        //this.velocity.y -= 9.8 * 100.0 * elapsed;

        this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
        this.direction.x = Number( this.moveRight ) - Number( this.moveLeft );
        this.direction.normalize(); // this ensures consistent movements in all directions

        if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 400.0 * elapsed;
        if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 400.0 * elapsed;

        // if ( onObject === true ) {

        //     this.velocity.y = Math.max( 0, this.velocity.y );
        //     this.canJump = true;

        // }

        // this.controls.moveRight( - this.velocity.x * elapsed );
        // this.controls.moveForward( - this.velocity.z * elapsed );

        this.controls.moveRight( - this.velocity.x * elapsed );
        this.controls.moveForward( - this.velocity.z * elapsed );

        const quat = new THREE.Quaternion().setFromEuler(this.controls.getObject().rotation)
        const quat2 = new THREE.Quaternion(0, quat.y, 0, quat.w);
        this.playerMesh.quaternion.copy(quat2);
        
        this.playerBody.quaternion.copy(quat2);

        //this.playerBody.position.copy(this.controls.getObject().position);
        this.controls.getObject().position.y = this.playerBody.position.y;
        this.playerBody.position.x = this.controls.getObject().position.x;
        this.playerBody.position.z = this.controls.getObject().position.z;

        this.playerMesh.position.copy(this.playerBody.position);
        this.playerMesh.position.y = 15;
        this.playerMesh.quaternion.copy(this.playerBody.quaternion);

    }

    update2(elapsed) {

    }
}

class Demo {
    constructor() {
        this.initalize();
    }

    initalize() {
        this.prevTime = performance.now();
        this.initalizeRenderer();
        this.initalizeLights();
        this.initalizeWorld();
        this.initalizeScene();
        this.initalizePlayer();
        this.initalizeControls();

        this.animate();
        this.onWindowResize();
    }

    initalizeRenderer() {
        this.renderer = new THREE.WebGLRenderer({antialias: false});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.physicallyCorrectLights = true;
    
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener( 'resize', this.onWindowResize.bind(this) );
        
        const fov = 70;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 1.0;
        const far = 1000;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far );
        this.camera.position.y = 0;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xffffff );
        this.scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

        this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    }

    initalizeWorld() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.81, 0)
        });
    }

    initalizeLights() {
        const distance = 50.0;
        const angle = Math.PI / 4.0;
        const penumbra = 0.5;
        const decay = 1.0;

        let light = new THREE.SpotLight(
            0xFFFFFF, 100.0, distance, angle, penumbra, decay);
        light.castShadow = true;
        light.shadow.bias = -0.00001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 100;
    
        light.position.set(25, 25, 0);
        light.lookAt(0, 0, 0);
        this.scene.add(light);

        const upColour = 0xFFFF80;
        const downColour = 0x808080;
        light = new THREE.HemisphereLight(upColour, downColour, 0.5);
        light.color.setHSL( 0.6, 1, 0.6 );
        light.groundColor.setHSL( 0.095, 1, 0.75 );
        light.position.set(0, 4, 0);
        this.scene.add(light);
    }

    initalizePlayer() {
        const playerGeometry = new THREE.BoxGeometry(5, 10, 5);
        const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        this.playerMesh.position.set(0, 5, 0);
        this.scene.add(this.playerMesh);
    }

    initalizeScene() {
        //background
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
        '../resources/skybox/posx.jpg',
        '../resources/skybox/negx.jpg',
        '../resources/skybox/posy.jpg',
        '../resources/skybox/negy.jpg',
        '../resources/skybox/posz.jpg',
        '../resources/skybox/negz.jpg',
        ]);

        this.scene.background = texture;

        // floor
        const mapLoader = new THREE.TextureLoader();
        const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
        const checkerboard = mapLoader.load('../resources/checkerboard.png');
        checkerboard.anisotropy = maxAnisotropy;
        checkerboard.wrapS = THREE.RepeatWrapping;
        checkerboard.wrapT = THREE.RepeatWrapping;
        checkerboard.repeat.set(32, 32);

        this.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({map: checkerboard}));
        this.plane.castShadow = false;
        this.plane.receiveShadow = true;
        this.plane.rotation.x = -Math.PI / 2;
        this.scene.add(this.plane);

        this.groundBody = new CANNON.Body({
            shape: new CANNON.Plane(),
            material: new CANNON.Material({
                friction: 1, // Set the friction coefficient (adjust as needed)
                restitution: 0 // Set the restitution (bounciness) coefficient (adjust as needed)
              }),
        });
        this.groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
        this.world.addBody(this.groundBody);

        // box

        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(10, 10, 10),
            this.loadMaterial('vintage-tile1_', 0.2));
        this.box.castShadow = true;
        this.box.receiveShadow = true;
        this.scene.add(this.box);

        this.boxBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(5,5,5)),
            mass: 40,
            position: new CANNON.Vec3(2, 50, 2),
            material: new CANNON.Material({
                friction: 1,
                restitution: 1  // Adjust as needed
            }),
        });
        this.world.addBody(this.boxBody);

        // walls

        const concreteMaterial = this.loadMaterial('concrete3-', 4);

        const wall1 = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 4), 
            concreteMaterial);
        wall1.position.set(0, -40, -50);
        wall1.castShadow = true;
        wall1.receiveShadow = true;
        this.scene.add(wall1);

        const wall2 = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 4),
            concreteMaterial);
        wall2.position.set(0, -40, 50);
        wall2.castShadow = true;
        wall2.receiveShadow = true;
        this.scene.add(wall2);

        const wall3 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 100, 100),
            concreteMaterial);
        wall3.position.set(50, -40, 0);
        wall3.castShadow = true;
        wall3.receiveShadow = true;
        this.scene.add(wall3);

        const wall4 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 100, 100),
            concreteMaterial);
        wall4.position.set(-50, -40, 0);
        wall4.castShadow = true;
        wall4.receiveShadow = true;
        this.scene.add(wall4);

        // meshes 
        const meshes = [this.plane, this.box, wall1, wall2, wall3, wall4];
      
        this.objects = [];
    
        for (let i = 0; i < meshes.length; ++i) {
        const b = new THREE.Box3();
        b.setFromObject(meshes[i]);
        this.objects.push(b);
        }
    }

    initalizeControls() {
        this.playerControls = new Controls(this.camera, this.scene, this.world, this.playerMesh);
    }

    loadMaterial(name, tiling) {
        const mapLoader = new THREE.TextureLoader();
        const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

        const metalMap = mapLoader.load('../resources/freepbr/' + name + 'metallic.png');
        metalMap.anisotropy = maxAnisotropy;
        metalMap.wrapS = THREE.RepeatWrapping;
        metalMap.wrapT = THREE.RepeatWrapping;
        metalMap.repeat.set(tiling, tiling);

        const albedo = mapLoader.load('../resources/freepbr/' + name + 'albedo.png');
        albedo.anisotropy = maxAnisotropy;
        albedo.wrapS = THREE.RepeatWrapping;
        albedo.wrapT = THREE.RepeatWrapping;
        albedo.repeat.set(tiling, tiling);

        const normalMap = mapLoader.load('../resources/freepbr/' + name + 'normal.png');
        normalMap.anisotropy = maxAnisotropy;
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(tiling, tiling);

        const roughnessMap = mapLoader.load('../resources/freepbr/' + name + 'roughness.png');
        roughnessMap.anisotropy = maxAnisotropy;
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        roughnessMap.repeat.set(tiling, tiling);

        const material = new THREE.MeshStandardMaterial({
            metalnessMap: metalMap,
            map: albedo,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
        });

        return material;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );

        const time = performance.now();

        if ( this.playerControls.controls.isLocked === true ) {
            this.raycaster.ray.origin.copy( this.playerControls.controls.getObject().position );
            this.raycaster.ray.origin.y -= 10;

            const delta = ( time - this.prevTime ) / 1000;
            this.world.step(delta);
            
            //merging physics and mesh
            this.plane.position.copy(this.groundBody.position);
            this.plane.quaternion.copy(this.groundBody.quaternion);

            this.box.position.copy(this.boxBody.position);
            this.box.quaternion.copy(this.boxBody.quaternion);

            this.playerControls.update(delta, false);

        }

        this.prevTime = time;

        this.renderer.render( this.scene, this.camera );
    }

}



let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new Demo();
});