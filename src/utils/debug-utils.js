import * as THREE from 'three';

export class DebugUtils {
    constructor(scene) {
        this.scene = scene;
        this.helpers = new Map();
        this.stats = {
            fps: 0,
            objectCount: 0,
            memoryUsage: 0
        };
    }

    // 添加坐标轴辅助线
    addAxesHelper(size = 5, position = new THREE.Vector3(0, 0, 0)) {
        const axesHelper = new THREE.AxesHelper(size);
        axesHelper.position.copy(position);
        this.scene.add(axesHelper);
        this.helpers.set('axes', axesHelper);
        return axesHelper;
    }

    // 添加网格辅助线
    addGridHelper(size = 50, divisions = 50) {
        const gridHelper = new THREE.GridHelper(size, divisions);
        this.scene.add(gridHelper);
        this.helpers.set('grid', gridHelper);
        return gridHelper;
    }

    // 添加包围盒辅助线
    addBoundingBoxHelper(object, color = 0xffff00) {
        const boxHelper = new THREE.BoxHelper(object, color);
        this.scene.add(boxHelper);
        this.helpers.set(`bbox_${object.id}`, boxHelper);
        return boxHelper;
    }

    // 添加点辅助标记
    addPointMarker(position, color = 0xff0000, size = 0.5) {
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.copy(position);
        this.scene.add(marker);
        this.helpers.set(`point_${position.x}_${position.y}_${position.z}`, marker);
        return marker;
    }

    // 添加线辅助标记
    addLineHelper(start, end, color = 0x00ff00) {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({ color: color });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.helpers.set(`line_${start.x}_${start.y}_${start.z}`, line);
        return line;
    }

    // 显示性能信息
    createStatsDisplay(container) {
        const statsDiv = document.createElement('div');
        statsDiv.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            border-radius: 5px;
            z-index: 1000;
        `;
        
        this.statsElement = statsDiv;
        container.appendChild(statsDiv);
        
        return statsDiv;
    }

    // 更新性能信息
    updateStats(fps, objectCount) {
        if (!this.statsElement) return;
        
        this.stats.fps = fps;
        this.stats.objectCount = objectCount;
        this.stats.memory = performance.memory ? 
            (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB' : 'N/A';
        
        this.statsElement.innerHTML = `
            FPS: ${fps.toFixed(1)}<br>
            对象数量: ${objectCount}<br>
            内存使用: ${this.stats.memory}
        `;
    }

    // 显示调试信息面板
    createDebugPanel(container) {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
        `;
        
        this.debugPanel = panel;
        container.appendChild(panel);
        
        return panel;
    }

    // 更新调试信息
    updateDebugInfo(info) {
        if (!this.debugPanel) return;
        
        let html = '<strong>调试信息</strong><br>';
        Object.keys(info).forEach(key => {
            html += `${key}: ${info[key]}<br>`;
        });
        
        this.debugPanel.innerHTML = html;
    }

    // 记录性能数据
    logPerformance(message, startTime) {
        const duration = performance.now() - startTime;
        console.log(`${message}: ${duration.toFixed(2)}ms`);
        return duration;
    }

    // 清除所有辅助线
    clearHelpers() {
        this.helpers.forEach((helper, key) => {
            this.scene.remove(helper);
            if (helper.geometry) helper.geometry.dispose();
            if (helper.material) helper.material.dispose();
        });
        this.helpers.clear();
    }

    // 移除特定辅助线
    removeHelper(key) {
        const helper = this.helpers.get(key);
        if (helper) {
            this.scene.remove(helper);
            if (helper.geometry) helper.geometry.dispose();
            if (helper.material) helper.material.dispose();
            this.helpers.delete(key);
        }
    }

    // 检查WebGL支持
    static checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }

    // 检查Three.js版本
    static getThreeVersion() {
        return THREE.REVISION;
    }

    // 生成随机颜色
    static getRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
}