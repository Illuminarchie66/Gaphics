import * as THREE from 'three';
import * as CANNON from 'cannon';
import { PointerLockControls } from 'plc';


class Controls extends THREE.EventDispatcher {
    constructor(camera, player) {
        super();

        this.enabled = false;
        this.cannonBody = player;

        // var eyeYPos = 2 // eyes are 2 meters above the ground
        this.velocityFactor = 1;
        this.jumpVelocity = 30;

        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(camera);

        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 4;
        this.yawObject.add(this.pitchObject);

        this.quaternion = new THREE.Quaternion();

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        this.canJump = false;

        const contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
        const upAxis = new CANNON.Vec3(0, 1, 0);
        this.cannonBody.addEventListener('collide', (event) => {
        const { contact } = event;

        // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
        // We do not yet know which one is which! Let's check.
        if (contact.bi.id === this.cannonBody.id) {
            // bi is the player body, flip the contact normal
            contact.ni.negate(contactNormal);
        } else {
            // bi is something else. Keep the normal as it is
            contactNormal.copy(contact.ni);
        }

        // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
        if (contactNormal.dot(upAxis) > 0.5) {
            // Use a "good" threshold value between 0 and 1 here!
            this.canJump = true;
        }
        });

        this.velocity = this.cannonBody.velocity;

        // Moves the camera to the cannon.js object position and adds velocity to the object if the run key is down
        this.inputVelocity = new THREE.Vector3();
        this.euler = new THREE.Euler();

        this.lockEvent = { type: 'lock' }
        this.unlockEvent = { type: 'unlock' }

        this.initalize();
    }

    initalize() {
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('pointerlockchange', this.onPointerlockChange);
        document.addEventListener('pointerlockerror', this.onPointerlockError);
    }

    denitalize() {
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        document.removeEventListener('keyup', this.onKeyUp.bind(this));
        document.removeEventListener('mousemove', this.onMouseMove.bind(this));
        document.removeEventListener('pointerlockchange', this.onPointerlockChange);
        document.removeEventListener('pointerlockerror', this.onPointerlockError);
    }

    dispose() {
        this.denitalize();
    }

    lock() {
        document.body.requestPointerLock();
    }
    
    unlock() {
        document.exitPointerLock();
    }

    onPointerlockChange = () => {
        if (document.pointerLockElement) {
            this.dispatchEvent(this.lockEvent);
            this.isLocked = true;
        } else {
            this.dispatchEvent(this.unlockEvent);
            this.isLocked = false;
        }
    }

    onPointerlockError = () => {
        console.error('PointerLockControls: Unable to use Pointer Lock API')
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
                if ( this.canJump === true ) this.cannonBody.velocity.y = this.jumpVelocity;
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

    onMouseMove = (event) => {
        if (!this.enabled) {
          return
        }
    
        const { movementX, movementY } = event;
    
        this.yawObject.rotation.y -= movementX * 0.001;
        this.pitchObject.rotation.x -= movementY * 0.001;
    
        this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
    }

    getObject() {
        return this.yawObject;
    }
    

    update(delta) {
        if (this.enabled === false) {
            return;
        }
        delta *= 1000;
        delta *= 0.1;

        this.inputVelocity.set(0, 0, 0);
        //this.velocityFactor = 

        if (this.moveForward) {
            this.inputVelocity.z = -this.velocityFactor * delta;
        }
        if (this.moveBackward) {
            this.inputVelocity.z = this.velocityFactor * delta;
        }

        if (this.moveLeft) {
            this.inputVelocity.x = -this.velocityFactor * delta;
        }
        if (this.moveRight) {
            this.inputVelocity.x = this.velocityFactor * delta;
        }

        // Convert velocity to world coordinates
        this.euler.x = this.pitchObject.rotation.x;
        this.euler.y = this.yawObject.rotation.y;
        this.euler.order = 'XYZ';
        this.quaternion.setFromEuler(this.euler);
        this.inputVelocity.applyQuaternion(this.quaternion);

        // Add to the object
        this.cannonBody.velocity.x += this.inputVelocity.x;
        this.cannonBody.velocity.z += this.inputVelocity.z;

        this.cannonBody.velocity.x *= 0.9;
        this.cannonBody.velocity.z *= 0.9;

        this.yawObject.position.copy(this.cannonBody.position);

        //console.log(this.cannonBody.velocity);
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
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.physicallyCorrectLights = true;
    
        document.body.appendChild(this.renderer.domElement);
        window.addEventListener( 'resize', this.onWindowResize.bind(this) );
        
        const fov = 70;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 0.05;
        const far = 1000;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far );
        this.camera.position.x = -1;
        this.camera.position.y = 2;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xffffff );
        this.scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
    

        this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    }

    initalizeWorld() {
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -30, 0)
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
        // const playerGeometry = new THREE.BoxGeometry(5, 10, 5);
        // const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // this.playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        // this.playerMesh.position.set(0, 5, 0);
        // this.scene.add(this.playerMesh);
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
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({map: checkerboard}));
        this.plane.castShadow = false;
        this.plane.receiveShadow = true;
        this.plane.rotation.x = -Math.PI / 2;
        this.scene.add(this.plane);

        this.groundMaterial = new CANNON.Material();
        this.groundBody = new CANNON.Body({
            shape: new CANNON.Plane(),
            mass: 0,
            material: this.groundMaterial
        });
        this.groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
        this.groundBody.position.copy(new CANNON.Vec3(0,0, 0));
        this.world.addBody(this.groundBody);

        // box

        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(10, 10, 10),
            this.loadMaterial('vintage-tile1_', 0.2));
        this.box.castShadow = true;
        this.box.receiveShadow = true;
        this.scene.add(this.box);

        this.boxBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(5.1,5.1,5.1)),
            mass: 40,
            position: new CANNON.Vec3(30, 21, 0),
            material: new CANNON.Material({friction: 0}),
        });
        this.boxBody.position.y = 5;
        this.world.addBody(this.boxBody);

        //cylinder
        
        const cylinderGeometry = new THREE.CylinderGeometry(5, 5, 20, 32);
        const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        this.cylinderMesh.position.set(-10, 15, 0);
        this.scene.add(this.cylinderMesh);

        this.cylinder = new CANNON.Body({
            shape: new CANNON.Cylinder(5, 5, 20, 32),
            mass: 0, 
            position: new CANNON.Vec3(-10, 15, 0)
        });
        this.world.addBody(this.cylinder);

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
        const radius = 1.3;
        this.sphereMaterial = new CANNON.Material({restitution: 1});
        this.sphereShape = new CANNON.Cylinder(1.5, 1.5, 5, 30);
        //this.sphereShape = new CANNON.Box(new CANNON.Vec3(5, 10, 5));
        //this.physicsMaterial = new CANNON.Material('physics');
        this.sphereBody = new CANNON.Body({ 
            mass: 300,
            material: this.sphereMaterial,});
        this.sphereBody.addShape(this.sphereShape);
        this.sphereBody.position.set(0,30,0);
        this.sphereBody.angularFactor = new CANNON.Vec3(0, 1, 0);
        this.sphereBody.sleepSpeedLimit = 1.0;
        //this.sphereBody.linearDamping = 0.9;
        this.world.addBody(this.sphereBody);

        this.playerControls = new Controls(this.camera, this.sphereBody);
        this.playerControls.getObject().position.set(0, 40, 0);
        this.scene.add(this.playerControls.getObject());
        //this.playerControls = new Controls(this.camera, this.scene, this.playerMesh);

        const groundPlayerContactMat = new CANNON.ContactMaterial(
            this.groundMaterial,
            this.sphereMaterial,
            {friction: 0}
        )

        this.world.addContactMaterial(groundPlayerContactMat);

        const blocker = document.getElementById('blocker');
        const instructions = document.getElementById('instructions');

        instructions.addEventListener('click', () => {
            this.playerControls.lock();
        });

        this.playerControls.addEventListener('lock', () => {
            this.playerControls.enabled = true;
            instructions.style.display = 'none';
            blocker.style.display = 'none';
        });

        this.playerControls.addEventListener('unlock', () => {
            this.playerControls.enabled = false;
            blocker.style.display = 'block';
            instructions.style.display = '';
        });
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

        // this.raycaster.ray.origin.copy( this.playerControls.controls.getObject().position );
        // this.raycaster.ray.origin.y -= 10;

        // const delta = ( time - this.prevTime ) / 1000;
        const delta = 1/60; 
        this.world.step(delta);
        
        //merging physics and mesh
        this.plane.position.copy(this.groundBody.position);
        this.plane.quaternion.copy(this.groundBody.quaternion);

        console.log(this.sphereBody.position);

        this.box.position.copy(this.boxBody.position);
        this.box.quaternion.copy(this.boxBody.quaternion);

        this.playerControls.update(delta);


        this.prevTime = time;

        this.renderer.render( this.scene, this.camera );
    }

}



let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new Demo();
});