import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.objects = new Set();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // 天空蓝背景
        
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // 添加方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        this.scene.add(directionalLight);
        
        return this.scene;
    }

    addObject(object) {
        if (this.scene && object) {
            this.scene.add(object);
            this.objects.add(object);
        }
    }

    removeObject(object) {
        if (this.scene && object) {
            this.scene.remove(object);
            this.objects.delete(object);
        }
    }

    clearScene() {
        if (this.scene) {
            this.objects.forEach(object => {
                this.scene.remove(object);
            });
            this.objects.clear();
        }
    }

    getScene() {
        return this.scene;
    }

    getObjectCount() {
        return this.objects.size;
    }
}