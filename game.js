// --- Core Engine & Main Loop ---
class CyberBattlegrounds {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.gameState = 'MENU';
        this.keys = {};
        
        this.initThree();
        this.buildingMgr = new BuildingManager(this.scene);
        this.player = new PlayerController(this.camera, this.scene);
        this.enemyMgr = new EnemyManager(this.scene);
        
        this.createMenuDrone();
        this.bindEvents();
        this.animate();
    }

    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050810);
        this.scene.fog = new THREE.FogExp2(0x050810, 0.008);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.rotation.order = 'YXZ';

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const sun = new THREE.DirectionalLight(0x00fff2, 1.2);
        sun.position.set(50, 100, 50);
        this.scene.add(sun);

        // Cyber Grid Arena Floor
        const grid = new THREE.GridHelper(200, 50, 0x00fff2, 0x1e293b);
        grid.position.y = 0.02;
        this.scene.add(grid);
    }

    createMenuDrone() {
        this.drone = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), new THREE.MeshStandardMaterial({ color: 0x00fff2 }));
        this.drone.add(body);
        this.drone.position.set(0, 12, 0);
        this.scene.add(this.drone);
    }

    startMatch(difficulty, isTwoPlayer) {
        this.gameState = 'PLAYING';
        document.body.requestPointerLock();
        if (difficulty === 'FINAL_BOSS') {
            this.enemyMgr.spawnBosses();
        }
    }

    bindEvents() {
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            if (e.code === 'KeyP' || e.code === 'Escape') {
                if (this.gameState === 'PLAYING') {
                    this.gameState = 'PAUSED';
                    openMenuSection('pause-menu');
                    document.exitPointerLock();
                }
            }
            if (['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7'].includes(e.code)) {
                let slot = parseInt(e.code.replace('Digit', ''));
                this.player.setSlot(slot);
            }
        });

        window.addEventListener('keyup', e => this.keys[e.code] = false);

        window.addEventListener('mousemove', e => {
            if (this.gameState !== 'PLAYING') return;
            this.player.yaw -= e.movementX * 0.0025;
            this.player.pitch -= e.movementY * 0.0025;
            this.player.pitch = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, this.player.pitch));
        });

        window.addEventListener('mousedown', () => {
            if (this.gameState !== 'PLAYING') return;
            if (this.player.activeSlot >= 5) {
                this.buildingMgr.placeStructure(this.player.activeSlot, this.player);
            } else {
                window.sounds.play(this.player.activeSlot === 1 ? 'slash' : 'laser');
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.gameState === 'MENU') {
            // Drone Orbit Camera Animation
            let time = Date.now() * 0.001;
            this.drone.position.x = Math.sin(time) * 15;
            this.drone.position.z = Math.cos(time) * 15;
            this.camera.position.set(Math.sin(time * 0.5) * 30, 18, Math.cos(time * 0.5) * 30);
            this.camera.lookAt(0, 2, 0);
        } else if (this.gameState === 'PLAYING') {
            this.player.updatePhysics(this.keys, this.buildingMgr);
            this.buildingMgr.updateHologram(this.player.pos, this.player.yaw, this.player.activeSlot, this.camera);
            this.enemyMgr.update(this.player.pos, this.buildingMgr);
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.onload = () => {
    window.gameEngine = new CyberBattlegrounds();
};
