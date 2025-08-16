// Ganti event listener dari DOMContentLoaded menjadi window.onload
window.onload = function() {
    // --- 1. Inisialisasi dan Pengambilan Elemen HTML ---

    // Pengaturan Game
    const IMAGE_SRC = 'bupatikupang.jpeg'; // PASTIKAN NAMA FILE INI BENAR
    const PUZZLE_ROWS = 3;
    const PUZZLE_COLS = 4;

    // Elemen-elemen dari HTML
    const puzzleBoard = document.getElementById('puzzle-board');
    const pieceContainer = document.getElementById('piece-container');
    const timerEl = document.getElementById('timer');
    const moveCountEl = document.getElementById('move-count');
    const restartBtn = document.getElementById('restart-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const winModal = document.getElementById('win-modal');

    // Variabel Status Game
    let pieces = [];
    let moves = 0;
    let timerInterval;
    let seconds = 0;
    let draggedPiece = null;

    // --- 2. Logika Utama Permainan ---

    async function initGame() {
        resetStatus();
        try {
            const pieceImages = await sliceImage(IMAGE_SRC);
            setupPuzzle(pieceImages);
            startTimer();
        } catch (error) {
            console.error("Gagal memuat gambar puzzle:", error);
            puzzleBoard.textContent = "Gagal memuat gambar. Pastikan nama file gambar benar.";
        }
    }

    function resetStatus() {
        moves = 0;
        seconds = 0;
        moveCountEl.textContent = moves;
        timerEl.textContent = '00:00';
        clearInterval(timerInterval);
        puzzleBoard.innerHTML = '';
        pieceContainer.innerHTML = '';
        winModal.style.display = 'none';
    }

    function sliceImage(imageUrl) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = imageUrl;
            image.onload = () => {
                const pieceWidth = image.width / PUZZLE_COLS;
                const pieceHeight = image.height / PUZZLE_ROWS;
                const pieceDataUrls = [];
                for (let r = 0; r < PUZZLE_ROWS; r++) {
                    for (let c = 0; c < PUZZLE_COLS; c++) {
                        const canvas = document.createElement('canvas');
                        canvas.width = pieceWidth;
                        canvas.height = pieceHeight;
                        const context = canvas.getContext('2d');
                        context.drawImage(image, c * pieceWidth, r * pieceHeight, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);
                        pieceDataUrls.push(canvas.toDataURL());
                    }
                }
                resolve(pieceDataUrls);
            };
            image.onerror = reject;
        });
    }

    function setupPuzzle(pieceImages) {
        puzzleBoard.style.gridTemplateColumns = `repeat(${PUZZLE_COLS}, 1fr)`;
        puzzleBoard.style.gridTemplateRows = `repeat(${PUZZLE_ROWS}, 1fr)`;

        const shuffledPieces = pieceImages
            .map((img, index) => ({ img, originalIndex: index }))
            .sort(() => Math.random() - 0.5);

        for (let i = 0; i < PUZZLE_ROWS * PUZZLE_COLS; i++) {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.dataset.index = i;
            puzzleBoard.appendChild(slot);
            addDropListeners(slot);

            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.style.backgroundImage = `url(${shuffledPieces[i].img})`;
            
            // Ukuran kepingan dihitung berdasarkan ukuran papan yang sudah dirender dengan benar
            piece.style.width = `${puzzleBoard.clientWidth / PUZZLE_COLS}px`;
            piece.style.height = `${puzzleBoard.clientHeight / PUZZLE_ROWS}px`;

            piece.draggable = true;
            piece.dataset.index = shuffledPieces[i].originalIndex;
            pieceContainer.appendChild(piece);
            addDragListeners(piece);
        }
    }

    // --- 3. Logika Drag and Drop ---
    function addDragListeners(piece) {
        piece.addEventListener('dragstart', (e) => {
            draggedPiece = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        piece.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    }

    function addDropListeners(slot) {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('slot') && !e.target.hasChildNodes()) {
                e.target.appendChild(draggedPiece);
                moves++;
                moveCountEl.textContent = moves;
                checkWin();
            }
        });
    }

    // --- 4. Logika Timer dan Kemenangan ---
    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            const min = Math.floor(seconds / 60).toString().padStart(2, '0');
            const sec = (seconds % 60).toString().padStart(2, '0');
            timerEl.textContent = `${min}:${sec}`;
        }, 1000);
    }

    function checkWin() {
        const slots = puzzleBoard.querySelectorAll('.slot');
        let isWin = true;
        for (const slot of slots) {
            const piece = slot.querySelector('.puzzle-piece');
            if (!piece || piece.dataset.index !== slot.dataset.index) {
                isWin = false;
                break;
            }
        }
        if (isWin) {
            clearInterval(timerInterval);
            document.getElementById('final-time').textContent = timerEl.textContent;
            document.getElementById('final-moves').textContent = moves;
            winModal.style.display = 'flex';
        }
    }

    // --- 5. Event Listeners untuk Tombol ---
    restartBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', initGame);

    // --- Mulai Permainan ---
    initGame();
};
