// --- Grid-Snapping Building System ---
class BuildingManager {
    constructor(scene) {
        this.scene = scene;
        this.placedStructures = [];
        this.createHologram();
    }

    createHologram() {
        const geo = new THREE.BoxGeometry(4, 4, 0.3);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00fff2, transparent: true, opacity: 0.4, wireframe: true });
        this.hologram = new THREE.Mesh(geo, mat);
        this.hologram.visible = false;
        this.scene.add(this.hologram);
    }

    updateHologram(playerPos, yaw, activeSlot, camera) {
        if (!this.hologram || activeSlot < 5) {
            if (this.hologram) this.hologram.visible = false;
            return;
        }

        this.hologram.visible = true;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0; forward.normalize();

        let targetPos = playerPos.clone().add(forward.multiplyScalar(5));
        targetPos.x = Math.round(targetPos.x / 4) * 4;
        targetPos.z = Math.round(targetPos.z / 4) * 4;

        if (activeSlot === 5) { // Wall
            targetPos.y = Math.floor(playerPos.y / 4) * 4 + 2;
            this.hologram.geometry = new THREE.BoxGeometry(4, 4, 0.3);
            this.hologram.rotation.set(0, yaw, 0);
        } else if (activeSlot === 6) { // Ramp
            targetPos.y = Math.floor(playerPos.y / 4) * 4 + 1.8;
            this.hologram.geometry = new THREE.BoxGeometry(4, 0.3, 5.6);
            this.hologram.rotation.set(Math.PI / 6, yaw, 0);
        } else if (activeSlot === 7) { // Floor
            targetPos.y = Math.floor(playerPos.y / 4) * 4;
            this.hologram.geometry = new THREE.BoxGeometry(4, 0.3, 4);
            this.hologram.rotation.set(0, 0, 0);
        }

        this.hologram.position.copy(targetPos);
    }

    placeStructure(activeSlot, player) {
        if (player.mats < 10 || !this.hologram.visible) return false;

        const geo = this.hologram.geometry.clone();
        const mat = new THREE.MeshStandardMaterial({ color: 0x00fff2, roughness: 0.3, metalness: 0.8 });
        const build = new THREE.Mesh(geo, mat);
        build.position.copy(this.hologram.position);
        build.rotation.copy(this.hologram.rotation);
        build.castShadow = true; build.receiveShadow = true;

        this.scene.add(build);
        
        const box = new THREE.Box3().setFromObject(build);
        this.placedStructures.push({ mesh: build, box: box, type: activeSlot });

        player.mats -= 10;
        window.sounds.play('build');
        return true;
    }

    getSurfaceHeightAt(x, z) {
        let maxElevation = 0;
        const pt = new THREE.Vector3(x, 0, z);
        for (let struct of this.placedStructures) {
            if (struct.box.min.x <= x && struct.box.max.x >= x &&
                struct.box.min.z <= z && struct.box.max.z >= z) {
                if (struct.box.max.y > maxElevation) {
                    maxElevation = struct.box.max.y;
                }
            }
        }
        return maxElevation;
    }
}
