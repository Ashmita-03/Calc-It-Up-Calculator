let x=0;
let y=0;
const input = document.getElementById('input');
const vol_slider = document.getElementById('vol-slider');
const thickness_slider = document.getElementById('thickness');
const waveform_select = document.getElementById('waveform');
const recording_toggle = document.getElementById('record');

var interval = null;
var reset = false;
var timepernote = 0;
var length = 0;
var freq = 0;

var blob, recorder = null;
var chunks = [];

// define canvas variables
var canvas = document.getElementById("canvas");
canvas.width= 900;
canvas.height= 500;
var ctx = canvas.getContext("2d");
var width= canvas.width;
var height= canvas.height;


// create web audio api elements
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();

// create Oscillator node
const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";

oscillator.start();
gainNode.gain.value = 0;

var notenames = new Map();
notenames.set("C", 261.6);
notenames.set("D", 293.7);
notenames.set("E", 329.6);
notenames.set("F", 349.2);
notenames.set("G", 392.0);
notenames.set("A", 440);
notenames.set("B", 493.9);

function frequency(pitch) {
    freq = pitch;
    gainNode.gain.setValueAtTime(vol_slider.value/100, audioCtx.currentTime);
let setting = setInterval(() => {gainNode.gain.value = vol_slider.value/100},1);
    oscillator.type = waveform_select.value;
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    setTimeout(() => { clearInterval(setting); gainNode.gain.value = 0;}, ((timepernote)-10));
}

function handle() {
    if(audioCtx.state === 'suspended'){
        audioCtx.resume();
    }
    reset = true;
    audioCtx.resume();
    gainNode.gain.value = 0;

    var usernotes = String(input.value);
    length = usernotes.length;
    timepernote = (6000 / length);

    var noteslist = [];

    for (let i = 0; i < usernotes.length; i++) {
        const note= usernotes[i].toUpperCase();
        if(notenames.has(note)){
             noteslist.push(notenames.get(note));
        }
    }

    let j = 0;
    let repeat;

    // Challenge solution - play the first note immediately 
    frequency((noteslist[j]));
    drawWave();
    j++;

    repeat = setInterval(() => {
        if (j < noteslist.length) {
            frequency(noteslist[j]);
            drawWave();
        j++;
        } else {
            clearInterval(repeat)
        }


    }, timepernote)

}

var counter = 0;
function drawWave() {
    clearInterval(interval);
    counter = 0;

    if (reset) {
        ctx.clearRect(0, 0, width, height);
        x = 0;
        y = height/2;
        ctx.moveTo(x, y);
        ctx.beginPath();
    }

    interval = setInterval(line, 20);
    reset = false;
}

function line() {
    let y = height/2;

    let freqs = [freq*0.001, freq*0.0015, freq*0.002];
    let amps = [(vol_slider.value/100)*40, (vol_slider.value/100)*25, (vol_slider.value/100)*15];

    for (let i = 0; i < freqs.length; i++) {
        y += amps[i] * Math.sin(x * 2 * Math.PI * freqs[i] * (0.5 * length));
    }
    ctx.lineTo(x, y);

    let color1 = document.getElementById('color1').value;
    let color2 = document.getElementById('color2').value;
    let color3 = document.getElementById('color3').value;


    let gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.5, color2);
    gradient.addColorStop(1, color3);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = thickness_slider.value;
    ctx.stroke();
    x = x + 1;

    // increase counter by 1 to show how long interval has been run
    counter++;
    
    if (counter > (timepernote/20)) {
        clearInterval(interval);
    }

}

function startRecording() {
    const canvasStream = canvas.captureStream(20); // Frame rate of canvas
    const audioDestination = audioCtx.createMediaStreamDestination();
    gainNode.connect(audioDestination);

    // Add in video data
    const combinedStream = new MediaStream();
    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
    audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));

    recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm'});

    recorder.ondataavailable = e => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };


    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        URL.revokeObjectURL(url);
        chunks = [];
    };

    recorder.start();
}


var is_recording = false;
function toggle() {
    is_recording = !is_recording;
    if(is_recording){
        recording_toggle.innerHTML = "Stop Recording";
        startRecording();
    } else {
        recording_toggle.innerHTML = "Start Recording";
        recorder.stop();
    }
}