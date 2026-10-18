// --- Navigation & HUD System ---
function openMenuSection(sectionId) {
    const screens = ['main-menu', 'mode-select', 'two-player-select', 'tutorial-screen', 'online-screen', 'settings-screen', 'pause-menu'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === sectionId) ? 'flex' : 'none';
    });
}

function startSinglePlayerGame(difficulty) {
    document.getElementById('mode-select').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    window.gameEngine.startMatch(difficulty, false);
}

function startTwoPlayerGame(difficulty) {
    document.getElementById('two-player-select').style.display = 'none';
    document.getElementById('hud').style.display = 'block';
    window.gameEngine.startMatch(difficulty, true);
}

function simMatchmaking(mode) {
    alert(`Searching for ${mode} cyber opponents... Match found!`);
    openMenuSection('main-menu');
}

function resumeGame() {
    document.getElementById('pause-menu').style.display = 'none';
    window.gameEngine.gameState = 'PLAYING';
    document.body.requestPointerLock();
}

function quitToMenu() {
    window.gameEngine.gameState = 'MENU';
    document.getElementById('hud').style.display = 'none';
    openMenuSection('main-menu');
}
