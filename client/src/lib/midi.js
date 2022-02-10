// MIDI Messages: https://users.cs.cf.ac.uk/Dave.Marshall/Multimedia/node158.html

let midi;
let output;

function sendMessage(message, delay) {
  return new Promise((resolve, reject) => {
    if (delay === 0) {
      output.send(message);
      resolve();
    } else {
      setTimeout(() => {
        output.send(message);
        resolve();
      }, delay);
    }
  })
}

const notePromiseMap = {
  0: {},
  1: {},
  2: {},
  3: {},
  4: {},
  5: {},
  6: {},
  7: {},
  8: {},
  9: {},
  10: {},
  11: {},
  12: {},
  13: {},
  14: {},
  15: {},
};

const functions = {};

functions.noteOn = (channel, note, vel) => {
  if (notePromiseMap[channel][note]) {
    notePromiseMap[channel][note]
      .then(() => {
        sendMessage([ 0x90 + channel, note, vel ])
      });
  } else {
    sendMessage([ 0x90 + channel, note, vel ])
  }
}

functions.noteOff = (channel, note, delay=0) => {
  if (delay > 0) {
    notePromiseMap[channel][note] = sendMessage([ 0x80 + channel, note, 0 ], delay);
  } else {
    sendMessage([ 0x80 + channel, note, 0 ], 0);
  }
}

functions.playNote = (channel, note, len, vel=127) => {
  functions.noteOn(channel, note, vel);
  functions.noteOff(channel, note, Math.max(len-1, 1));
}

functions.playChord = (channel, notes, len) => {
    for (let note of notes) {
      functions.playNote(channel, note, len);
    }
}

functions.panic = (channel) => {
  sendMessage([ 0xB0 + channel, 0x7B, 0 ], 0);
}

functions.panicAll = () => {
  for (let channel = 0; channel < 16; channel++) {
    functions.panic(channel);
  }
}

functions.setInstrument = (channel, instr) => {
  sendMessage([ 0xC0 + channel, instr ], 0);
}

functions.loadMIDIOutput = () => {
  return navigator.requestMIDIAccess()
    .then((result) => {
      midi = result;
      midi.outputs.forEach((midiOutput) => output = midiOutput);
    });
}

export default functions;

// EXAMPLE:
// loadMIDIOutput()
//   .then(() => {
//     const b = 1000/2;

//     const c1 = [57, 61, 64, 69];
//     const c2 = [57, 61, 66, 69];
//     const c3 = [59, 62, 66, 69];
//     const c4 = [59, 62, 64, 68];

//     setInstrument(0, 27);
//     setInstrument(1, 33);

//     setTimeout(() => playNote(1, 45, (1)*b), (0)*b)
//     setTimeout(() => playChord(0, c1, (2/3)*b), 0)
//     setTimeout(() => playChord(0, c1, (1/3)*b), (0 + 2/3)*b)

//     setTimeout(() => playNote(1, 45, (1)*b), (1)*b)
//     setTimeout(() => playChord(0, c1, (2/3)*b), (1)*b)
//     setTimeout(() => playChord(0, c1, (1/3)*b), (1 + 2/3)*b)

//     setTimeout(() => playNote(1, 42, (1)*b), (2)*b)
//     setTimeout(() => playChord(0, c2, (2/3)*b), (2)*b)
//     setTimeout(() => playChord(0, c2, (3/3)*b), (2 + 2/3)*b)

//     setTimeout(() => playNote(1, 42, (1)*b), (3)*b)
//     setTimeout(() => playChord(0, c2, (1/3)*b), (3 + 2/3)*b)

//     setTimeout(() => playNote(1, 47, (1)*b), (4)*b)
//     setTimeout(() => playChord(0, c3, (2/3)*b), (4)*b)
//     setTimeout(() => playChord(0, c3, (1/3)*b), (4 + 2/3)*b)

//     setTimeout(() => playNote(1, 47, (1)*b), (5)*b)
//     setTimeout(() => playChord(0, c3, (2/3)*b), (5)*b)
//     setTimeout(() => playChord(0, c3, (1/3)*b), (5 + 2/3)*b)

//     setTimeout(() => playNote(1, 40, (1)*b), (6)*b)
//     setTimeout(() => playChord(0, c4, (1/3)*b), (6)*b)
//     setTimeout(() => playChord(0, c4, (1/3)*b), (6 + 1/3)*b)
//     setTimeout(() => playChord(0, c4, (1/3)*b), (6 + 2/3)*b)

//     setTimeout(() => playNote(1, 40, (1)*b), (7)*b)
//     setTimeout(() => playChord(0, c4, (2/3)*b), (7)*b)
//     setTimeout(() => playChord(0, c4, (1/3)*b), (7 + 2/3)*b)
//   });