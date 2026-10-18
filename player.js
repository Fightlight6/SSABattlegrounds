// --- Player Controller & Viewmodels ---
class PlayerController {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.pos = new THREE.Vector3(0, 2, 0);
        this.vel = new THREE.Vector3();
        this.yaw = 0;
        this.pitch = 0;
        this.hp = 100;
        this.mats = 500;
        this.score = 0;
        this.level = 1;
        this.xp = 0;
        this.onGround = false;
        this.activeSlot = 1; // 1:Blade, 2:Rifle, 3:Shotgun, 4:Rocket, 5:Wall, 6:Ramp, 7:Floor

        this.viewmodels = {};
        this.createViewmodels();
    }

    createViewmodels() {
        // Blade
        const bladeGroup = new THREE.Group();
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), new THREE.MeshBasicMaterial({ color: 0x222222 }));
        handle.rotation.x = Math.PI / 2;
        bladeGroup.add(handle);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.02), new THREE.MeshBasicMaterial({ color: 0x00fff2 }));
        blade.position.set(0, 0.6, -0.3);
        blade.rotation.x = Math.PI / 3;
        bladeGroup.add(blade);
        bladeGroup.position.set(0.4, -0.4, -0.6);
        this.camera.add(bladeGroup);
        this.viewmodels[1] = bladeGroup;

        // Rifle
        const rifleGroup = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.8), new THREE.MeshBasicMaterial({ color: 0x334155 }));
        rifleGroup.add(body);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), new THREE.MeshBasicMaterial({ color: 0x00fff2 }));
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.02, -0.5);
        rifleGroup.add(barrel);
        rifleGroup.position.set(0.4, -0.35, -0.6);
        rifleGroup.visible = false;
        this.camera.add(rifleGroup);
        this.viewmodels[2] = rifleGroup;

        // Shotgun & Rocket Viewmodel placeholders
        this.viewmodels[3] = rifleGroup;
        this.viewmodels[4] = rifleGroup;

        this.scene.add(this.camera);
    }

    setSlot(slot) {
        this.activeSlot = slot;
        for (let i = 1; i <= 7; i++) {
            if (this.viewmodels[i]) this.viewmodels[i].visible = (i === slot);
        }
    }

    updatePhysics(keys, buildingMgr) {
        let moveVector = new THREE.Vector3();
        if (keys['KeyW']) moveVector.z -= 1;
        if (keys['KeyS']) moveVector.z += 1;
        if (keys['KeyA']) moveVector.x -= 1;
        if (keys['KeyD']) moveVector.x += 1;

        moveVector.normalize();
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

        this.vel.x = moveVector.x * 0.22;
        this.vel.z = moveVector.z * 0.22;

        // Gravity & Jump
        this.vel.y -= 0.015;
        if (keys['Space'] && this.onGround) {
            this.vel.y = 0.35;
            this.onGround = false;
        }

        let desiredPos = this.pos.clone().add(this.vel);
        
        // Dynamic Ramp Surface Elevation & Wall Collision
        let surfaceY = buildingMgr.getSurfaceHeightAt(desiredPos.x, desiredPos.z);
        let minGround = Math.max(2, surfaceY + 2);

        if (desiredPos.y <= minGround) {
            desiredPos.y = minGround;
            this.vel.y = 0;
            this.onGround = true;
        }

        this.pos.copy(desiredPos);
        this.camera.position.copy(this.pos);
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }
}
