// В начале игры:
const lobby = new Lobby(
    () => { startNewGame(); },   // Новая игра
    () => { resumeGame(); }      // Продолжить
);
lobby.startMusic();

// В game loop:
if (lobby.active) {
    lobby.render(ctx, canvas.width, canvas.height);
    // Не обновляем игру
} else {
    update();
    render();
}

// Обработка клавиш для меню:
document.addEventListener('keydown', e => {
    if (lobby.active) {
        lobby.handleKey(e.code);
        e.preventDefault();
        return;
    }
    // ... обычный игровой ввод
    if (e.code === 'Escape') lobby.openPause();
});

// Звуки в игре:
lobby.playSFX('shoot');      // выстрел
lobby.playSFX('explosion');  // взрыв
lobby.playSFX('hit');        // попадание
lobby.playSFX('pickup');     // подбор
lobby.playSFX('siren');      // сирена
lobby.playSFX('car_enter');  // сесть в авто
lobby.playSFX('wasted');     // смерть