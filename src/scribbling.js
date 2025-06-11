import * as Tone from 'tone';
import * as Scribble from 'scribbletune/browser';
    
// Create a session
const sesh = new Scribble.Session();

window.Tone = Tone;
Tone.start();
Tone.getTransport().bpm.value = 60;
Tone.getTransport().start();

const melodyChannel = sesh.createChannel({
    instrument: 'PolySynth',
    clips: [
        { pattern: '[xxx][x-x][xxx][x-x]', notes: 'D4 D4 D4 E4 E4 G4 G4 G4 A4 C4' },
    ]
});

melodyChannel.startClip(0);