// Константы мира — ДОЛЖНЫ грузиться ПЕРВЫМИ (до всех модулей)
const TILE = 64;
const ROAD_W = 3;
const BLOCK = 8;
const MAP_BLOCKS = 16;
const WORLD_W = MAP_BLOCKS * BLOCK * TILE;
const WORLD_H = WORLD_W;
const DAYCYCLE = 86400; // 24 минуты при 60fps
