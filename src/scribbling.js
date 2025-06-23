import * as Tone from "tone";
import * as Scribble from "scribbletune/browser";

// Make Tone.js globally available
window.Tone = Tone;

// Set up transport and synth definitions, but DO NOT start audio yet.
Tone.getTransport().bpm.value = 60;
Tone.getTransport().swing = 0.05;

function createNewSession() {
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
        frequency: 600,
        envelope: {
            attack: 0.001,
            decay: 1.0,
            release: 0.5,
        },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
        volume: -20,
    });

    const whistleSynth = new Tone.MonoSynth({
        oscillator: {
            type: "sine",
        },
        filter: {
            Q: 3,
            type: "lowpass",
            rolloff: -12,
        },
        envelope: {
            attack: 0.01,
            decay: 0.2,
            sustain: 0.5,
            release: 0.3,
        },
        filterEnvelope: {
            attack: 0.01,
            decay: 0.1,
            sustain: 0.4,
            release: 0.2,
            baseFrequency: 800,
            octaves: 1.5,
        },
    });

    const freeverb = new Tone.Freeverb().toDestination();
    freeverb.dampening = 200;

    const reverb = new Tone.Reverb({
        decay: 0.8,
        preDelay: 0.01,
        wet: 1.0,
    }).toDestination();

    tambourineSynth.connect(reverb);
    steelPanSynth.connect(freeverb);

    const sesh = new Scribble.Session();
    const melodyChannel = sesh.createChannel({
        instrument: steelPanSynth,
        name: "melody",
        clips: [
            {
                pattern: "[xxx][R-x][RRR][R-x][xxx][R-x][RRR][x__]",
                notes: "D4 D4 D4 G4 C4 D4 F4 D4 G4 D4",
                randomNotes: Scribble.scale("D4 dorian").filter(
                    (note) => note !== "B4"
                ),
                subdiv: "4n",
                sizzle: true,
            },
        ],
    });
    const drumChannel = sesh.createChannel({
        instrument: "MembraneSynth",
        name: "drums",
        clips: [{ pattern: "[x--][x--][x--][x-x]", subdiv: "4n", notes: "D1" }],
    });
    const bassChannel = sesh.createChannel({
        instrument: bassSynth,
        name: "bass",
        clips: [
            {
                pattern: "[xx-]".repeat(7) + "[xxx]",
                subdiv: "4n",
                notes: "D2 ".repeat(14) + "D2 C2 C2",
            },
        ],
    });
    const tambourineChannel = sesh.createChannel({
        instrument: tambourineSynth,
        name: "tambourine",
        clips: [
            {
                pattern:
                    "[x__]".repeat(3) + "[x_x]" + "[x__]".repeat(3) + "[xxx]",
                subdiv: "4n",
                notes: "G6",
            },
        ],
    });

    return sesh;
}

async function startNewMelodyLoop(session) {
    console.log("starting new melody loop");
    session.startRow(0);
}

function createControls(session) {
    const app = document.querySelector("#app");
    app.innerHTML = ""; // Clear existing buttons

    // --- Master Play/Pause Button ---
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("controls");
    app.appendChild(containerDiv);
    const playPauseButton = document.createElement("button");
    playPauseButton.textContent = "play";
    playPauseButton.addEventListener("click", async () => {
        // Start AudioContext if it's not running
        if (Tone.getContext().state !== "running") {
            await Tone.start();
            console.log("AudioContext started successfully by user gesture.");
        }

        // Toggle transport state
        if (Tone.getTransport().state === "started") {
            Tone.getTransport().pause();
            playPauseButton.textContent = "play";
        } else {
            Tone.getTransport().start();
            startNewMelodyLoop(session);
            playPauseButton.textContent = "pause";
        }
    });
    containerDiv.appendChild(playPauseButton);

    console.log(session.channels);

    session.channels.forEach((channel) => {
        const checkboxContainer = document.createElement("div");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `${channel.name}-checkbox`;
        checkbox.checked = !channel.mute;

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                channel.startClip(0);
            } else {
                channel.stopClip(0);
            }
        });

        const label = document.createElement("label");
        label.htmlFor = checkbox.id;
        label.textContent = ` ${
            channel.name.charAt(0) + channel.name.slice(1)
        }`;

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(label);
        containerDiv.appendChild(checkboxContainer);
    });
}

const session = createNewSession();
createControls(session);
