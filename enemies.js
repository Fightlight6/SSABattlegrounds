// --- Humanoid 3D Character Generator & Enemy AI ---
class EnemyManager {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
    }

    createHumanoidMesh(type) {
        const group = new THREE.Group();
        let color = 0xff0055;
        let scale = 1;

        if (type === 'ORANGE_BOSS') { color = 0xffa500; scale = 2.2; }
        else if (type === 'LEMUR_BOSS') { color = 0xa855f7; scale = 1.8; }
        else if (type === 'TITAN') { color = 0xffea00; scale = 1.6; }

        // Torso & Armor
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8 * scale, 1.2 * scale, 0.4 * scale), new THREE.MeshStandardMaterial({ color: color }));
        torso.position.y = 1.2 * scale;
        group.add(torso);

        // Head & Visor
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        head.position.y = 2.1 * scale;
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4 * scale, 0.15 * scale, 0.1 * scale), new THREE.MeshBasicMaterial({ color: 0x00fff2 }));
        visor.position.set(0, 2.15 * scale, 0.25 * scale);
        group.add(head); group.add(visor);

        // Special Lemur Tail
        if (type === 'LEMUR_BOSS') {
            const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.05, 2), new THREE.MeshStandardMaterial({ color: 0x333 }));
            tail.position.set(0, 1, -1);
            tail.rotation.x = Math.PI / 4;
            group.add(tail);
        }

        group.castShadow = true;
        return group;
    }

    spawnBosses() {
        const orange = {
            mesh: this.createHumanoidMesh('ORANGE_BOSS'),
            hp: 1500, maxHp: 1500, speed: 0.06, name: 'ORANGE BOSS',
            title: 'ORANGE SLAMMER'
        };
        orange.mesh.position.set(-20, 0, -30);
        this.scene.add(orange.mesh);
        this.enemies.push(orange);

        const lemur = {
            mesh: this.createHumanoidMesh('LEMUR_BOSS'),
            hp: 1200, maxHp: 1200, speed: 0.09, name: 'LEMUR BOSS',
            title: 'LEMUR POUNCER'
        };
        lemur.mesh.position.set(20, 0, -30);
        this.scene.add(lemur.mesh);
        this.enemies.push(lemur);
    }

    update(playerPos, buildingMgr) {
        this.enemies.forEach((enemy) => {
            let dir = playerPos.clone().sub(enemy.mesh.position);
            dir.y = 0;
            let dist = dir.length();

            if (dist > 1.8) {
                dir.normalize();
                enemy.mesh.position.add(dir.multiplyScalar(enemy.speed));
            }

            // Snap feet to terrain/built surface
            let groundY = buildingMgr.getSurfaceHeightAt(enemy.mesh.position.x, enemy.mesh.position.z);
            enemy.mesh.position.y = groundY;
        });
    }
}
