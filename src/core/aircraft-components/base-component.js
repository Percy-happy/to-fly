import * as THREE from 'three';

export class AircraftComponent {
    constructor(type, config = {}) {
        this.type = type;
        this.config = config;
        this.mesh = null;
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.scale = new THREE.Vector3(1, 1, 1);
        this.connections = [];
        this.connectionPoints = [];
        
        this.initializeComponent();
    }

    initializeComponent() {
        // 基础几何体，子类会重写
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({ 
            color: this.getDefaultColor(),
            transparent: true,
            opacity: 0.8
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        this.updateTransform();
    }

    getDefaultColor() {
        const colorMap = {
            'fuselage': 0x4CAF50,    // 绿色
            'wing': 0x2196F3,        // 蓝色
            'engine': 0xF44336,      // 红色
            'control': 0xFF9800      // 橙色
        };
        return colorMap[this.type] || 0x9E9E9E; // 默认灰色
    }

    createMesh() {
        return this.mesh;
    }

    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.updateTransform();
    }

    setRotation(x, y, z) {
        this.rotation.set(x, y, z);
        this.updateTransform();
    }

    setScale(x, y, z) {
        this.scale.set(x, y, z);
        this.updateTransform();
    }

    updateTransform() {
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.copy(this.rotation);
            this.mesh.scale.copy(this.scale);
        }
    }

    getPosition() {
        return this.position.clone();
    }

    getWorldPosition() {
        if (this.mesh) {
            const worldPosition = new THREE.Vector3();
            this.mesh.getWorldPosition(worldPosition);
            return worldPosition;
        }
        return this.position.clone();
    }

    addConnectionPoint(position, type = 'default') {
        this.connectionPoints.push({
            position: position.clone(),
            type: type,
            connected: false
        });
    }

    connectTo(otherComponent, thisPointIndex = 0, otherPointIndex = 0) {
        if (thisPointIndex >= this.connectionPoints.length || 
            otherPointIndex >= otherComponent.connectionPoints.length) {
            return false;
        }
        
        const connection = {
            from: this,
            to: otherComponent,
            fromPoint: thisPointIndex,
            toPoint: otherPointIndex
        };
        
        this.connections.push(connection);
        this.connectionPoints[thisPointIndex].connected = true;
        otherComponent.connectionPoints[otherPointIndex].connected = true;
        
        return true;
    }

    disconnectFrom(otherComponent) {
        const index = this.connections.findIndex(conn => conn.to === otherComponent);
        if (index !== -1) {
            const connection = this.connections[index];
            this.connectionPoints[connection.fromPoint].connected = false;
            connection.to.connectionPoints[connection.toPoint].connected = false;
            this.connections.splice(index, 1);
            return true;
        }
        return false;
    }

    getConnectionPoints() {
        return this.connectionPoints.map(point => ({
            ...point,
            worldPosition: this.getWorldPosition().add(point.position)
        }));
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}