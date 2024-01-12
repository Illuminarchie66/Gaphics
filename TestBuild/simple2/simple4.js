import * as THREE from 'three';
import * as CANNON from 'cannon';
import Ammo from '../ammo/builds/ammo.js'
import { PointerLockControls } from 'plc';


class Controls {
    constructor(camera, scene, player) {
        this.camera = camera;
        this.scene = scene;
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

        this.controls.moveRight( - this.velocity.x * elapsed );
        this.controls.moveForward( - this.velocity.z * elapsed );

        this.controls.getObject().position.y += ( this.velocity.y * elapsed ); // new behavior

        if ( this.controls.getObject().position.y < 10 ) {

            this.velocity.y = 0;
            this.controls.getObject().position.y = 10;

            this.canJump = true;

        }

    }


}

class RigidBody {
    constructor() {
    }
  
    setRestitution(val) {
      this.body_.setRestitution(val);
    }
  
    setFriction(val) {
      this.body_.setFriction(val);
    }
  
    setRollingFriction(val) {
      this.body_.setRollingFriction(val);
    }
  
    createBox(mass, pos, quat, size) {
      this.transform_ = new Ammo.btTransform();
      this.transform_.setIdentity();
      this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
      this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);
  
      const btSize = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
      this.shape_ = new Ammo.btBoxShape(btSize);
      this.shape_.setMargin(0.05);
  
      this.inertia_ = new Ammo.btVector3(0, 0, 0);
      if (mass > 0) {
        this.shape_.calculateLocalInertia(mass, this.inertia_);
      }
  
      this.info_ = new Ammo.btRigidBodyConstructionInfo(
          mass, this.motionState_, this.shape_, this.inertia_);
      this.body_ = new Ammo.btRigidBody(this.info_);
  
      Ammo.destroy(btSize);
    }
  
    createSphere(mass, pos, size) {
      this.transform_ = new Ammo.btTransform();
      this.transform_.setIdentity();
      this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      this.transform_.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
      this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);
  
      this.shape_ = new Ammo.btSphereShape(size);
      this.shape_.setMargin(0.05);
  
      this.inertia_ = new Ammo.btVector3(0, 0, 0);
      if(mass > 0) {
        this.shape_.calculateLocalInertia(mass, this.inertia_);
      }
  
      this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
      this.body_ = new Ammo.btRigidBody(this.info_);
    }
}

class Demo {
    constructor() {
        this.initalize();
    }

    initalize() {
        this.prevTime = performance.now();
        this.initAmmo();
        this.initalizeRenderer();
        this.initalizeLights();
        //this.initalizeWorld();
        this.initalizeScene();
        this.initalizePlayer();
        this.initalizeControls();

        this.animate();
        this.onWindowResize();
    }

    initAmmo() {
        Ammo().then( (Ammo) => {
            Ammo = Ammo;
            this.ammoClone = Ammo;
            this.createAmmo(Ammo);
        })
    }

    createAmmo(Ammo = this.ammoClone) {
        this.tempTransform = new Ammo.btTransform();

        this.initalizeWorld(Ammo);
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

    initalizeWorld(Ammo = this.ammoClone) {
        this.collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher_ = new Ammo.btCollisionDispatcher(this.collisionConfiguration_);
        this.broadphase_ = new Ammo.btDbvtBroadphase();
        this.solver_ = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld_ = new Ammo.btDiscreteDynamicsWorld(
            this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_);
        this.physicsWorld_.setGravity(new Ammo.btVector3(0, -100, 0));
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

        // const rbGround = new RigidBody();
        // rbGround.createBox(0, ground.position, ground.quaternion, new THREE.Vector3(100, 1, 100));
        // rbGround.setRestitution(0.99);
        // this.physicsWorld_.addRigidBody(rbGround.body_);

        // this.rigidBodies_ = [];


        // box

        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(10, 10, 10),
            this.loadMaterial('vintage-tile1_', 0.2));
        this.box.castShadow = true;
        this.box.receiveShadow = true;
        this.scene.add(this.box);

        
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
        this.playerControls = new Controls(this.camera, this.scene, this.playerMesh);
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

            this.playerControls.update(delta, false);

            //this.physicsWorld_.stepSimulation(delta, 10);
        }

        this.prevTime = time;

        this.renderer.render( this.scene, this.camera );
    }

}



let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new Demo();
});