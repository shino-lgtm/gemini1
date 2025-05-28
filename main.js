import * as THREE from 'https://unpkg.com/three@0.164.1/build/three.module.js';

// --- シーンのセットアップ ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth /
window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true }); // アンチエイリアスを有効に
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// カメラの位置を設定
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0); // 原点を見る

// --- ライトの追加 ---
const ambientLight = new THREE.AmbientLight(0x404040); // 環境光
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // 平行光源
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// --- 地面 ---
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color:
0x888888, side: THREE.DoubleSide });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // 地面を水平にする
scene.add(ground);

// --- プレイヤー ---
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.y = 0.5; // 地面の上に置く
scene.add(player);

// プレイヤーの移動速度
const playerSpeed = 0.1;
let moveLeft = false;
let moveRight = false;
let moveForward = false;
let moveBackward = false;

// --- 障害物 ---
const obstacles = [];
const obstacleCount = 10;
const obstacleSpeed = 0.05; // 障害物の移動速度

function createObstacle() {
    const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    const obstacleMaterial = new THREE.MeshStandardMaterial({ color:
0xff0000 });
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);

    // ランダムな位置に配置
    obstacle.position.x = (Math.random() - 0.5) * 20; // -10 から 10 の範囲
    obstacle.position.y = 0.5;
    obstacle.position.z = -Math.random() * 50 - 10; // -10 から -60 の範囲
(奥から手前に移動させるため)
    scene.add(obstacle);
    obstacles.push(obstacle);
}

for (let i = 0; i < obstacleCount; i++) {
    createObstacle();
}

// --- ゲームの状態 ---
let gameOver = false;

// --- キーボード入力イベント ---
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
    }
});

// --- 衝突判定関数 ---
function checkCollision(obj1, obj2) {
    const box1 = new THREE.Box3().setFromObject(obj1);
    const box2 = new THREE.Box3().setFromObject(obj2);
    return box1.intersectsBox(box2);
}

// --- アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);

    if (gameOver) {
        // ゲームオーバー時は何もしない
        return;
    }

    // プレイヤーの移動
    if (moveLeft) player.position.x -= playerSpeed;
    if (moveRight) player.position.x += playerSpeed;
    if (moveForward) player.position.z -= playerSpeed;
    if (moveBackward) player.position.z += playerSpeed;

    // プレイヤーが画面外に出ないように制限
    player.position.x = Math.max(-9.5, Math.min(9.5,
player.position.x)); // X軸の範囲を制限
    player.position.z = Math.max(-5, Math.min(5, player.position.z));
 // Z軸の範囲を制限

    // 障害物の移動とリスポーン
    obstacles.forEach((obstacle, index) => {
        obstacle.position.z += obstacleSpeed; // 手前に移動

        // 障害物が画面の手前（カメラより手前）に来たらリスポーン
        if (obstacle.position.z > camera.position.z - 5) {
            obstacle.position.x = (Math.random() - 0.5) * 20;
            obstacle.position.z = -Math.random() * 50 - 10;
        }

        // プレイヤーと障害物の衝突判定
        if (checkCollision(player, obstacle)) {
            console.log("Game Over!");
            gameOver = true;
            // 必要に応じてゲームオーバー画面などを表示
            alert("Game Over!");
        }
    });

    renderer.render(scene, camera);
}

// ウィンドウリサイズ時の処理
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ゲーム開始
animate();
