// wwwroot/js/quiz-take.js
// Global variables
let currentQuestion = 0;
let totalQuestions = 0;
let answers = {};
let timer = null;
let startTime = null;
let timeLimit = 0;
let stream = null;
let detectionInterval = null;
let audioContext = null;
let analyser = null;
let microphone = null;
let isModelLoaded = false;

// Violation counters
let violations = {
    lookLeft: 0,
    lookRight: 0,
    noFace: 0,
    multiFace: 0,
    talking: 0
};

// Detection settings - DIPERBAIKI
const VIOLATION_COOLDOWN = 3000;
const SOUND_THRESHOLD = 30;
const HEAD_POSE_THRESHOLD = 25; // DIPERKECIL agar lebih sensitif
const FACE_DETECTION_CONFIDENCE = 0.5; // Tambahkan ambang batas keyakinan
let lastViolationTime = {
    lookLeft: 0,
    lookRight: 0,
    noFace: 0,
    multiFace: 0,
    talking: 0
};

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', async function() {
    totalQuestions = document.querySelectorAll('.question-panel').length;
    const durationText = document.querySelector('.quiz-info-sidebar .info-value').textContent;
    timeLimit = parseInt(durationText) || 30;
    startTime = new Date();
    
    initializeQuiz();
    startTimer();
    
    await initializeWebcam();
    await loadFaceDetectionModel();
    startDetection();
    
    await initializeAudioDetection();
});

// Quiz navigation functions (TIDAK BERUBAH)
function initializeQuiz() {
    updateQuestionCounter();
    document.querySelectorAll('.option-radio').forEach(radio => {
        radio.addEventListener('change', function() {
            const questionIndex = parseInt(this.name.split('-')[1]);
            answers[questionIndex] = parseInt(this.value);
            updateNavigationButtons();
            markQuestionAsAnswered(questionIndex);
        });
    });
}
function updateQuestionCounter() { document.getElementById('currentQuestion').textContent = currentQuestion + 1; }
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn'); const nextBtn = document.getElementById('nextBtn'); const submitBtn = document.getElementById('submitBtn');
    prevBtn.disabled = currentQuestion === 0;
    if (currentQuestion === totalQuestions - 1) { nextBtn.style.display = 'none'; submitBtn.style.display = 'block'; } else { nextBtn.style.display = 'block'; submitBtn.style.display = 'none'; }
}
function markQuestionAsAnswered(index) {
    const navBtn = document.querySelector(`.nav-btn[data-question="${index}"]`);
    if (navBtn) { navBtn.classList.add('answered'); }
}
function goToQuestion(index) {
    document.getElementById(`question-${currentQuestion}`).style.display = 'none';
    document.querySelector(`.nav-btn[data-question="${currentQuestion}"]`).classList.remove('current');
    currentQuestion = index;
    document.getElementById(`question-${currentQuestion}`).style.display = 'block';
    document.querySelector(`.nav-btn[data-question="${currentQuestion}"]`).classList.add('current');
    updateQuestionCounter(); updateNavigationButtons();
}
function previousQuestion() { if (currentQuestion > 0) goToQuestion(currentQuestion - 1); }
function nextQuestion() { if (currentQuestion < totalQuestions - 1) goToQuestion(currentQuestion + 1); }

// Timer functions (TIDAK BERUBAH)
function startTimer() {
    timer = setInterval(function() {
        const now = new Date(); const elapsed = Math.floor((now - startTime) / 1000); const remaining = Math.max(0, timeLimit * 60 - elapsed);
        const minutes = Math.floor(remaining / 60); const seconds = remaining % 60;
        document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const progress = ((timeLimit * 60 - remaining) / (timeLimit * 60)) * 100;
        document.getElementById('timerProgress').style.width = `${progress}%`;
        if (remaining === 0) { clearInterval(timer); submitQuiz(); }
    }, 1000);
}

// --- PERBAIKAN UTAMA: WEBCAM & DETEKSI ---
async function initializeWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true });
        const video = document.getElementById('webcam'); video.srcObject = stream;
        document.querySelector('.status-indicator').classList.add('active');
    } catch (error) { console.error('Error accessing webcam:', error); showWarning('Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin.'); }
}

async function loadFaceDetectionModel() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        isModelLoaded = true; console.log('Face detection models loaded successfully.');
    } catch (error) { console.error('Error loading face detection models:', error); showWarning('Gagal memuat model deteksi wajah.'); }
}

async function startDetection() {
    if (!isModelLoaded) return;
    const video = document.getElementById('webcam');
    const canvas = faceapi.createCanvasFromMedia(video);
    document.querySelector('.webcam-view').appendChild(canvas);
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
    
    detectionInterval = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // --- PERBAIKAN LOGIKA DETEKSI ---
        const validDetections = resizedDetections.filter(d => d.detection.score > FACE_DETECTION_CONFIDENCE);
        
        if (validDetections.length === 0) {
            handleViolation('noFace');
            updateDetectionStatus('Wajah Tidak Terdeteksi', 'warning');
        } else if (validDetections.length > 1) {
            handleViolation('multiFace');
            updateDetectionStatus('Banyak Wajah Terdeteksi', 'danger');
        } else {
            updateDetectionStatus('Wajah Terdeteksi', 'success');
            const landmarks = validDetections[0].landmarks;
            const headPose = estimateHeadPose(landmarks);
            console.log('Head Pose:', headPose); // DEBUG: Lihat nilai rotasi kepala di console

            if (headPose.yaw < -HEAD_POSE_THRESHOLD) {
                handleViolation('lookLeft');
            } else if (headPose.yaw > HEAD_POSE_THRESHOLD) {
                handleViolation('lookRight');
            }
        }
        
        // Gambar deteksi (opsional, bisa dihilangkan jika tidak mau ada kotak hijau)
        // faceapi.draw.drawDetections(canvas, validDetections);
        // faceapi.draw.drawFaceLandmarks(canvas, validDetections);

    }, 500); // Periksa setiap 500ms untuk responsif lebih baik
}

// --- PERBAIKAN FUNGSI ESTIMASI POSISI KEPALA ---
function estimateHeadPose(landmarks) {
    const nose = landmarks.getNose();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    const eyeCenter = { x: (leftEye[0].x + rightEye[3].x) / 2, y: (leftEye[0].y + rightEye[3].y) / 2 };
    const noseTip = nose[3];
    const deltaX = noseTip.x - eyeCenter.x;
    
    // Perhitungan lebih sederhana dan lebih akurat untuk rotasi kiri/kanan (yaw)
    const yaw = (deltaX / (rightEye[3].x - leftEye[0].x)) * 90; // Asumsikan jarak mata sebagai acuan 90 derajat
    
    return { yaw: yaw, pitch: 0 }; // Kita hanya butuh yaw untuk kiri/kanan
}

// Fungsi terpusat untuk menangani pelanggaran
function handleViolation(type) {
    const now = Date.now();
    const violationKey = type;
    if (now - lastViolationTime[violationKey] > VIOLATION_COOLDOWN) {
        violations[violationKey]++;
        lastViolationTime[violationKey] = now;
        updateViolationCount(`${type}Count`, violations[violationKey]);
        let message = '';
        switch(type) {
            case 'lookLeft': message = 'Anda terdeteksi menoleh ke kiri!'; break;
            case 'lookRight': message = 'Anda terdeteksi menoleh ke kanan!'; break;
            case 'noFace': message = 'Wajah tidak terdeteksi!'; break;
            case 'multiFace': message = 'Terdeteksi lebih dari satu wajah!'; break;
        }
        showWarning(message);
        logViolation(type.charAt(0).toUpperCase() + type.slice(1));
    }
}

// Audio Detection (TIDAK BERUBAH)
async function initializeAudioDetection() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        analyser.fftSize = 256;
        microphone.connect(analyser);
        monitorAudio();
    } catch (error) { console.error('Error initializing audio detection:', error); }
}
function monitorAudio() {
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        if (average > SOUND_THRESHOLD) { handleViolation('talking'); }
    }, 500);
}

// UI Update Functions (TIDAK BERUBAH)
function updateViolationCount(elementId, count) { const element = document.getElementById(elementId); if (element) { element.textContent = count; } }
function updateDetectionStatus(text, type) {
    const statusElement = document.querySelector('.detection-status span');
    const statusBox = document.querySelector('.detection-box');
    statusElement.textContent = text;
    statusBox.className = 'detection-box';
    if (type === 'success') { statusBox.style.background = 'rgba(16, 185, 129, 0.2)'; statusBox.style.borderColor = 'rgba(16, 185, 129, 0.3)'; }
    else if (type === 'warning') { statusBox.style.background = 'rgba(245, 158, 11, 0.2)'; statusBox.style.borderColor = 'rgba(245, 158, 11, 0.3)'; }
    else if (type === 'danger') { statusBox.style.background = 'rgba(239, 68, 68, 0.2)'; statusBox.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }
}
function showWarning(message) {
    const modal = document.getElementById('warningModal'); const messageElement = document.getElementById('warningMessage');
    messageElement.textContent = message; modal.style.display = 'flex';
    setTimeout(() => { closeWarning(); }, 3000);
}
function closeWarning() { document.getElementById('warningModal').style.display = 'none'; }

// Log violation to server (TIDAK BERUBAH)
async function logViolation(type) {
    const attemptId = document.querySelector('input[name="attemptId"]').value;
    try {
        await fetch('/Violation/Log', {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'RequestVerificationToken': document.querySelector('input[name="__RequestVerificationToken"]').value },
            body: JSON.stringify({ attemptId: attemptId, violationType: type })
        });
    } catch (error) { console.error('Error logging violation:', error); }
}

// Submit quiz (TIDAK BERUBAH)
async function submitQuiz() {
    clearInterval(timer); clearInterval(detectionInterval);
    if (stream) { stream.getTracks().forEach(track => track.stop()); }
    const answersData = JSON.stringify(answers);
    document.getElementById('answersData').value = answersData;
    document.getElementById('quizForm').submit();
}

// Clean up on page unload (TIDAK BERUBAH)
window.addEventListener('beforeunload', () => {
    if (stream) { stream.getTracks().forEach(track => track.stop()); }
    if (audioContext) { audioContext.close(); }
});