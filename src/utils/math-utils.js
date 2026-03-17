import * as THREE from 'three';

export class MathUtils {
    // 角度转换
    static degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    static radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    // 向量操作
    static vectorDistance(v1, v2) {
        return v1.distanceTo(v2);
    }

    static vectorLerp(v1, v2, t) {
        const result = new THREE.Vector3();
        result.lerpVectors(v1, v2, t);
        return result;
    }

    // 限制数值范围
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // 线性映射
    static map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    // 随机数生成
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 几何计算
    static calculateBoundingBox(objects) {
        const box = new THREE.Box3();
        objects.forEach(obj => {
            if (obj.mesh) {
                box.expandByObject(obj.mesh);
            }
        });
        return box;
    }

    static getBoundingBoxCenter(box) {
        const center = new THREE.Vector3();
        box.getCenter(center);
        return center;
    }

    // 物理计算
    static calculateForce(mass, acceleration) {
        return mass * acceleration;
    }

    static calculateTorque(force, distance, angle) {
        return force * distance * Math.sin(angle);
    }

    // 坐标转换
    static worldToScreenPosition(camera, worldPosition, renderer) {
        const vector = worldPosition.clone();
        vector.project(camera);
        
        vector.x = (vector.x + 1) / 2 * renderer.domElement.clientWidth;
        vector.y = -(vector.y - 1) / 2 * renderer.domElement.clientHeight;
        
        return vector;
    }

    // 碰撞检测辅助函数
    static sphereIntersection(sphere1, sphere2) {
        const distance = sphere1.center.distanceTo(sphere2.center);
        return distance < (sphere1.radius + sphere2.radius);
    }

    static boxIntersection(box1, box2) {
        return box1.intersectsBox(box2);
    }

    // 插值函数
    static easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    static smoothStep(t) {
        return t * t * (3 - 2 * t);
    }

    // 颜色转换
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}