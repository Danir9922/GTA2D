// ============================================================
//  MapGta.js — Генерация города, рендер, коллизии
// ============================================================

class MapGta {

    // ---------- настройки ----------
    constructor(config = {}) {
        this.TILE       = config.tile       || 64;
        this.ROAD_W     = config.roadWidth  || 3;   // ширина дороги в тайлах
        this.BLOCK      = config.block      || 8;   // тайлов на блок (дорога + застройка)
        this.MAP_BLOCKS = config.mapBlocks  || 14;  // кол-во блоков по каждой оси

        this.WORLD_W = this.MAP_BLOCKS * this.BLOCK * this.TILE;
        this.WORLD_H = this.MAP_BLOCKS * this.BLOCK * this.TILE;

        // данные карты
        this.buildings    = [];
        this.parks        = [];
        this.waterBodies  = [];
        this.decorations  = [];   // деревья, фонари, мусорки…
        this.roadMarksH   = [];   // горизонтальная разметка
        this.roadMarksV   = [];   // вертикальная разметка

        // палитра
        this.BUILDING_COLORS = [
            '#8B7355','#A0522D','#6B6B6B','#778899','#556B2F',
            '#8B4513','#696969','#4682B4','#B8860B','#708090',
            '#CD853F','#5F6B7A','#7A6B5F','#5A7A6B','#6B5A7A',
            '#9B8B7B','#7B8B9B','#8B7B6B','#A09080','#607080',
        ];
        this.ROOF_COLORS = [
            '#4a3a2a','#3a4a3a','#3a3a4a','#5a4a3a','#4a5a4a',
            '#3a4a5a','#5a3a3a','#3a5a5a','#5a5a3a','#4a4a4a',
        ];

        this._generated = false;
    }

    // ==========================================================
    //  ГЕНЕРАЦИЯ
    // ==========================================================
    generate(seed) {
        // простой seeded-random (mulberry32)
        let s = seed || (Math.random() * 2147483647) | 0;
        const rng = () => {
            s |= 0; s = s + 0x6D2B79F5 | 0;
            let t = Math.imul(s ^ s >>> 15, 1 | s);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
        const rand    = (a, b) => rng() * (b - a) + a;
        const randInt = (a, b) => Math.floor(rand(a, b + 1));

        this.buildings   = [];
        this.parks       = [];
        this.waterBodies = [];
        this.decorations = [];

        const T  = this.TILE;
        const RW = this.ROAD_W * T;
        const BS = this.BLOCK * T;

        for (let bx = 0; bx < this.MAP_BLOCKS; bx++) {
            for (let by = 0; by < this.MAP_BLOCKS; by++) {

                const blockX = bx * BS + RW;
                const blockY = by * BS + RW;
                const innerW = BS - RW;
                const innerH = BS - RW;

                // ---- шанс на спец-блок ----
                const roll = rng();

                // Парк
                if (roll < 0.10) {
                    this.parks.push({ x: blockX, y: blockY, w: innerW, h: innerH });
                    this._fillPark(blockX, blockY, innerW, innerH, rand, randInt);
                    continue;
                }
                // Вода / пруд
                if (roll < 0.14) {
                    this.waterBodies.push({ x: blockX, y: blockY, w: innerW, h: innerH });
                    continue;
                }
                // Площадь / парковка (пустой асфальт)
                if (roll < 0.20) {
                    this.decorations.push({
                        type: 'plaza',
                        x: blockX, y: blockY, w: innerW, h: innerH,
                    });
                    continue;
                }

                // ---- Обычная застройка ----
                const cols = randInt(1, 3);
                const rows = randInt(1, 3);
                const gap  = 10;
                const cellW = (innerW - gap * (cols + 1)) / cols;
                const cellH = (innerH - gap * (rows + 1)) / rows;

                for (let c = 0; c < cols; c++) {
                    for (let r = 0; r < rows; r++) {
                        if (rng() < 0.08) continue; // пустой участок

                        const bw = cellW * rand(0.72, 1);
                        const bh = cellH * rand(0.72, 1);
                        const x  = blockX + gap + c * (cellW + gap) + (cellW - bw) / 2;
                        const y  = blockY + gap + r * (cellH + gap) + (cellH - bh) / 2;

                        const floors = randInt(1, 10);
                        const isSpecial = rng() < 0.08; // небоскрёб / церковь / магазин

                        this.buildings.push({
                            x, y, w: bw, h: bh,
                            floors,
                            color:     this.BUILDING_COLORS[randInt(0, this.BUILDING_COLORS.length - 1)],
                            roofColor: this.ROOF_COLORS[randInt(0, this.ROOF_COLORS.length - 1)],
                            type: isSpecial
                                ? ['skyscraper','church','shop','hospital'][randInt(0,3)]
                                : 'normal',
                            windowSeed: randInt(0, 99999),
                        });
                    }
                }
            }
        }

        // ---- декор вдоль дорог (фонари, деревья) ----
        for (let i = 0; i <= this.MAP_BLOCKS; i++) {
            const roadPos = i * BS;
            for (let d = T; d < this.WORLD_W; d += T * 3) {
                // фонари по краям горизонтальных дорог
                this.decorations.push({ type:'lamp', x: d, y: roadPos - 8 });
                this.decorations.push({ type:'lamp', x: d, y: roadPos + RW + 8 });
                // фонари вертикальных
                this.decorations.push({ type:'lamp', x: roadPos - 8, y: d });
                this.decorations.push({ type:'lamp', x: roadPos + RW + 8, y: d });
            }
        }

        this._generated = true;
        return this;
    }

    // ---------- наполнение парка ----------
    _fillPark(x, y, w, h, rand, randInt) {
        const count = randInt(6, 14);
        for (let i = 0; i < count; i++) {
            this.decorations.push({
                type: 'tree',
                x: x + rand(18, w - 18),
                y: y + rand(18, h - 18),
                r: rand(8, 16),
            });
        }
        // скамейки
        for (let i = 0; i < randInt(1, 3); i++) {
            this.decorations.push({
                type: 'bench',
                x: x + rand(20, w - 20),
                y: y + rand(20, h - 20),
            });
        }
    }

    // ==========================================================
    //  КОЛЛИЗИИ / ЗАПРОСЫ
    // ==========================================================

    /** Столкновение точки+радиуса со зданием. Возвращает здание или null */
    collidesBuilding(px, py, radius) {
        for (const b of this.buildings) {
            const cx = Math.max(b.x, Math.min(px, b.x + b.w));
            const cy = Math.max(b.y, Math.min(py, b.y + b.h));
            if (Math.hypot(px - cx, py - cy) < radius) return b;
        }
        return null;
    }

    /** Точка на дороге? */
    isOnRoad(px, py) {
        const BS = this.BLOCK * this.TILE;
        const RW = this.ROAD_W * this.TILE;
        const mx = ((px % BS) + BS) % BS;
        const my = ((py % BS) + BS) % BS;
        return mx < RW || my < RW;
    }

    /** Точка в парке? */
    isInPark(px, py) {
        return this.parks.some(p =>
            px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h
        );
    }

    /** Точка в воде? */
    isInWater(px, py) {
        return this.waterBodies.some(w =>
            px >= w.x && px <= w.x + w.w && py >= w.y && py <= w.y + w.h
        );
    }

    /** Случайная точка на дороге (для спавна) */
    randomRoadPoint() {
        const BS = this.BLOCK * this.TILE;
        const RW = this.ROAD_W * this.TILE;
        const idx = Math.floor(Math.random() * (this.MAP_BLOCKS + 1));
        const along = Math.random() * this.WORLD_W;
        if (Math.random() < 0.5) {
            return { x: idx * BS + RW / 2, y: along, angle: Math.PI / 2 };
        }
        return { x: along, y: idx * BS + RW / 2, angle: 0 };
    }

    // ==========================================================
    //  РЕНДЕР  (вызывается из основного файла)
    // ==========================================================
    render(ctx, camX, camY, viewW, viewH, nightAlpha) {
        const T  = this.TILE;
        const BS = this.BLOCK * T;
        const RW = this.ROAD_W * T;

        // ---- земля ----
        ctx.fillStyle = '#3a5a3a';
        ctx.fillRect(0, 0, this.WORLD_W, this.WORLD_H);

        // ---- дороги ----
        ctx.fillStyle = '#3e3e3e';
        for (let i = 0; i <= this.MAP_BLOCKS; i++) {
            const p = i * BS;
            ctx.fillRect(p, 0, RW, this.WORLD_H);   // вертикальная
            ctx.fillRect(0, p, this.WORLD_W, RW);    // горизонтальная
        }

        // ---- тротуары ----
        ctx.fillStyle = '#6a6a6a';
        for (let i = 0; i <= this.MAP_BLOCKS; i++) {
            const p = i * BS;
            ctx.fillRect(p + RW, 0, 6, this.WORLD_H);
            ctx.fillRect(p - 6,  0, 6, this.WORLD_H);
            ctx.fillRect(0, p + RW, this.WORLD_W, 6);
            ctx.fillRect(0, p - 6,  this.WORLD_W, 6);
        }

        // ---- разметка ----
        ctx.strokeStyle = '#bb0';
        ctx.lineWidth = 2;
        ctx.setLineDash([22, 22]);
        for (let i = 0; i <= this.MAP_BLOCKS; i++) {
            const c = i * BS + RW / 2;
            ctx.beginPath(); ctx.moveTo(c, 0); ctx.lineTo(c, this.WORLD_H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, c); ctx.lineTo(this.WORLD_W, c); ctx.stroke();
        }
        ctx.setLineDash([]);

        // ---- парки ----
        this.parks.forEach(p => {
            ctx.fillStyle = '#2d6b2d';
            ctx.fillRect(p.x, p.y, p.w, p.h);
            // дорожка
            ctx.fillStyle = '#8a8a6a';
            ctx.fillRect(p.x + p.w / 2 - 6, p.y, 12, p.h);
            ctx.fillRect(p.x, p.y + p.h / 2 - 6, p.w, 12);
        });

        // ---- вода ----
        this.waterBodies.forEach(w => {
            ctx.fillStyle = '#1a5588';
            ctx.fillRect(w.x, w.y, w.w, w.h);
            // блики
            ctx.fillStyle = 'rgba(120,190,255,0.25)';
            for (let i = 0; i < 6; i++) {
                const rx = w.x + ((i * 137 + 50) % w.w);
                const ry = w.y + ((i * 211 + 30) % w.h);
                ctx.fillRect(rx, ry, 30 + (i % 3) * 15, 3);
            }
        });

        // ---- площади / парковки ----
        this.decorations.forEach(d => {
            if (d.type === 'plaza') {
                ctx.fillStyle = '#5a5a5a';
                ctx.fillRect(d.x, d.y, d.w, d.h);
                // линии парковки
                ctx.strokeStyle = '#888';
                ctx.lineWidth = 1;
                for (let lx = d.x + 20; lx < d.x + d.w; lx += 30) {
                    ctx.beginPath();
                    ctx.moveTo(lx, d.y + 5);
                    ctx.lineTo(lx, d.y + d.h - 5);
                    ctx.stroke();
                }
            }
        });

        // ---- здания ----
        this.buildings.forEach(b => {
            // тень
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.fillRect(b.x + 6, b.y + 6, b.w, b.h);

            // стены
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, b.w, b.h);

            // крыша
            ctx.fillStyle = b.roofColor;
            ctx.fillRect(b.x + 3, b.y + 3, b.w - 6, b.h - 6);

            // окна (детерминированные по seed)
            ctx.fillStyle = nightAlpha > 0.15
                ? 'rgba(255,255,150,0.75)'   // ночью горят
                : 'rgba(180,220,255,0.5)';   // днём — стекло
            const ws = 5, wg = 13;
            let si = b.windowSeed;
            for (let wx = b.x + 9; wx < b.x + b.w - 9; wx += wg) {
                for (let wy = b.y + 9; wy < b.y + b.h - 9; wy += wg) {
                    si = (si * 1103515245 + 12345) & 0x7fffffff;
                    if ((si >> 16) % 10 < 7) {
                        ctx.fillRect(wx, wy, ws, ws);
                    }
                }
            }

            // спец-метки
            if (b.type === 'hospital') {
                ctx.fillStyle = '#f00';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('+', b.x + b.w / 2, b.y + b.h / 2 + 5);
            }
            if (b.type === 'church') {
                ctx.fillStyle = '#da0';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('✝', b.x + b.w / 2, b.y + b.h / 2 + 4);
            }
            if (b.type === 'shop') {
                ctx.fillStyle = '#0af';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('$', b.x + b.w / 2, b.y + b.h / 2 + 4);
            }

            // контур
            ctx.strokeStyle = 'rgba(0,0,0,0.25)';
            ctx.lineWidth = 1;
            ctx.strokeRect(b.x, b.y, b.w, b.h);
        });

        // ---- декор (деревья, фонари, скамейки) ----
        this.decorations.forEach(d => {
            if (d.type === 'tree') {
                ctx.fillStyle = '#1a4a1a';
                ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#2a7a2a';
                ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 0.6, 0, Math.PI * 2); ctx.fill();
            }
            if (d.type === 'lamp') {
                ctx.fillStyle = '#555';
                ctx.fillRect(d.x - 1, d.y - 1, 3, 3);
                if (nightAlpha > 0.1) {
                    ctx.fillStyle = `rgba(255,255,180,${nightAlpha * 0.6})`;
                    ctx.beginPath(); ctx.arc(d.x, d.y, 14, 0, Math.PI * 2); ctx.fill();
                }
            }
            if (d.type === 'bench') {
                ctx.fillStyle = '#8B5A2B';
                ctx.fillRect(d.x - 8, d.y - 3, 16, 6);
            }
        });
    }

    // ==========================================================
    //  МИНИ-КАРТА
    // ==========================================================
    renderMinimap(mctx, mw, mh, playerX, playerY, camX, camY, viewW, viewH, entities) {
        const sx = mw / this.WORLD_W;
        const sy = mh / this.WORLD_H;

        mctx.fillStyle = '#1a2a1a';
        mctx.fillRect(0, 0, mw, mh);

        // дороги
        mctx.fillStyle = '#555';
        const BS = this.BLOCK * this.TILE;
        const RW = this.ROAD_W * this.TILE;
        for (let i = 0; i <= this.MAP_BLOCKS; i++) {
            const p = i * BS * sx;
            mctx.fillRect(p, 0, RW * sx, mh);
            mctx.fillRect(0, p, mw, RW * sy);
        }

        // здания
        mctx.fillStyle = '#777';
        this.buildings.forEach(b => {
            mctx.fillRect(b.x * sx, b.y * sy, Math.max(1, b.w * sx), Math.max(1, b.h * sy));
        });

        // парки
        mctx.fillStyle = '#2a5a2a';
        this.parks.forEach(p => {
            mctx.fillRect(p.x * sx, p.y * sy, p.w * sx, p.h * sy);
        });

        // вода
        mctx.fillStyle = '#2266aa';
        this.waterBodies.forEach(w => {
            mctx.fillRect(w.x * sx, w.y * sy, w.w * sx, w.h * sy);
        });

        // сущности (передаются извне)
        if (entities) {
            if (entities.vehicles) {
                mctx.fillStyle = '#88f';
                entities.vehicles.forEach(v => mctx.fillRect(v.x*sx-1, v.y*sy-1, 2, 2));
            }
            if (entities.police) {
                mctx.fillStyle = '#f00';
                entities.police.forEach(v => mctx.fillRect(v.x*sx-2, v.y*sy-2, 4, 4));
            }
            if (entities.npcs) {
                mctx.fillStyle = '#aaa';
                entities.npcs.forEach(n => { if(n.alive) mctx.fillRect(n.x*sx, n.y*sy, 1, 1); });
            }
        }

        // игрок
        mctx.fillStyle = '#0f0';
        mctx.beginPath();
        mctx.arc(playerX * sx, playerY * sy, 3, 0, Math.PI * 2);
        mctx.fill();

        // рамка видимой области
        mctx.strokeStyle = 'rgba(255,255,255,0.35)';
        mctx.lineWidth = 1;
        mctx.strokeRect(camX * sx, camY * sy, viewW * sx, viewH * sy);
    }
}

// ============================================================
//  Экспорт (для <script> просто создаём глобально)
// ============================================================
// Если используешь модули:
// export default MapGta;

// Для обычного <script>:
window.MapGta = MapGta;