import * as THREE from 'three';
import { AircraftComponent } from './base-component.js';

export class Wing extends AircraftComponent {
    constructor(config = {}) {
        super('wing', config);
        this.span = config.span || 8;
        this.chord = config.chord || 2;
        this.sweepAngle = config.sweepAngle || 0; // 后掠角（弧度）
        this.dihedralAngle = config.dihedralAngle || 0; // 上反角（弧度）
        
        this.recreateGeometry();
        this.setupConnectionPoints();
    }

    recreateGeometry() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
        }
        
        // 创建机翼几何体（梯形形状）
        const shape = new THREE.Shape();
        const tipOffset = Math.tan(this.sweepAngle) * this.span / 2;
        
        shape.moveTo(-this.chord / 2 - tipOffset, -this.span / 2);
        shape.lineTo(this.chord / 2 - tipOffset, -this.span / 2);
        shape.lineTo(this.chord / 2 + tipOffset, this.span / 2);
        shape.lineTo(-this.chord / 2 + tipOffset, this.span / 2);
        shape.lineTo(-this.chord / 2 - tipOffset, -this.span / 2);
        
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 0.2,
            bevelEnabled: false
        });
        
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
        
        // 应用上反角
        this.mesh.rotation.x = this.dihedralAngle;
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.updateTransform();
    }

    setupConnectionPoints() {
        // 清除现有连接点
        this.connectionPoints = [];
        
        // 根部连接点（连接到机身）
        this.addConnectionPoint(new THREE.Vector3(0, 0, 0), 'root');
        
        // 控制面连接点
        this.addConnectionPoint(new THREE.Vector3(0, 0, this.span / 2), 'aileron');
        this.addConnectionPoint(new THREE.Vector3(0, 0, -this.span / 2), 'flap');
    }

    setSpan(span) {
        this.span = span;
        this.recreateGeometry();
        this.setupConnectionPoints();
    }

    setChord(chord) {
        this.chord = chord;
        this.recreateGeometry();
        this.setupConnectionPoints();
    }

    setSweepAngle(angle) {
        this.sweepAngle = angle;
        this.recreateGeometry();
    }

    setDihedralAngle(angle) {
        this.dihedralAngle = angle;
        if (this.mesh) {
            this.mesh.rotation.x = angle;
        }
    }

    getAspectRatio() {
        return this.span / this.chord;
    }

    getArea() {
        return this.span * this.chord;
    }
}