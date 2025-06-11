import * as Tone from 'tone';

const synth = new Tone.Synth().toDestination();

const transport = Tone.getTransport();

transport.bpm.value = 70;
transport.timeSignature = 3;
transport.swing = 1;
transport.loop = true;
transport.loopStart = 0;
transport.loopEnd = '2m';

let melody = [];
let currentEventId = null;

function getRandomElement(scale) {
  const randomIndex = Math.floor(Math.random() * scale.length);
  return scale[randomIndex];
}

function createMelody() {
  const dorianScale = ['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'];
  const possibleDurations = ['4n', '8n', '8n.','16n', '32n'];
  melody = [];
  
  let remainingTimeInSeconds = Tone.Time("2m").toSeconds();

  console.log("remainingTime:", remainingTimeInSeconds);

  while (remainingTimeInSeconds > 0) {
    const duration = getRandomElement(possibleDurations);
    const durationInSeconds = Tone.Time(duration).toSeconds();
    
    console.log("duration:", duration, "Duration in seconds:", durationInSeconds);

    // Only add the note if it fits in the remaining space
    if (remainingTimeInSeconds - durationInSeconds > 0) {
      melody.push({
        note: getRandomElement(dorianScale),
        duration: duration
      });
    }
    remainingTimeInSeconds = remainingTimeInSeconds - durationInSeconds;
  }
  
  console.log("melody:", melody);
  return melody;
}

function startNewMelodyLoop() {
  if (currentEventId !== null) {
    transport.clear(currentEventId);
  }
  
  melody = createMelody();
  
  currentEventId = transport.scheduleRepeat((time) => {
    let currentTime = time;
    melody.forEach((note) => {
      synth.triggerAttackRelease(note.note, note.duration, currentTime);
      currentTime += Tone.Time(note.duration).toSeconds();
    });
  }, '2m');
  
  if (transport.state !== 'started') {
    transport.start();
  }
}

function addMelodyButtons() {
  const app = document.querySelector('#app');
  const button = document.createElement('button');
  button.textContent = 'Play new melody';
  button.addEventListener('click', startNewMelodyLoop);
  app.appendChild(button);
  const stopButton = document.createElement('button');
  stopButton.textContent = 'Stop';
  stopButton.addEventListener('click', () => {
    transport.stop();
  });
  app.appendChild(stopButton);
}

addMelodyButtons();