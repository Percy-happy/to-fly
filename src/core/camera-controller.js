import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
    constructor(container) {
        this.container = container;
        this.camera = null;
        this.controls = null;
        this.aspectRatio = container.clientWidth / container.clientHeight;
    }

    setupCamera() {
        // 创建透视相机
        this.camera = new THREE.PerspectiveCamera(
            75, // 视野角度
            this.aspectRatio, // 宽高比
            0.1, // 近平面
            1000 // 远平面
        );
        
        // 设置相机初始位置
        this.camera.position.set(0, 10, 20);
        this.camera.lookAt(0, 0, 0);
        
        return this.camera;
    }

    enableOrbitControls(renderer) {
        if (this.camera && renderer) {
            this.controls = new OrbitControls(this.camera, renderer.domElement);
            
            // 配置控制参数
            this.controls.enableDamping = true; // 启用阻尼效果
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = 5;
            this.controls.maxDistance = 100;
            this.controls.maxPolarAngle = Math.PI / 2; // 限制垂直旋转角度
            
            return this.controls;
        }
    }

    setCameraPosition(x, y, z) {
        if (this.camera) {
            this.camera.position.set(x, y, z);
        }
    }

    updateAspectRatio() {
        if (this.camera && this.container) {
            this.aspectRatio = this.container.clientWidth / this.container.clientHeight;
            this.camera.aspect = this.aspectRatio;
            this.camera.updateProjectionMatrix();
        }
    }

    getCamera() {
        return this.camera;
    }

    getControls() {
        return this.controls;
    }

    dispose() {
        if (this.controls) {
            this.controls.dispose();
        }
    }
}