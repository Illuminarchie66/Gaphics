import * as THREE from 'three';
import * as CANNON from 'cannon';

class Controls extends THREE.EventDispatcher {
    constructor(camera, player) {
        super();

        this.enabled = false;
        this.cannonBody = player;

        this.velocityFactor = 80;
        this.jumpVelocity = 10.5;
        this.dampingFactor = 0.9;

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

        const contactNormal = new CANNON.Vec3();
        const upAxis = new CANNON.Vec3(0, 1, 0);
        this.cannonBody.addEventListener('collide', (event) => {
            const { contact } = event;

            if (contact.bi.id === this.cannonBody.id) {
                contact.ni.negate(contactNormal);
            } else {
                contactNormal.copy(contact.ni);
            }

            if (contactNormal.dot(upAxis) > 0.5) {
                this.canJump = true;
                this.dampingFactor = 0.9;
                this.velocityFactor = 100;
            }
        });

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
                if ( this.canJump === true ) {
                    this.cannonBody.velocity.y = this.jumpVelocity;
                    this.dampingFactor = 0.9;
                    this.velocityFactor = 50;
                }
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

        this.inputVelocity.set(0, 0, 0);

        // Movement in the z axis
        if (this.moveForward && this.moveBackward) {
            this.inputVelocity.z = 0;
        } else if (this.moveForward) {
            this.inputVelocity.z = -this.velocityFactor * delta;
        } else if (this.moveBackward) {
            this.inputVelocity.z = this.velocityFactor * delta;
        }

        // Movement in the x axis
        if (this.moveRight && this.moveLeft) {
            this.inputVelocity.x = 0;
        } else if (this.moveLeft) {
            this.inputVelocity.x = -this.velocityFactor * delta;
        } else if (this.moveRight) {
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

        // Linear damping on x and z axis
        this.cannonBody.velocity.x *= this.dampingFactor;
        this.cannonBody.velocity.z *= this.dampingFactor;

        this.cannonBody.position.y = Math.round(this.cannonBody.position.y*1000)/1000;

        this.yawObject.position.copy(this.cannonBody.position);
    }
}

export {Controls};