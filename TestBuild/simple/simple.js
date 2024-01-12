import * as THREE from 'three';

import { PointerLockControls } from 'plc';


class Controls {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.controls = new PointerLockControls(camera, document.body);

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();

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
                if ( this.canJump === true ) this.velocity.y += 350;
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

        this.velocity.y -= 9.8 * 100.0 * elapsed;

        this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
        this.direction.x = Number( this.moveRight ) - Number( this.moveLeft );
        this.direction.normalize(); // this ensures consistent movements in all directions

        if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 400.0 * elapsed;
        if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 400.0 * elapsed;

        if ( onObject === true ) {

            this.velocity.y = Math.max( 0, this.velocity.y );
            this.canJump = true;

        }

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

class Demo {
    constructor() {
        this.initalize();
    }

    initalize() {
        this.prevTime = performance.now();
        this.initalizeRenderer();
        this.initalizeLights();
        this.initalizeScene();
        this.initalizeControls();

        this.animate();
        this.onWindowResize();
    }

    initalizeRenderer() {
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
        window.addEventListener( 'resize', this.onWindowResize.bind(this) );

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.y = 10;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0xffffff );
        this.scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

        this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    }


    initalizeLights() {
        const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 7.5 );
        light.position.set( 0.5, 1, 0.75 );
        this.scene.add( light );
    }

    initalizeScene() {
        this.vertex = new THREE.Vector3();
        this.color = new THREE.Color();
        this.objects = [];

        this.floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
        this.floorGeometry.rotateX( - Math.PI / 2 );
        this.position = this.floorGeometry.attributes.position;

        for ( let i = 0, l = this.position.count; i < l; i ++ ) {

            this.vertex.fromBufferAttribute( this.position, i );

            this.vertex.x += Math.random() * 20 - 10;
            this.vertex.y += Math.random() * 2;
            this.vertex.z += Math.random() * 20 - 10;

            this.position.setXYZ( i, this.vertex.x, this.vertex.y, this.vertex.z );

        }

        this.floorGeometry = this.floorGeometry.toNonIndexed(); // ensure each face has unique vertices

        this.position = this.floorGeometry.attributes.position;
        const colorsFloor = [];

        for ( let i = 0, l = this.position.count; i < l; i ++ ) {

            this.color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
            colorsFloor.push( this.color.r, this.color.g, this.color.b );

        }

        this.floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsFloor, 3 ) );

        const floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: true } );

        const floor = new THREE.Mesh( this.floorGeometry, floorMaterial );
        this.scene.add( floor );
    }

    initalizeControls() {
        this.playerControls = new Controls(this.camera, this.scene);
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

            const intersections = this.raycaster.intersectObjects( this.objects );
            const onObject = intersections.length > 0;
            const delta = ( time - this.prevTime ) / 1000;

            this.playerControls.update(delta, onObject);
        }

        this.prevTime = time;

        this.renderer.render( this.scene, this.camera );
    }

}


// let prevTime = performance.now();
// const vertex = new THREE.Vector3();
// const color = new THREE.Color();

// init();
// animate();

// function init() {

//     camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
//     camera.position.y = 10;

//     scene = new THREE.Scene();
//     scene.background = new THREE.Color( 0xffffff );
//     scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

//     const light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 7.5 );
//     light.position.set( 0.5, 1, 0.75 );
//     scene.add( light );

//     playerControls = new Controls(camera, scene);
//     raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

//     // floor

//     let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
//     floorGeometry.rotateX( - Math.PI / 2 );

//     // vertex displacement

//     let position = floorGeometry.attributes.position;

//     for ( let i = 0, l = position.count; i < l; i ++ ) {

//         vertex.fromBufferAttribute( position, i );

//         vertex.x += Math.random() * 20 - 10;
//         vertex.y += Math.random() * 2;
//         vertex.z += Math.random() * 20 - 10;

//         position.setXYZ( i, vertex.x, vertex.y, vertex.z );

//     }

//     floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices

//     position = floorGeometry.attributes.position;
//     const colorsFloor = [];

//     for ( let i = 0, l = position.count; i < l; i ++ ) {

//         color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
//         colorsFloor.push( color.r, color.g, color.b );

//     }

//     floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsFloor, 3 ) );

//     const floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: true } );

//     const floor = new THREE.Mesh( floorGeometry, floorMaterial );
//     scene.add( floor );

//     // objects

//     const boxGeometry = new THREE.BoxGeometry( 20, 20, 20 ).toNonIndexed();

//     position = boxGeometry.attributes.position;
//     const colorsBox = [];

//     for ( let i = 0, l = position.count; i < l; i ++ ) {

//         color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
//         colorsBox.push( color.r, color.g, color.b );

//     }

//     boxGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colorsBox, 3 ) );

//     for ( let i = 0; i < 500; i ++ ) {

//         const boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: true } );
//         boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

//         const box = new THREE.Mesh( boxGeometry, boxMaterial );
//         box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
//         box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
//         box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;

//         scene.add( box );
//         objects.push( box );

//     }

//     //

//     renderer = new THREE.WebGLRenderer( { antialias: true } );
//     renderer.setPixelRatio( window.devicePixelRatio );
//     renderer.setSize( window.innerWidth, window.innerHeight );
//     document.body.appendChild( renderer.domElement );

//     //

//     window.addEventListener( 'resize', onWindowResize );

// }

// function onWindowResize() {

//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();

//     renderer.setSize( window.innerWidth, window.innerHeight );

// }

// function animate() {

//     requestAnimationFrame( animate );

//     const time = performance.now();

//     if ( playerControls.controls.isLocked === true ) {
//         raycaster.ray.origin.copy( playerControls.controls.getObject().position );
//         raycaster.ray.origin.y -= 10;

//         const intersections = raycaster.intersectObjects( objects );
//         const onObject = intersections.length > 0;
//         const delta = ( time - prevTime ) / 1000;

//         playerControls.update(delta, onObject);
//     }

//     prevTime = time;

//     renderer.render( scene, camera );

// }

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new Demo();
});