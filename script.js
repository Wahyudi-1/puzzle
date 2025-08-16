// --- 1. Inisialisasi dan Pengambilan Elemen HTML ---
document.addEventListener('DOMContentLoaded', () => {
    // Pengaturan Game
    const IMAGE_SRC = 'Bupati-Kupang.jpeg'; // GANTI NAMA FILE GAMBAR ANDA DI SINI
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

    // Fungsi untuk memulai atau me-reset permainan
    async function initGame() {
        // Reset status
        resetStatus();
        
        // Buat kepingan puzzle dari gambar
        try {
            const pieceImages = await sliceImage(IMAGE_SRC);
            setupPuzzle(pieceImages);
            startTimer();
        } catch (error) {
            console.error("Gagal memuat gambar puzzle:", error);
            puzzleBoard.textContent = "Gagal memuat gambar. Pastikan nama file gambar benar.";
        }
    }

    // Fungsi untuk me-reset status permainan
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

    // Fungsi untuk memotong gambar menggunakan Canvas
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
                        
                        // 'drawImage' memotong bagian dari gambar sumber
                        context.drawImage(
                            image,
                            c * pieceWidth, r * pieceHeight, // Posisi X dan Y pada gambar sumber
                            pieceWidth, pieceHeight,         // Lebar dan tinggi potongan
                            0, 0,                             // Posisi X dan Y untuk menggambar di canvas
                            pieceWidth, pieceHeight
                        );
                        // Simpan gambar potongan sebagai URL
                        pieceDataUrls.push(canvas.toDataURL());
                    }
                }
                resolve(pieceDataUrls);
            };
            image.onerror = reject;
        });
    }

    // Fungsi untuk menyiapkan papan dan kepingan puzzle
    function setupPuzzle(pieceImages) {
        // Acak urutan kepingan
        const shuffledPieces = pieceImages
            .map((img, index) => ({ img, originalIndex: index }))
            .sort(() => Math.random() - 0.5);

        // Buat slot di papan dan kepingan di kontainer
        for (let i = 0; i < PUZZLE_ROWS * PUZZLE_COLS; i++) {
            // Buat slot di papan target
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.dataset.index = i; // Beri index untuk validasi kemenangan
            puzzleBoard.appendChild(slot);
            addDropListeners(slot);

            // Buat kepingan puzzle
            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.style.backgroundImage = `url(${shuffledPieces[i].img})`;
            piece.style.width = `${puzzleBoard.clientWidth / PUZZLE_COLS - 4}px`; // -4 untuk gap dan border
            piece.style.height = `${puzzleBoard.clientHeight / PUZZLE_ROWS - 4}px`;
            piece.draggable = true;
            piece.dataset.index = shuffledPieces[i].originalIndex; // Simpan index aslinya
            pieceContainer.appendChild(piece);
            addDragListeners(piece);
        }
        
        // Atur grid layout pada papan
        puzzleBoard.style.gridTemplateColumns = `repeat(${PUZZLE_COLS}, 1fr)`;
        puzzleBoard.style.gridTemplateRows = `repeat(${PUZZLE_ROWS}, 1fr)`;
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
            e.preventDefault(); // Wajib agar event 'drop' bisa berjalan
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
            // Cek jika slot kosong ATAU index kepingan tidak cocok dengan index slot
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
});
