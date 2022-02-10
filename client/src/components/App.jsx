import React from 'react';
import Keyboard from './Keyboard.jsx';
import PlayerGrid from './PlayerGrid.jsx';
import Playback from './Playback.jsx';
import midi from '../lib/midi.js';
import axios from 'axios';

const CHANNEL = 0;

class App extends React.Component {
  constructor() {
    super();
    const keys = [];
    const keynames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    let note = 0;
    for (let octave = -1; octave < 10; octave++) {
      for (let keyname of keynames) {
        if (note < 128) {
          keys.push([`${keyname}${octave}`, note]);
        }
        note++;
      }
    }
    keys.reverse();
    this.state = {
      keys,
      midiLoaded: false,
      ticksPerBeat: 64,
      pxPerBeat: 64,
      resolution: 1/4,
      tempo: 115,
      channel: 0,
      notes: {},
      selNoteLen: 1/4,
      selected: {},
    }
    this.loadSid = this.loadSid.bind(this);
    this.exportSequence = this.exportSequence.bind(this);
    this.placeNote = this.placeNote.bind(this);
    this.removeNote = this.removeNote.bind(this);
    this.toggleSelection = this.toggleSelection.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.setNotes = this.setNotes.bind(this);
    this.tempoChange = this.tempoChange.bind(this);
    this.noteLenChange = this.noteLenChange.bind(this);
  }

  componentDidMount() {
    midi.loadMIDIOutput()
      .then(() => {
        this.setState({ midiLoaded: true }, () => {
          document.getElementById('key75').scrollIntoView();
        });
      });

    const sidToLoad = location.search.substr(5);
    if (sidToLoad) {
      this.loadSid(sidToLoad);
    }
  }

  loadSid(sidToLoad) {
    axios.get(`/api/${sidToLoad}`)
      .then(({ data }) => {
        const notes = JSON.parse(data.seq);
        this.setState({ notes });
      })
      .catch((err) => {
        console.warn(err);
      });
  }

  getTickFromCoord(coord) {
    if (!coord) {
      return [null, null, null];
    }
    const { ticksPerBeat, pxPerBeat, resolution } = this.state;
    const beat = Math.floor(coord / (pxPerBeat * resolution)) * resolution;
    const roundedCoord = beat * pxPerBeat;
    const tick = beat * ticksPerBeat;
    return [ beat, roundedCoord, tick ];
  }

  exportSequence() {
    const { notes } = this.state;
    for (let channel in notes) {
      if (Object.keys(notes[channel]).length === 0) {
        delete notes[channel];
      }
      for (let tick in notes[channel]) {
        if (Object.keys(notes[channel][tick]).length === 0) {
          delete notes[channel][tick];
        }
      }
    }
    const seq = JSON.stringify(notes);
    const author = prompt('Your name:');
    const title = prompt('Sequence name:');
    const postData = {
      seq,
      author,
      title,
    };
    axios.post('/create', postData)
      .then(({ data }) => {
        console.log(`Sequence saved with ID ${data}`);
      });
  }

  placeNote(note, keyname, coord, noteLen=null, noteVel=null) {
    if (!noteLen) midi.playNote(0, note, 250, 127);
    const { channel, notes, selNoteLen } = this.state;
    const [ beat, roundedCoord, tick ] = this.getTickFromCoord(coord);
    if (!notes[channel]) notes[channel] = {};
    if (!notes[channel][tick]) notes[channel][tick] = {};
    notes[channel][tick][note] = [noteLen || selNoteLen, noteVel || 127];
    this.setState({ notes });
    return tick;
  }

  removeNote(note, keyname, coord) {
    const { channel, notes } = this.state;
    const [ beat, roundedCoord, tick ] = this.getTickFromCoord(coord);
    if (notes[channel][tick][note]) {
      delete notes[channel][tick][note];
    }
    this.setState({ notes });
  }

  toggleSelection(note, coord) {
    const { selected } = this.state;
    const [ beat, roundedCoord, tick ] = this.getTickFromCoord(coord);
    if (selected[`${CHANNEL}-${tick}-${note}`]) {
      delete selected[`${CHANNEL}-${tick}-${note}`];
    } else {
      selected[`${CHANNEL}-${tick}-${note}`] = [CHANNEL, tick, note];
    }
    this.setState({ selected });
  }

  setSelection(note=null, coord=null) {
    let { selected } = this.state;
    const [ beat, roundedCoord, tick ] = this.getTickFromCoord(coord);
    selected = {};
    if (note !== null && coord !== null) selected[`${CHANNEL}-${tick}-${note}`] = [CHANNEL, tick, note];
    this.setState({ selected });
  }

  setNotes(notes, selected=null) {
    if (!selected) selected = this.state.selected;
    this.setState({ notes, selected });
  }

  tempoChange({ target }) {
    this.setState({ tempo: target.value });
  }

  noteLenChange({ target }) {
    this.setState({ selNoteLen: target.value });
  }

  generateNoteLengths() {
    const { resolution, selNoteLen } = this.state;
    let denoms = [];
    for (let denom = 1; 1/denom >= resolution / 4; denom *= 2) {
      denoms.push(denom);
    }
    const notes = <optgroup label="Notes">{denoms.map((denom, i) => (
      <option key={i} value={1/denom}>{1}/{denom}</option>
    ))}</optgroup>;
    const dottedNotes = <optgroup label="Dotted Notes">{denoms.map((denom, i) => (
      <option key={i} value={3/denom}>{3}/{denom}</option>
    ))}</optgroup>;
    const selectMenu = <select id="lengths" value={selNoteLen} onChange={this.noteLenChange}>
      {notes}
      {dottedNotes}
    </select>;
    return selectMenu;
  }

  render() {
    const { midiLoaded, keys, notes, pxPerBeat, ticksPerBeat, tempo, selNoteLen, selected } = this.state;
    const noteLenOptions = this.generateNoteLengths();
    if (midiLoaded) {
      return (
        <>
          <div>
            <h1 onClick={() => { // FIX ME
              location.href = '/';
            }}>Simple Sequencer</h1>
            <button onClick={midi.panicAll}>MIDI Panic</button>
            <button onClick={() => { // FIX ME
              location.href = '/browse';
            }}>Browse</button>
            <button onClick={this.exportSequence}>Export</button>
            <Playback
              notes={notes}
              tempo={tempo}
              ticksPerBeat={ticksPerBeat}
            />
            <label>Tempo: </label>
            <input type='number' value={tempo} onChange={this.tempoChange}></input>

            <label> Note length: </label>
            {noteLenOptions}
          </div>
          <div className='player'>
            <Keyboard midi={midi} keys={keys} />
            <PlayerGrid
              midi={midi}
              keys={keys}
              notes={notes}
              placeNote={this.placeNote}
              removeNote={this.removeNote}
              toggleSelection={this.toggleSelection}
              setSelection={this.setSelection}
              setNotes={this.setNotes}
              pxPerBeat={pxPerBeat}
              selected={selected}
            />
          </div>
          <div>
            {/* <p>Footer</p> */}
          </div>
        </>
      );
    } else {
      return (
        null
      );
    }
  }
}

export default App;