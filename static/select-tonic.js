let scaleNotes = null;
let chordNotes = null;
let progressionData = {};
let selectChordVoicing = null;

function updateScaleNotes(tonic) {
  const groups = scaleNotes[tonic];
  for (let i1 = 0; i1 < groups.length; ++i1) {
    const group = groups[i1].data;
    for (let i2 = 0; i2 < group.length; ++i2) {
      const scaleList = group[i2].data;
      for (let i3 = 0; i3 < scaleList.length; ++i3) {
        const notes = scaleList[i3].notes;
        const pitches = scaleList[i3].pitches;
        for (let i4 = 0; i4 < notes.length; ++i4) {
          const note = notes[i4];
          const pitch = pitches[i4];
          const squareId = ["square", i1, i2, i3, i4].join("-");
          const square = document.querySelector("#" + squareId);
          if (note.length > 0) {
            square.innerText = note;
            square.classList.add("on");
            square.setAttribute("pitch", pitch);
          } else {
            square.innerText = "";
            square.classList.remove("on");
            square.removeAttribute("pitch");
          }
        }
      }
    }
  }
}

function updateChordNotes(tonic, chordVoicing) {
  const [voicing, position] = chordVoicing.split(":");
  const groups = chordNotes[tonic];
  for (let i1 = 0; i1 < groups.length; ++i1) {
    const group = groups[i1].data;
    for (let i2 = 0; i2 < group.length; ++i2) {
      const progression = group[i2].data[voicing][position];
      const progId = ["progression", i1, i2].join("-");
      progressionData[progId] = Array.from(progression, (ch) => ch.pitches);
      for (let i3 = 0; i3 < progression.length; ++i3) {
        const chord = progression[i3];
        const squareId = ["chord", i1, i2, i3].join("-");
        const square = document.querySelector("#" + squareId);
        if (square) {
          square.innerText = chord.name;
        }
      }
    }
  }
}

function setupTonicSelector() {
  scaleNotes = JSON.parse(
    document.querySelector("#scale-notes-json").textContent
  );
  chordNotes = JSON.parse(
    document.querySelector("#chord-notes-json").textContent
  );
  selectChordVoicing = document.querySelector("#select-chord-voicing");

  const select = document.querySelector("#select-tonic");
  select.addEventListener("input", (e) => {
    const tonic = e.target.value;
    updateScaleNotes(tonic);
    updateChordNotes(tonic, selectChordVoicing.value);
  });

  selectChordVoicing.addEventListener("input", (e) => {
    updateChordNotes(select.value, e.target.value);
  });

  select.dispatchEvent(new Event("input"));
}

addEventListener("DOMContentLoaded", setupTonicSelector);
