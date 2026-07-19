// ============================================================
//  Lobby.js — Главное меню GTA 2D + Аудио система
// ============================================================

class Lobby {
    constructor(onStart, onResume) {
        this.onStart = onStart;
        this.onResume = onResume;
        this.active = true;
        this.menu = 'main'; // main, settings, controls, audio, graphics, pause
        this.selectedIndex = 0;
        this.animTime = 0;
        this.fadeAlpha = 1;
        this.fadingIn = true;
        this.stars = [];
        this.cars = [];

        // Настройки (сохраняются)
        this.settings = {
            musicVolume: 0.6,
            sfxVolume: 0.8,
            showMinimap: true,
            showFPS: false,
            difficulty: 1, // 0=лёгкий, 1=норм, 2=сложный
            quality: 1,    // 0=низкое, 1=среднее, 2=высокое
        };
        this._loadSettings();

        // Генерация звёзд для фона
        for (let i = 0; i < 80; i++) {
            this.stars.push({
                x: Math.random(), y: Math.random(),
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.0003 + 0.0001,
                twinkle: Math.random() * Math.PI * 2,
            });
        }
        // Машины на фоне
        for (let i = 0; i < 6; i++) {
            this.cars.push({
                x: Math.random(), y: 0.6 + Math.random() * 0.3,
                speed: (Math.random() * 0.001 + 0.0005) * (Math.random() < 0.5 ? 1 : -1),
                color: ['#c33','#33c','#fc0','#3c3','#f80','#88f'][i],
                w: 30 + Math.random() * 20,
            });
        }

        // Аудио
        this.audioCtx = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.musicPlaying = false;
        this.musicNodes = [];
        this._initAudio();
    }

    // ==================== СОХРАНЕНИЕ ====================
    _loadSettings() {
        try {
            const saved = localStorage.getItem('gta2d_settings');
            if (saved) Object.assign(this.settings, JSON.parse(saved));
        } catch(e) {}
    }
    _saveSettings() {
        try {
            localStorage.setItem('gta2d_settings', JSON.stringify(this.settings));
        } catch(e) {}
    }

    // ==================== АУДИО СИСТЕМА ====================
    _initAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.audioCtx.createGain();
            this.musicGain.gain.value = this.settings.musicVolume;
            this.musicGain.connect(this.audioCtx.destination);

            this.sfxGain = this.audioCtx.createGain();
            this.sfxGain.gain.value = this.settings.sfxVolume;
            this.sfxGain.connect(this.audioCtx.destination);
        } catch(e) {
            console.warn('Audio не поддерживается');
        }
    }

    resumeAudio() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    setMusicVolume(v) {
        this.settings.musicVolume = v;
        if (this.musicGain) this.musicGain.gain.value = v;
        this._saveSettings();
    }

    setSfxVolume(v) {
        this.settings.sfxVolume = v;
        if (this.sfxGain) this.sfxGain.gain.value = v;
        this._saveSettings();
    }

    // ==================== ПРОЦЕДУРНАЯ МУЗЫКА (GTA-style) ====================
    startMusic() {
        if (this._bgMusic) return;
        this._bgMusic = new Audio('sounds/Music_GTA2D.mp3');
        this._bgMusic.loop = true;
        this._bgMusic.volume = this.settings.musicVolume;
        this._bgMusic.play();
    }
    stopMusic() {
        if (this._bgMusic) { this._bgMusic.pause(); this._bgMusic = null; }
    }

    stopMusic() {
        this.musicPlaying = false;
        this.musicNodes.forEach(n => { try { n.stop(); } catch(e){} });
        this.musicNodes = [];
    }

    _playMusicLoop() {
        if (!this.musicPlaying || !this.audioCtx) return;

        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        // GTA-style: бас + аккорды + мелодия (synthwave/dark)
        const bpm = 90;
        const beatDur = 60 / bpm;
        const barDur = beatDur * 4;
        const loopBars = 8;
        const loopDur = barDur * loopBars;

        // Басовая линия (тёмный синт)
        const bassNotes = [55, 55, 65.41, 65.41, 73.42, 73.42, 49, 49]; // A1, C2, D2, G1
        for (let bar = 0; bar < loopBars; bar++) {
            const t = now + bar * barDur;
            const freq = bassNotes[bar % bassNotes.length];

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + barDur * 0.9);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(t);
            osc.stop(t + barDur);
            this.musicNodes.push(osc);
        }

        // Аккорды (пэды)
        const chords = [
            [220, 277.18, 329.63],  // Am
            [220, 277.18, 329.63],
            [261.63, 329.63, 392],  // C
            [261.63, 329.63, 392],
            [293.66, 369.99, 440],  // Dm
            [293.66, 369.99, 440],
            [196, 246.94, 293.66],  // G
            [196, 246.94, 293.66],
        ];
        for (let bar = 0; bar < loopBars; bar++) {
            const t = now + bar * barDur;
            const chord = chords[bar % chords.length];
            chord.forEach(freq => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.06, t);
                gain.gain.setValueAtTime(0.06, t + barDur * 0.7);
                gain.gain.exponentialRampToValueAtTime(0.001, t + barDur);
                osc.connect(gain);
                gain.connect(this.musicGain);
                osc.start(t);
                osc.stop(t + barDur);
                this.musicNodes.push(osc);
            });
        }

        // Мелодия (верхний синт)
        const melody = [
            { note: 440, dur: 0.5 }, { note: 523.25, dur: 0.5 },
            { note: 493.88, dur: 1 }, { note: 440, dur: 0.5 },
            { note: 392, dur: 0.5 }, { note: 440, dur: 1 },
            { note: 523.25, dur: 0.5 }, { note: 587.33, dur: 0.5 },
            { note: 523.25, dur: 1 }, { note: 440, dur: 1 },
            { note: 392, dur: 0.5 }, { note: 349.23, dur: 0.5 },
            { note: 329.63, dur: 1 }, { note: 293.66, dur: 1 },
            { note: 329.63, dur: 0.5 }, { note: 392, dur: 0.5 },
        ];
        let melTime = now;
        melody.forEach(m => {
            const dur = m.dur * beatDur;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = m.note;
            gain.gain.setValueAtTime(0.04, melTime);
            gain.gain.exponentialRampToValueAtTime(0.001, melTime + dur * 0.8);
            osc.connect(gain);
            gain.connect(this.musicGain);
            osc.start(melTime);
            osc.stop(melTime + dur);
            this.musicNodes.push(osc);
            melTime += dur;
        });

        // Хай-хэт (ритм)
        for (let i = 0; i < loopBars * 8; i++) {
            const t = now + i * beatDur * 0.5;
            const bufferSize = ctx.sampleRate * 0.03;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let s = 0; s < bufferSize; s++) {
                data[s] = (Math.random() * 2 - 1) * (1 - s / bufferSize);
            }
            const src = ctx.createBufferSource();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 8000;
            src.buffer = buffer;
            gain.gain.value = (i % 2 === 0) ? 0.03 : 0.015;
            src.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            src.start(t);
            this.musicNodes.push(src);
        }

        // Кик (бочка)
        for (let bar = 0; bar < loopBars; bar++) {
            for (let beat = 0; beat < 4; beat++) {
                const t = now + bar * barDur + beat * beatDur;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(150, t);
                osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
                osc.connect(gain);
                gain.connect(this.musicGain);
                osc.start(t);
                osc.stop(t + 0.2);
                this.musicNodes.push(osc);
            }
        }

        // Зацикливание
        this._musicTimeout = setTimeout(() => {
            this.musicNodes = [];
            if (this.musicPlaying) this._playMusicLoop();
        }, loopDur * 1000 - 100);
    }

    // ==================== ЗВУКОВЫЕ ЭФФЕКТЫ ====================
    playSFX(type) {
        if (!this.audioCtx || !this.sfxGain) return;
        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        switch(type) {
            case 'shoot': {
                // Выстрел: шум + щелчок
                const bufSize = ctx.sampleRate * 0.08;
                const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) {
                    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 3);
                }
                const src = ctx.createBufferSource();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 3000;
                src.buffer = buf;
                gain.gain.value = 0.4;
                src.connect(filter);
                filter.connect(gain);
                gain.connect(this.sfxGain);
                src.start(now);
                break;
            }
            case 'shoot_auto': {
                const bufSize = ctx.sampleRate * 0.05;
                const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) {
                    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 4);
                }
                const src = ctx.createBufferSource();
                const gain = ctx.createGain();
                src.buffer = buf;
                gain.gain.value = 0.3;
                src.connect(gain);
                gain.connect(this.sfxGain);
                src.start(now);
                break;
            }
            case 'explosion': {
                const bufSize = ctx.sampleRate * 0.5;
                const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < bufSize; i++) {
                    d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
                }
                const src = ctx.createBufferSource();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, now);
                filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);
                src.buffer = buf;
                gain.gain.setValueAtTime(0.6, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                src.connect(filter);
                filter.connect(gain);
                gain.connect(this.sfxGain);
                src.start(now);
                break;
            }
            case 'hit': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.12);
                break;
            }
            case 'pickup': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            }
            case 'engine': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.value = 60 + Math.random() * 20;
                gain.gain.value = 0.05;
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            }
            case 'siren': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.linearRampToValueAtTime(900, now + 0.3);
                osc.frequency.linearRampToValueAtTime(600, now + 0.6);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.setValueAtTime(0.1, now + 0.5);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.65);
                break;
            }
            case 'click': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.value = 800;
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.06);
                break;
            }
            case 'select': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.12);
                break;
            }
            case 'wasted': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 1.5);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 1.6);
                break;
            }
            case 'car_enter': {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now);
                osc.stop(now + 0.22);
                break;
            }
        }
    }

    // ==================== РЕНДЕР МЕНЮ ====================
    render(ctx, W, H) {
        this.animTime += 0.016;

        // Фон — ночной город
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(0.5, '#1a1a3a');
        grad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Звёзды
        this.stars.forEach(s => {
            s.twinkle += 0.02;
            const alpha = 0.3 + Math.sin(s.twinkle) * 0.3;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fillRect(s.x * W, s.y * H * 0.5, s.size, s.size);
        });

        // Силуэт города
        ctx.fillStyle = '#111';
        for (let i = 0; i < 20; i++) {
            const bw = W / 20;
            const bh = 80 + Math.sin(i * 1.7) * 60 + Math.cos(i * 0.8) * 40;
            ctx.fillRect(i * bw, H * 0.55 - bh, bw - 2, bh + H * 0.5);
            // Окна
            ctx.fillStyle = 'rgba(255,200,50,0.3)';
            for (let wy = H * 0.55 - bh + 10; wy < H * 0.55; wy += 15) {
                for (let wx = i * bw + 5; wx < (i + 1) * bw - 5; wx += 10) {
                    if (Math.sin(wx * wy * 0.01 + this.animTime) > 0.3)
                        ctx.fillRect(wx, wy, 5, 7);
                }
            }
            ctx.fillStyle = '#111';
        }

        // Дорога
        ctx.fillStyle = '#222';
        ctx.fillRect(0, H * 0.55, W, H * 0.45);
        ctx.strokeStyle = '#aa0';
        ctx.lineWidth = 2;
        ctx.setLineDash([30, 30]);
        ctx.beginPath();
        ctx.moveTo(0, H * 0.72);
        ctx.lineTo(W, H * 0.72);
        ctx.stroke();
        ctx.setLineDash([]);

        // Машины на фоне
        this.cars.forEach(c => {
            c.x += c.speed;
            if (c.x > 1.1) c.x = -0.1;
            if (c.x < -0.1) c.x = 1.1;
            const cx = c.x * W;
            const cy = c.y * H;
            ctx.fillStyle = c.color;
            ctx.fillRect(cx - c.w/2, cy - 8, c.w, 16);
            ctx.fillStyle = 'rgba(255,255,200,0.8)';
            const dir = c.speed > 0 ? 1 : -1;
            ctx.fillRect(cx + dir * c.w/2 - 2, cy - 5, 4, 4);
            ctx.fillRect(cx + dir * c.w/2 - 2, cy + 2, 4, 4);
        });

        // Затемнение
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, W, H);

        // ---- МЕНЮ ----
        if (this.menu === 'main') this._renderMain(ctx, W, H);
        else if (this.menu === 'settings') this._renderSettings(ctx, W, H);
        else if (this.menu === 'audio') this._renderAudio(ctx, W, H);
        else if (this.menu === 'controls') this._renderControls(ctx, W, H);
        else if (this.menu === 'graphics') this._renderGraphics(ctx, W, H);
        else if (this.menu === 'pause') this._renderPause(ctx, W, H);

        // Fade in
        if (this.fadingIn) {
            this.fadeAlpha -= 0.02;
            if (this.fadeAlpha <= 0) { this.fadeAlpha = 0; this.fadingIn = false; }
            ctx.fillStyle = `rgba(0,0,0,${this.fadeAlpha})`;
            ctx.fillRect(0, 0, W, H);
        }
    }

    _renderMain(ctx, W, H) {
        // Логотип
        ctx.save();
        ctx.textAlign = 'center';

        // Тень
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = 'bold 72px Arial';
        ctx.fillText('GTA 2D', W/2 + 3, H * 0.2 + 3);

        // Основной текст с градиентом
        const tGrad = ctx.createLinearGradient(W/2 - 150, 0, W/2 + 150, 0);
        tGrad.addColorStop(0, '#f80');
        tGrad.addColorStop(0.5, '#fc0');
        tGrad.addColorStop(1, '#f80');
        ctx.fillStyle = tGrad;
        ctx.font = 'bold 72px Arial';
        ctx.fillText('GTA 2D', W/2, H * 0.2);

        // Подзаголовок
        ctx.fillStyle = '#aaa';
        ctx.font = '18px Arial';
        ctx.fillText('OPEN WORLD EDITION', W/2, H * 0.2 + 35);

        // Пункты меню
        const items = [
            '🎮  НОВАЯ ИГРА',
            '▶️  ПРОДОЛЖИТЬ',
            '⚙️  НАСТРОЙКИ',
            '🚪  ВЫХОД',
        ];
        const startY = H * 0.42;
        const gap = 55;

        items.forEach((item, i) => {
            const y = startY + i * gap;
            const selected = i === this.selectedIndex;

            if (selected) {
                ctx.fillStyle = 'rgba(255,150,0,0.15)';
                ctx.fillRect(W/2 - 180, y - 22, 360, 44);
                ctx.strokeStyle = '#f80';
                ctx.lineWidth = 2;
                ctx.strokeRect(W/2 - 180, y - 22, 360, 44);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px Arial';
            } else {
                ctx.fillStyle = '#999';
                ctx.font = '22px Arial';
            }
            ctx.fillText(item, W/2, y + 8);
        });

        // Подсказка
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText('↑↓ — выбор  |  ENTER — подтвердить  |  ESC — назад', W/2, H - 40);

        ctx.restore();
    }

    _renderSettings(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fc0';
        ctx.font = 'bold 42px Arial';
        ctx.fillText('⚙️ НАСТРОЙКИ', W/2, H * 0.15);

        const items = [
            '🔊  Аудио и музыка',
            '🎮  Управление',
            '🖥️  Графика',
            `📊  Сложность: ${['Лёгкая','Нормальная','Сложная'][this.settings.difficulty]}`,
            '↩️  Назад',
        ];
        const startY = H * 0.32;
        const gap = 50;

        items.forEach((item, i) => {
            const y = startY + i * gap;
            const selected = i === this.selectedIndex;
            if (selected) {
                ctx.fillStyle = 'rgba(255,150,0,0.15)';
                ctx.fillRect(W/2 - 180, y - 20, 360, 40);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 22px Arial';
            } else {
                ctx.fillStyle = '#999';
                ctx.font = '20px Arial';
            }
            ctx.fillText(item, W/2, y + 7);
        });

        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText('↑↓ — выбор  |  ENTER — войти  |  ←→ — изменить  |  ESC — назад', W/2, H - 40);
        ctx.restore();
    }

    _renderAudio(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fc0';
        ctx.font = 'bold 42px Arial';
        ctx.fillText('🔊 АУДИО', W/2, H * 0.15);

        const items = [
            `🎵  Громкость музыки: ${Math.round(this.settings.musicVolume * 100)}%`,
            `🔫  Громкость звуков: ${Math.round(this.settings.sfxVolume * 100)}%`,
            '🎵  Тест музыки',
            '🔫  Тест выстрела',
            '💥  Тест взрыва',
            '↩️  Назад',
        ];
        const startY = H * 0.3;
        const gap = 48;

        items.forEach((item, i) => {
            const y = startY + i * gap;
            const selected = i === this.selectedIndex;
            if (selected) {
                ctx.fillStyle = 'rgba(255,150,0,0.15)';
                ctx.fillRect(W/2 - 200, y - 18, 400, 36);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 20px Arial';
            } else {
                ctx.fillStyle = '#999';
                ctx.font = '18px Arial';
            }
            ctx.fillText(item, W/2, y + 6);
        });

        // Полоски громкости
        const barW = 200, barH = 8;
        // Музыка
        ctx.fillStyle = '#333';
        ctx.fillRect(W/2 + 120, startY - 5, barW, barH);
        ctx.fillStyle = '#4c4';
        ctx.fillRect(W/2 + 120, startY - 5, barW * this.settings.musicVolume, barH);
        // Звуки
        ctx.fillStyle = '#333';
        ctx.fillRect(W/2 + 120, startY + gap - 5, barW, barH);
        ctx.fillStyle = '#48f';
        ctx.fillRect(W/2 + 120, startY + gap - 5, barW * this.settings.sfxVolume, barH);

        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText('←→ — регулировать  |  ENTER — тест  |  ESC — назад', W/2, H - 40);
        ctx.restore();
    }

    _renderControls(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fc0';
        ctx.font = 'bold 42px Arial';
        ctx.fillText('🎮 УПРАВЛЕНИЕ', W/2, H * 0.12);

        const controls = [
            ['W A S D', 'Движение / Руль'],
            ['F', 'Сесть / Выйти из авто'],
            ['SPACE', 'Тормоз / Удар'],
            ['ЛКМ', 'Стрелять'],
            ['1 2 3', 'Смена оружия'],
            ['SHIFT', 'Бег / Нитро'],
            ['E', 'Подобрать предмет'],
            ['ESC', 'Пауза / Меню'],
        ];

        ctx.font = '18px Arial';
        controls.forEach((c, i) => {
            const y = H * 0.24 + i * 42;
            ctx.fillStyle = '#f80';
            ctx.textAlign = 'right';
            ctx.fillText(c[0], W/2 - 20, y);
            ctx.fillStyle = '#ccc';
            ctx.textAlign = 'left';
            ctx.fillText(c[1], W/2 + 20, y);
        });

        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText('ESC — назад', W/2, H - 40);
        ctx.restore();
    }

    _renderGraphics(ctx, W, H) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fc0';
        ctx.font = 'bold 42px Arial';
        ctx.fillText('🖥️ ГРАФИКА', W/2, H * 0.15);

        const items = [
            `🖼️  Качество: ${['Низкое','Среднее','Высокое'][this.settings.quality]}`,
            `🗺️  Мини-карта: ${this.settings.showMinimap ? 'ВКЛ' : 'ВЫКЛ'}`,
            `📊  Показывать FPS: ${this.settings.showFPS ? 'ВКЛ' : 'ВЫКЛ'}`,
            '↩️  Назад',
        ];
        const startY = H * 0.32;
        const gap = 50;

        items.forEach((item, i) => {
            const y = startY + i * gap;
            const selected = i === this.selectedIndex;
            if (selected) {
                ctx.fillStyle = 'rgba(255,150,0,0.15)';
                ctx.fillRect(W/2 - 180, y - 20, 360, 40);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 20px Arial';
            } else {
                ctx.fillStyle = '#999';
                ctx.font = '18px Arial';
            }
            ctx.fillText(item, W/2, y + 7);
        });

        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.fillText('←→ — изменить  |  ESC — назад', W/2, H - 40);
        ctx.restore();
    }

    _renderPause(ctx, W, H) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fc0';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('ПАУЗА', W/2, H * 0.2);

        const items = [
            '▶️  Продолжить',
            '⚙️  Настройки',
            '🏠  Главное меню',
        ];
        const startY = H * 0.38;
        const gap = 55;

        items.forEach((item, i) => {
            const y = startY + i * gap;
            const selected = i === this.selectedIndex;
            if (selected) {
                ctx.fillStyle = 'rgba(255,150,0,0.15)';
                ctx.fillRect(W/2 - 160, y - 22, 320, 44);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px Arial';
            } else {
                ctx.fillStyle = '#999';
                ctx.font = '22px Arial';
            }
            ctx.fillText(item, W/2, y + 8);
        });
        ctx.restore();
    }

    // ==================== ВВОД ====================
    handleKey(code) {
        this.resumeAudio();

        if (code === 'Escape') {
            if (this.menu === 'main') return;
            if (this.menu === 'pause') { this.active = false; return; }
            this.menu = this.menu === 'audio' || this.menu === 'controls' || this.menu === 'graphics'
                ? 'settings' : 'main';
            this.selectedIndex = 0;
            this.playSFX('click');
            return;
        }

        if (code === 'ArrowUp' || code === 'KeyW') {
            this.selectedIndex--;
            this.playSFX('click');
        }
        if (code === 'ArrowDown' || code === 'KeyS') {
            this.selectedIndex++;
            this.playSFX('click');
        }

        // Ограничение
        const maxItems = { main: 4, settings: 5, audio: 6, controls: 1, graphics: 4, pause: 3 };
        const max = maxItems[this.menu] || 4;
        if (this.selectedIndex < 0) this.selectedIndex = max - 1;
        if (this.selectedIndex >= max) this.selectedIndex = 0;

        // Лево/право для настроек
        if (code === 'ArrowLeft' || code === 'ArrowRight') {
            const dir = code === 'ArrowRight' ? 1 : -1;
            if (this.menu === 'audio') {
                if (this.selectedIndex === 0) this.setMusicVolume(clamp(this.settings.musicVolume + dir * 0.1, 0, 1));
                if (this.selectedIndex === 1) this.setSfxVolume(clamp(this.settings.sfxVolume + dir * 0.1, 0, 1));
            }
            if (this.menu === 'settings' && this.selectedIndex === 3) {
                this.settings.difficulty = (this.settings.difficulty + dir + 3) % 3;
                this._saveSettings();
            }
            if (this.menu === 'graphics') {
                if (this.selectedIndex === 0) {
                    this.settings.quality = (this.settings.quality + dir + 3) % 3;
                    this._saveSettings();
                }
                if (this.selectedIndex === 1) { this.settings.showMinimap = !this.settings.showMinimap; this._saveSettings(); }
                if (this.selectedIndex === 2) { this.settings.showFPS = !this.settings.showFPS; this._saveSettings(); }
            }
            this.playSFX('click');
        }

        // Enter
        if (code === 'Enter' || code === 'Space') {
            this.playSFX('select');
            this._select();
        }
    }

    _select() {
        if (this.menu === 'main') {
            if (this.selectedIndex === 0) { this.active = false; this.onStart(); }
            if (this.selectedIndex === 1) { this.active = false; this.onResume(); }
            if (this.selectedIndex === 2) { this.menu = 'settings'; this.selectedIndex = 0; }
            if (this.selectedIndex === 3) { /* Выход */ }
        }
        else if (this.menu === 'settings') {
            if (this.selectedIndex === 0) { this.menu = 'audio'; this.selectedIndex = 0; }
            if (this.selectedIndex === 1) { this.menu = 'controls'; this.selectedIndex = 0; }
            if (this.selectedIndex === 2) { this.menu = 'graphics'; this.selectedIndex = 0; }
            if (this.selectedIndex === 4) { this.menu = 'main'; this.selectedIndex = 2; }
        }
        else if (this.menu === 'audio') {
            if (this.selectedIndex === 2) this.startMusic();
            if (this.selectedIndex === 3) this.playSFX('shoot');
            if (this.selectedIndex === 4) this.playSFX('explosion');
            if (this.selectedIndex === 5) { this.menu = 'settings'; this.selectedIndex = 0; }
        }
        else if (this.menu === 'graphics') {
            if (this.selectedIndex === 3) { this.menu = 'settings'; this.selectedIndex = 2; }
        }
        else if (this.menu === 'pause') {
            if (this.selectedIndex === 0) { this.active = false; }
            if (this.selectedIndex === 1) { this.menu = 'settings'; this.selectedIndex = 0; }
            if (this.selectedIndex === 2) { this.active = false; this.menu = 'main'; this.selectedIndex = 0; this.onStart(); }
        }
    }

    // Открыть паузу
    openPause() {
        this.active = true;
        this.menu = 'pause';
        this.selectedIndex = 0;
    }

    destroy() {
        this.stopMusic();
        if (this.audioCtx) this.audioCtx.close();
    }
}

// Утилита clamp (если ещё нет)
if (typeof clamp === 'undefined') {
    function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }
}

window.Lobby = Lobby;