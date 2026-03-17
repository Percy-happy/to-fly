import * as THREE from 'three';

export class GroundPlane {
    constructor() {
        this.plane = null;
        this.grid = null;
        this.gridVisible = true;
    }

    createPlane(size = 50, divisions = 50) {
        // 创建基础平面（Z=0平面）
        const planeGeometry = new THREE.PlaneGeometry(size, size);
        const planeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x808080,
            side: THREE.DoubleSide 
        });
        
        this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.plane.rotation.x = -Math.PI / 2; // 旋转到水平位置
        this.plane.receiveShadow = true;
        
        // 创建网格辅助线
        this.createGrid(size, divisions);
        
        return this.plane;
    }

    createGrid(size, divisions) {
        const gridHelper = new THREE.GridHelper(size, divisions, 0x444444, 0x888888);
        gridHelper.position.y = 0.01; // 稍微抬高避免z-fighting
        this.grid = gridHelper;
    }

    setGridVisibility(visible) {
        this.gridVisible = visible;
        if (this.grid) {
            this.grid.visible = visible;
        }
    }

    toggleGrid() {
        this.gridVisible = !this.gridVisible;
        this.setGridVisibility(this.gridVisible);
    }

    getPlane() {
        return this.plane;
    }

    getGrid() {
        return this.grid;
    }

    isGridVisible() {
        return this.gridVisible;
    }

    dispose() {
        if (this.plane) {
            this.plane.geometry.dispose();
            this.plane.material.dispose();
        }
        if (this.grid) {
            this.grid.geometry.dispose();
            this.grid.material.dispose();
        }
    }
}