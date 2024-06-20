let lastWord = '';
let usedPhrases = [];
let timer;
let timeLeft = 30;
let playerTurn = true;  // Biến để kiểm soát lượt chơi

// Đoạn mã JavaScript để cập nhật danh sách từ nhập
let wordList = document.getElementById('wordList');

function startTimer() {
    timeLeft = 30;
    document.getElementById('timer').innerText = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            if (playerTurn) {
                document.getElementById('message').innerText = "Bạn đã thua vì không trả lời kịp thời!";
            } else {
                document.getElementById('message').innerText = "Máy tính đã thua vì không tìm được từ ghép!";
            }
            document.getElementById('playerInput').disabled = true;
            document.getElementById('restartButton').style.display = 'inline';
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    startTimer();
}

function addToWordList(word) {
    let li = document.createElement('li');
    li.textContent = word;
    wordList.appendChild(li);
}

function submitPhrase() {
    const playerInput = document.getElementById('playerInput').value.trim().toLowerCase();
    
    if (!playerInput || usedPhrases.includes(playerInput) || (lastWord && playerInput.split(' ')[0] !== lastWord)) {
        document.getElementById('message').innerText = "Từ ghép không hợp lệ. Nhập lại!";
        return;
    }

    usedPhrases.push(playerInput);
    addToWordList(playerInput);
    lastWord = playerInput.split(' ').pop();
    document.getElementById('message').innerText = "";
    document.getElementById('playerInput').value = '';
    playerTurn = false;  // Chuyển lượt cho máy tính
    resetTimer();
    
    fetch('/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ last_word: lastWord, used_phrases: usedPhrases }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "win") {
            document.getElementById('message').innerText = "Bạn thắng!";
            clearInterval(timer);
            document.getElementById('restartButton').style.display = 'inline';
        } else {
            addToWordList(data.phrase);
            document.getElementById('computerChoice').innerText = `Máy tính chọn từ ghép: ${data.phrase}`;
            lastWord = data.last_word;
            usedPhrases = data.used_phrases;
            playerTurn = true;  // Chuyển lượt lại cho người chơi
            resetTimer();  // Bắt đầu lại bộ đếm thời gian khi máy tính hoàn thành lượt chơi
        }
    });
}

function restartGame() {
    clearInterval(timer);
    lastWord = '';
    usedPhrases = [];
    wordList.innerHTML = ''; // Xóa danh sách từ đã nhập
    document.getElementById('message').innerText = "";
    document.getElementById('computerChoice').innerText = "";
    document.getElementById('playerInput').value = '';
    document.getElementById('playerInput').disabled = false;
    document.getElementById('restartButton').style.display = 'none';
    playerTurn = true;
    document.getElementById('timer').innerText = "30";
}

// Đặt sự kiện khi nhấn phím Enter và khi trang được tải
window.onload = function() {
    document.getElementById('playerInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            submitPhrase();
        }
    });
};