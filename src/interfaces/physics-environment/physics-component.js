import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { AircraftComponent } from '../../core/aircraft-components/base-component.js';

export class PhysicsComponent extends AircraftComponent {
    constructor(type, config = {}) {
        super(type, config);
        this.physicsBody = null;
        this.physicsConfig = config.physics || {};
        this.mass = this.physicsConfig.mass || 1;
        this.friction = this.physicsConfig.friction || 0.3;
        this.restitution = this.physicsConfig.restitution || 0.3;
        
        this.setupPhysics();
    }

    setupPhysics() {
        // 子类需要重写此方法来设置具体的物理形状
        this.createPhysicsBody();
    }

    createPhysicsBody() {
        // 默认创建盒子物理体
        const dimensions = this.getPhysicsDimensions();
        const shape = new CANNON.Box(new CANNON.Vec3(
            dimensions.x / 2, 
            dimensions.y / 2, 
            dimensions.z / 2
        ));
        
        this.physicsBody = new CANNON.Body({
            mass: this.mass,
            shape: shape,
            position: new CANNON.Vec3(
                this.position.x,
                this.position.y,
                this.position.z
            ),
            quaternion: new CANNON.Quaternion().setFromEuler(
                this.rotation.x,
                this.rotation.y,
                this.rotation.z
            )
        });
        
        // 设置物理材质
        this.physicsBody.material = new CANNON.Material();
        this.physicsBody.material.friction = this.friction;
        this.physicsBody.material.restitution = this.restitution;
    }

    getPhysicsDimensions() {
        // 默认返回基础尺寸，子类可以重写
        return { x: 1, y: 1, z: 1 };
    }

    updatePhysics(deltaTime) {
        if (this.physicsBody) {
            // 同步Three.js对象位置到物理体
            this.physicsBody.position.set(
                this.mesh.position.x,
                this.mesh.position.y,
                this.mesh.position.z
            );
            
            this.physicsBody.quaternion.set(
                this.mesh.quaternion.x,
                this.mesh.quaternion.y,
                this.mesh.quaternion.z,
                this.mesh.quaternion.w
            );
        }
    }

    syncPhysicsToVisual() {
        if (this.physicsBody) {
            // 同步物理体位置到Three.js对象
            this.mesh.position.set(
                this.physicsBody.position.x,
                this.physicsBody.position.y,
                this.physicsBody.position.z
            );
            
            this.mesh.quaternion.set(
                this.physicsBody.quaternion.x,
                this.physicsBody.quaternion.y,
                this.physicsBody.quaternion.z,
                this.physicsBody.quaternion.w
            );
        }
    }

    applyForce(force, worldPoint = null) {
        if (this.physicsBody) {
            const cannonForce = new CANNON.Vec3(force.x, force.y, force.z);
            const cannonPoint = worldPoint ? 
                new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z) : 
                this.physicsBody.position;
            
            this.physicsBody.applyForce(cannonForce, cannonPoint);
        }
    }

    applyImpulse(impulse, worldPoint = null) {
        if (this.physicsBody) {
            const cannonImpulse = new CANNON.Vec3(impulse.x, impulse.y, impulse.z);
            const cannonPoint = worldPoint ? 
                new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z) : 
                this.physicsBody.position;
            
            this.physicsBody.applyImpulse(cannonImpulse, cannonPoint);
        }
    }

    setVelocity(velocity) {
        if (this.physicsBody) {
            this.physicsBody.velocity.set(velocity.x, velocity.y, velocity.z);
        }
    }

    getVelocity() {
        if (this.physicsBody) {
            return new THREE.Vector3(
                this.physicsBody.velocity.x,
                this.physicsBody.velocity.y,
                this.physicsBody.velocity.z
            );
        }
        return new THREE.Vector3(0, 0, 0);
    }

    setAngularVelocity(angularVelocity) {
        if (this.physicsBody) {
            this.physicsBody.angularVelocity.set(
                angularVelocity.x,
                angularVelocity.y,
                angularVelocity.z
            );
        }
    }

    getAngularVelocity() {
        if (this.physicsBody) {
            return new THREE.Vector3(
                this.physicsBody.angularVelocity.x,
                this.physicsBody.angularVelocity.y,
                this.physicsBody.angularVelocity.z
            );
        }
        return new THREE.Vector3(0, 0, 0);
    }

    isSleeping() {
        return this.physicsBody ? this.physicsBody.sleepState === CANNON.Body.SLEEPING : false;
    }

    wakeUp() {
        if (this.physicsBody) {
            this.physicsBody.wakeUp();
        }
    }

    setMass(mass) {
        this.mass = mass;
        if (this.physicsBody) {
            this.physicsBody.mass = mass;
            this.physicsBody.updateMassProperties();
        }
    }

    setFriction(friction) {
        this.friction = friction;
        if (this.physicsBody && this.physicsBody.material) {
            this.physicsBody.material.friction = friction;
        }
    }

    setRestitution(restitution) {
        this.restitution = restitution;
        if (this.physicsBody && this.physicsBody.material) {
            this.physicsBody.material.restitution = restitution;
        }
    }

    getPhysicsBody() {
        return this.physicsBody;
    }

    dispose() {
        super.dispose();
        this.physicsBody = null;
    }
}