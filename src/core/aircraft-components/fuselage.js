import * as THREE from 'three';
import { AircraftComponent } from './base-component.js';

export class Fuselage extends AircraftComponent {
    constructor(config = {}) {
        super('fuselage', config);
        this.length = config.length || 10;
        this.width = config.width || 2;
        this.height = config.height || 2;
        
        this.recreateGeometry();
        this.setupConnectionPoints();
    }

    recreateGeometry() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
        }
        
        // 创建机身几何体（胶囊形状）
        const geometry = new THREE.CapsuleGeometry(this.width / 2, this.length - this.width, 8, 16);
        const material = new THREE.MeshLambertMaterial({ 
            color: this.getDefaultColor(),
            transparent: true,
            opacity: 0.8
        });
        
        if (this.mesh) {
            this.mesh.geometry = geometry;
            this.mesh.material = material;
        } else {
            this.mesh = new THREE.Mesh(geometry, material);
        }
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.updateTransform();
    }

    setupConnectionPoints() {
        // 清除现有连接点
        this.connectionPoints = [];
        
        // 前端连接点（用于连接机头）
        this.addConnectionPoint(new THREE.Vector3(0, 0, this.length / 2), 'front');
        
        // 后端连接点（用于连接尾翼）
        this.addConnectionPoint(new THREE.Vector3(0, 0, -this.length / 2), 'rear');
        
        // 机翼连接点（两侧）
        this.addConnectionPoint(new THREE.Vector3(this.width / 2 + 0.5, 0, 0), 'wing_right');
        this.addConnectionPoint(new THREE.Vector3(-this.width / 2 - 0.5, 0, 0), 'wing_left');
        
        // 引擎连接点（下方）
        this.addConnectionPoint(new THREE.Vector3(0, -this.height / 2 - 0.5, -this.length / 4), 'engine');
    }

    setLength(length) {
        this.length = length;
        this.recreateGeometry();
        this.setupConnectionPoints();
    }

    setWidth(width) {
        this.width = width;
        this.recreateGeometry();
        this.setupConnectionPoints();
    }

    setHeight(height) {
        this.height = height;
        this.recreateGeometry();
        this.setupConnectionPoints();
    }

    getDimensions() {
        return {
            length: this.length,
            width: this.width,
            height: this.height
        };
    }
}