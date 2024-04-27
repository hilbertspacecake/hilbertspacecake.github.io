let volumeInput = null;
let tempoInput = null;
let instrumentInput = null;
let frequencies = null;
let sampleMap = null;
let activeInstrument = null;
let activeSampler = null;
let samplerCache = {};

function playChords(chords) {
  Tone.start().then(() => {
    if (!Object.hasOwn(samplerCache, activeInstrument)) {
      samplerCache[activeInstrument] = new Tone.Sampler({
        urls: sampleMap[activeInstrument],
        release: 1,
        baseUrl: "/static/samples/" + activeInstrument + "/",
      }).toDestination();
    }
    activeSampler = samplerCache[activeInstrument];
    volumeInput.dispatchEvent(new Event("input"));
    Tone.loaded().then(() => {
      Tone.Transport.pause().cancel();
      for (let i = 0; i < chords.length; ++i) {
        const whole = Math.floor(i / 8);
        const fourth = Math.floor(i / 2) % 4;
        const eight = 2 * (i % 2);
        Tone.Transport.schedule((time) => {
          activeSampler.triggerAttackRelease(chords[i], "8n", time);
          console.debug("trigger", i, ":", chords[i], "at", time);
        }, [whole, fourth, eight].join(":"));
      }
      Tone.Transport.position = 0;
      Tone.Transport.start(Tone.now());
    });
  });
}

function getChordPitches(notes) {
  let octave = octaveInput.value;
  let pitches = [];
  for (let note of notes) {
    if (pitches.length > 0 && frequencies[octave][note] < pitches.at(-1)) {
      ++octave;
    }
    if (octave < frequencies.length && frequencies[octave][note]) {
      pitches.push(frequencies[octave][note]);
    } else {
      console.error("cannot play undefined frequency:", note + octave);
    }
  }
  return pitches;
}

function getChordPitches2(notes) {
  const octave = parseInt(octaveInput.value);
  const pitches = [];
  for (let pitch of notes) {
    const degree = octave + pitch[1];
    const note = pitch[0];
    if (degree < frequencies.length && frequencies[degree][note]) {
      pitches.push(frequencies[degree][note]);
    } else {
      console.error("cannot play undefined frequency:", pitch);
    }
  }
  return pitches;
}

let waveCache = {};

function setupSynth() {
  frequencies = JSON.parse(
    document.querySelector("#frequencies-json").textContent
  );
  sampleMap = JSON.parse(
    document.querySelector("#sample-map-json").textContent
  );

  volumeInput = document.querySelector("#volume-input");
  tempoInput = document.querySelector("#tempo-input");
  instrumentInput = document.querySelector("#select-instrument");
  octaveInput = document.querySelector("#select-octave");

  volumeInput.addEventListener("input", (e) => {
    const volume = parseFloat(volumeInput.value);
    if (activeSampler) {
      activeSampler.volume.value = -30 + (-3 + 30) * volume;
    }
    Tone.start().then(() => {
      Tone.Master.mute = volume < 0.001;
    });
  });

  tempoInput.addEventListener("input", (e) => {
    Tone.start().then(() => {
      Tone.Transport.bpm.value = parseInt(e.target.value);
    });
  });
  tempoInput.dispatchEvent(new Event("input"));

  instrumentInput.addEventListener("input", (e) => {
    activeInstrument = e.target.value;
  });
  instrumentInput.dispatchEvent(new Event("input"));

  for (let playButton of document.querySelectorAll("td.play-scale-button")) {
    playButton.addEventListener("click", (e) => {
      const row = playButton.parentElement;
      const noteData = Array.from(row.querySelectorAll("td.square.note.on"));
      if (
        noteData.length === 0 ||
        !noteData.every((n) => n.hasAttribute("pitch"))
      ) {
        console.error("row", row, "has no playable noteData");
        return;
      }
      let notes = noteData.map((n) => n.getAttribute("pitch"));
      notes.push(notes.at(0));
      let chords = [];
      for (let pitch of getChordPitches(notes)) {
        chords.push([pitch]);
      }
      const up = Array.from(chords);
      const down = Array.from(chords).reverse();
      chords = up.concat(down.slice(1));
      playChords(chords);
    });
  }

  for (let playButton of document.querySelectorAll(
    "td.play-progression-button"
  )) {
    playButton.addEventListener("click", (e) => {
      const row = playButton.parentElement;
      if (
        !progressionData[row.id] ||
        row.querySelectorAll("td.playable-chord").length === 0
      ) {
        console.error("row", row, "has no playable chords");
        return;
      }
      const chordNotes = progressionData[row.id];
      const chords = [];
      for (let notes of chordNotes) {
        chords.push(getChordPitches2(notes));
      }
      playChords(chords);
    });
  }
}

addEventListener("DOMContentLoaded", setupSynth);
