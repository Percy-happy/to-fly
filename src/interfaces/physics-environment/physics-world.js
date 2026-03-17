import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class PhysicsWorld {
    constructor() {
        this.world = null;
        this.timeStep = 1 / 60; // 物理模拟步长
        this.maxSubSteps = 3; // 最大子步数
        this.gravity = new CANNON.Vec3(0, -9.82, 0); // 标准重力
        this.physicsObjects = new Map();
        this.contactMaterials = new Map();
        
        this.setupWorld();
    }

    setupWorld() {
        // 创建物理世界
        this.world = new CANNON.World();
        this.world.gravity = this.gravity;
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
        
        // 创建地面物理体
        this.createGroundBody();
        
        // 设置默认接触材质
        this.setupDefaultContactMaterials();
    }

    createGroundBody() {
        // 创建地面物理体（Z=0平面）
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0, // 质量为0表示静态物体
            shape: groundShape,
            material: new CANNON.Material('groundMaterial')
        });
        
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.addBody(groundBody);
        
        this.groundBody = groundBody;
    }

    setupDefaultContactMaterials() {
        // 创建默认材质
        const defaultMaterial = new CANNON.Material('default');
        const groundMaterial = new CANNON.Material('ground');
        
        // 设置材质间的接触参数
        const defaultContact = new CANNON.ContactMaterial(
            defaultMaterial,
            defaultMaterial,
            {
                friction: 0.3,
                restitution: 0.3
            }
        );
        
        const groundContact = new CANNON.ContactMaterial(
            defaultMaterial,
            groundMaterial,
            {
                friction: 0.4,
                restitution: 0.1
            }
        );
        
        this.world.addContactMaterial(defaultContact);
        this.world.addContactMaterial(groundContact);
        
        this.contactMaterials.set('default', defaultMaterial);
        this.contactMaterials.set('ground', groundMaterial);
    }

    addPhysicsObject(threeObject, physicsConfig = {}) {
        const {
            mass = 1,
            shape = 'box',
            dimensions = { x: 1, y: 1, z: 1 },
            material = 'default',
            position = new CANNON.Vec3(0, 0, 0),
            quaternion = new CANNON.Quaternion()
        } = physicsConfig;
        
        // 创建物理形状
        let physicsShape;
        switch (shape) {
            case 'sphere':
                physicsShape = new CANNON.Sphere(dimensions.radius || 1);
                break;
            case 'cylinder':
                physicsShape = new CANNON.Cylinder(
                    dimensions.radiusTop || 1,
                    dimensions.radiusBottom || 1,
                    dimensions.height || 2,
                    dimensions.numSegments || 8
                );
                break;
            case 'box':
            default:
                physicsShape = new CANNON.Box(new CANNON.Vec3(
                    dimensions.x / 2, 
                    dimensions.y / 2, 
                    dimensions.z / 2
                ));
        }
        
        // 创建物理体
        const physicsBody = new CANNON.Body({
            mass: mass,
            shape: physicsShape,
            position: position,
            quaternion: quaternion,
            material: this.contactMaterials.get(material) || this.contactMaterials.get('default')
        });
        
        this.world.addBody(physicsBody);
        
        // 保存映射关系
        const physicsObject = {
            threeObject: threeObject,
            physicsBody: physicsBody,
            config: physicsConfig
        };
        
        this.physicsObjects.set(threeObject.uuid, physicsObject);
        
        return physicsBody;
    }

    removePhysicsObject(threeObject) {
        const physicsObject = this.physicsObjects.get(threeObject.uuid);
        if (physicsObject) {
            this.world.removeBody(physicsObject.physicsBody);
            this.physicsObjects.delete(threeObject.uuid);
        }
    }

    updatePhysics(deltaTime) {
        // 更新物理模拟
        this.world.step(this.timeStep, deltaTime, this.maxSubSteps);
        
        // 同步Three.js对象位置
        this.physicsObjects.forEach((physicsObject, uuid) => {
            const { threeObject, physicsBody } = physicsObject;
            
            // 更新位置
            threeObject.position.set(
                physicsBody.position.x,
                physicsBody.position.y,
                physicsBody.position.z
            );
            
            // 更新旋转
            threeObject.quaternion.set(
                physicsBody.quaternion.x,
                physicsBody.quaternion.y,
                physicsBody.quaternion.z,
                physicsBody.quaternion.w
            );
        });
    }

    applyForce(threeObject, force, worldPoint = null) {
        const physicsObject = this.physicsObjects.get(threeObject.uuid);
        if (physicsObject) {
            const cannonForce = new CANNON.Vec3(force.x, force.y, force.z);
            const cannonPoint = worldPoint ? 
                new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z) : 
                physicsObject.physicsBody.position;
            
            physicsObject.physicsBody.applyForce(cannonForce, cannonPoint);
        }
    }

    applyImpulse(threeObject, impulse, worldPoint = null) {
        const physicsObject = this.physicsObjects.get(threeObject.uuid);
        if (physicsObject) {
            const cannonImpulse = new CANNON.Vec3(impulse.x, impulse.y, impulse.z);
            const cannonPoint = worldPoint ? 
                new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z) : 
                physicsObject.physicsBody.position;
            
            physicsObject.physicsBody.applyImpulse(cannonImpulse, cannonPoint);
        }
    }

    setGravity(x, y, z) {
        this.gravity.set(x, y, z);
        this.world.gravity.copy(this.gravity);
    }

    getObjectVelocity(threeObject) {
        const physicsObject = this.physicsObjects.get(threeObject.uuid);
        if (physicsObject) {
            return new THREE.Vector3(
                physicsObject.physicsBody.velocity.x,
                physicsObject.physicsBody.velocity.y,
                physicsObject.physicsBody.velocity.z
            );
        }
        return new THREE.Vector3(0, 0, 0);
    }

    isObjectSleeping(threeObject) {
        const physicsObject = this.physicsObjects.get(threeObject.uuid);
        return physicsObject ? physicsObject.physicsBody.sleepState === CANNON.Body.SLEEPING : false;
    }

    wakeUpObject(threeObject) {
        const physicsObject = this.physicsObjects.get(threeObject.uuid);
        if (physicsObject) {
            physicsObject.physicsBody.wakeUp();
        }
    }

    clearAllObjects() {
        this.physicsObjects.forEach((physicsObject, uuid) => {
            this.world.removeBody(physicsObject.physicsBody);
        });
        this.physicsObjects.clear();
    }

    dispose() {
        this.clearAllObjects();
        this.world = null;
    }
}