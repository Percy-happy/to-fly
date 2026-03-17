import * as THREE from 'three';
import { AircraftComponent } from './base-component.js';

export class Engine extends AircraftComponent {
    constructor(config = {}) {
        super('engine', config);
        this.thrust = config.thrust || 1000; // 推力（牛顿）
        this.diameter = config.diameter || 1;
        this.length = config.length || 3;
        this.isRunning = false;
        
        this.recreateGeometry();
        this.setupConnectionPoints();
    }

    recreateGeometry() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
        }
        
        // 创建引擎几何体（圆柱体 + 锥体）
        const group = new THREE.Group();
        
        // 引擎主体（圆柱体）
        const cylinderGeometry = new THREE.CylinderGeometry(
            this.diameter / 2, 
            this.diameter / 2, 
            this.length * 0.7, 
            16
        );
        const cylinderMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x666666 
        });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.rotation.x = Math.PI / 2;
        cylinder.position.z = this.length * 0.15;
        
        // 引擎进气口（锥体）
        const coneGeometry = new THREE.ConeGeometry(
            this.diameter / 2 * 1.2, 
            this.length * 0.3, 
            16
        );
        const coneMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x888888 
        });
        const cone = new THREE.Mesh(coneGeometry, coneMaterial);
        cone.rotation.x = -Math.PI / 2;
        cone.position.z = -this.length * 0.35;
        
        group.add(cylinder);
        group.add(cone);
        
        // 创建推力效果（当引擎运行时）
        this.thrustEffect = this.createThrustEffect();
        group.add(this.thrustEffect);
        
        const material = new THREE.MeshLambertMaterial({ 
            color: this.getDefaultColor(),
            transparent: true,
            opacity: 0.8
        });
        
        // 使用组作为mesh
        this.mesh = group;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.updateTransform();
    }

    createThrustEffect() {
        const effectGroup = new THREE.Group();
        effectGroup.visible = false;
        
        // 推力火焰效果
        const flameGeometry = new THREE.ConeGeometry(
            this.diameter / 2, 
            this.length * 0.5, 
            8
        );
        const flameMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFF4500,
            transparent: true,
            opacity: 0.7
        });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.rotation.x = Math.PI / 2;
        flame.position.z = this.length * 0.5;
        
        effectGroup.add(flame);
        return effectGroup;
    }

    setupConnectionPoints() {
        // 清除现有连接点
        this.connectionPoints = [];
        
        // 安装连接点（连接到机身或机翼）
        this.addConnectionPoint(new THREE.Vector3(0, this.diameter / 2 + 0.2, 0), 'mount');
        
        // 推力输出点
        this.addConnectionPoint(new THREE.Vector3(0, 0, this.length / 2), 'thrust');
    }

    start() {
        this.isRunning = true;
        if (this.thrustEffect) {
            this.thrustEffect.visible = true;
        }
    }

    stop() {
        this.isRunning = false;
        if (this.thrustEffect) {
            this.thrustEffect.visible = false;
        }
    }

    setThrust(thrust) {
        this.thrust = thrust;
    }

    setDiameter(diameter) {
        this.diameter = diameter;
        this.recreateGeometry();
        this.setupConnectionPoints();
    }

    setLength(length) {
        this.length = length;
        this.recreateGeometry();
        this.setupConnectionPoints();
    }

    getThrustVector() {
        if (!this.isRunning) {
            return new THREE.Vector3(0, 0, 0);
        }
        
        // 根据引擎方向计算推力向量
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyEuler(this.rotation);
        direction.normalize();
        
        return direction.multiplyScalar(this.thrust);
    }

    isEngineRunning() {
        return this.isRunning;
    }
}