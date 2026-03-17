import * as THREE from 'three';
import { SceneManager } from '../../core/scene-manager.js';
import { CameraController } from '../../core/camera-controller.js';
import { GroundPlane } from '../../core/ground-plane.js';

export class StaticEnvironment {
    constructor(container) {
        this.container = container;
        this.sceneManager = new SceneManager();
        this.cameraController = new CameraController(container);
        this.groundPlane = new GroundPlane();
        this.renderer = null;
        this.components = [];
        this.animationId = null;
        
        this.setupScene();
        this.setupRenderer();
        this.setupLighting();
        this.setupEventListeners();
    }

    setupScene() {
        // 创建场景
        this.scene = this.sceneManager.createScene();
        
        // 创建相机
        this.camera = this.cameraController.setupCamera();
        
        // 创建地面
        this.ground = this.groundPlane.createPlane(50, 50);
        this.sceneManager.addObject(this.ground);
        this.sceneManager.addObject(this.groundPlane.getGrid());
        
        // 添加坐标轴辅助线
        this.addAxesHelper();
    }

    setupRenderer() {
        // 创建WebGL渲染器
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
        
        // 启用轨道控制
        this.cameraController.enableOrbitControls(this.renderer);
    }

    setupLighting() {
        // 添加额外的光照效果
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.sceneManager.addObject(hemisphereLight);
        
        // 添加点光源
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight.position.set(25, 25, 25);
        pointLight.castShadow = true;
        this.sceneManager.addObject(pointLight);
    }

    setupEventListeners() {
        // 窗口大小变化事件
        window.addEventListener('resize', () => this.onWindowResize());
        
        // 键盘事件
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
    }

    onWindowResize() {
        this.cameraController.updateAspectRatio();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    onKeyDown(event) {
        switch(event.key) {
            case 'g':
            case 'G':
                // 切换网格显示
                this.groundPlane.toggleGrid();
                break;
            case 'r':
            case 'R':
                // 重置相机位置
                this.cameraController.setCameraPosition(0, 10, 20);
                break;
        }
    }

    addAxesHelper() {
        const axesHelper = new THREE.AxesHelper(5);
        this.sceneManager.addObject(axesHelper);
    }

    addComponent(component) {
        if (component && component.mesh) {
            this.sceneManager.addObject(component.mesh);
            this.components.push(component);
            
            // 自动排列新添加的组件
            this.arrangeComponents();
        }
    }

    removeComponent(component) {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.sceneManager.removeObject(component.mesh);
            this.components.splice(index, 1);
            component.dispose();
        }
    }

    arrangeComponents() {
        if (this.components.length === 0) return;
        
        // 简单的线性排列算法
        const spacing = 3;
        const startX = -((this.components.length - 1) * spacing) / 2;
        
        this.components.forEach((component, index) => {
            const x = startX + index * spacing;
            component.setPosition(x, 2, 0);
        });
    }

    clearComponents() {
        this.components.forEach(component => {
            this.sceneManager.removeObject(component.mesh);
            component.dispose();
        });
        this.components = [];
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // 更新控制器
        if (this.cameraController.getControls()) {
            this.cameraController.getControls().update();
        }
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    getComponentCount() {
        return this.components.length;
    }

    getSceneInfo() {
        return {
            componentCount: this.components.length,
            objectCount: this.sceneManager.getObjectCount(),
            gridVisible: this.groundPlane.isGridVisible()
        };
    }

    dispose() {
        this.stopAnimation();
        this.clearComponents();
        
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
        
        this.cameraController.dispose();
        this.groundPlane.dispose();
        
        window.removeEventListener('resize', () => this.onWindowResize());
        window.removeEventListener('keydown', (event) => this.onKeyDown(event));
    }
}