import * as Tone from "tone";
import * as Scribble from "scribbletune/browser";

// Make Tone.js globally available
window.Tone = Tone;

// Set up transport and synth definitions, but DO NOT start audio yet.
Tone.getTransport().bpm.value = 120;
Tone.getTransport().swing = 0.1;

const steelPanSynth = new Tone.Synth({
    oscillator: {
        type: "fatcustom",
        partials: [0.2, 1, 0, 0.5, 0.1],
        spread: 40,
        count: 3,
    },
    envelope: {
        attack: 0.001,
        decay: 1.6,
        sustain: 0,
        release: 1.6,
    },
});

const bassSynth = new Tone.Synth({
    oscillator: {
        type: "sine",
    },
    envelope: {
        attack: 0.001,
        decay: 1.6,
        sustain: 0,
        release: 1.6,
    },
});

const tambourineSynth = new Tone.MetalSynth({
    oscillator: {
        type: "sine",
    },
    envelope: {
        attack: 0.1,
        decay: 1.2,
        sustain: .2,
        release: 1.6,
    },
    volume: -10,
});

const freeverb = new Tone.Freeverb().toDestination();
freeverb.dampening = 200;

tambourineSynth.connect(freeverb);
steelPanSynth.connect(freeverb);

const sesh = new Scribble.Session();
const melodyChannel = sesh.createChannel({
    instrument: steelPanSynth,
    name: "melody",
    clips: [],
});
const drumChannel = sesh.createChannel({
    instrument: "MembraneSynth",
    name: "drums",
    clips: [{ pattern: "[x--][x--][x--][x-x]", subdiv: "2n", notes: "D1" }],
});
const bassChannel = sesh.createChannel({
    instrument: bassSynth,
    name: "bass",
    clips: [{ pattern: "[xx-]".repeat(8), subdiv: "2n", notes: "D2" }],
});
const tambourineChannel = sesh.createChannel({
    instrument: tambourineSynth,
    name: "tambourine",
    clips: [{ pattern: "[x__][x__][x__][x_x]", subdiv: "2n", notes: "G6" }],
});


async function startNewMelodyLoop() {
    // Start the AudioContext on the first user gesture
    if (Tone.getContext().state !== "running") {
        await Tone.start();
        console.log("AudioContext started successfully by user gesture.");
    }

    Tone.getTransport().start();
    melodyChannel.addClip(
        {
            pattern: "[xxx][R-x][RRR][R-x][xxx][R-x][RRR][x__]",
            notes: "D4 D4 D4 G4 C4 D4 F4 D4 G4 D4",
            randomNotes: Scribble.scale("D4 dorian").filter((note) => note !== "B4"),
            subdiv: "2n",
            sizzle: true,
        },
        0
    );
    console.log(sesh);
    console.log(sesh.channels);
    sesh.startRow(0);

    console.log("channels", sesh.channels);
}

function addMelodyButtons() {
    const app = document.querySelector("#app");
    app.innerHTML = "";

    const button = document.createElement("button");
    button.textContent = "Play new melody";
    button.addEventListener("click", startNewMelodyLoop);
    app.appendChild(button);

    const bassButton = document.createElement("button");
    bassButton.textContent = "New bassline";
    bassButton.addEventListener("click", () => {
        const chordProgression = Scribble.progression("m", 8).join(" ");
        console.log(chordProgression);
        const chordNames = Scribble.getChordsByProgression(
            "D2 dorian",
            chordProgression
        );

        const arpeggiated = Scribble.arp({
            chords: chordNames,
            count: 3,
            order: "012",
        }).join(" ");

        console.log("arpeggiated", arpeggiated);

        bassChannel.addClip({
            pattern: "[xxx]".repeat(8),
            notes: arpeggiated,
            subdiv: "2n",
        });

        bassChannel.startClip(bassChannel.clips.length - 1);

        console.log("Updated clip object:", bassChannel.clips[0]);
    });
    app.appendChild(bassButton);

    const originalBassButton = document.createElement("button");
    originalBassButton.textContent = "Original bassline";
    originalBassButton.addEventListener("click", () =>
        bassChannel.startClip(0)
    );
    app.appendChild(originalBassButton);

    const stopButton = document.createElement("button");
    stopButton.textContent = "Stop";
    stopButton.addEventListener("click", () => {
        Tone.getTransport().stop();
    });
    app.appendChild(stopButton);
}

addMelodyButtons();
