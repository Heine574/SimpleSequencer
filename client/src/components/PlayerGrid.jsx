import React from 'react';
import GridRow from './GridRow.jsx';

class PlayerGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseDown: false,
    };
    this.handleDrag = this.handleDrag.bind(this);
  }

  componentDidMount() {
  }

  createNoteRows() {
    const { keys, notes } = this.props;
    const noteRows = {};
    for (let [ keyname, note ] of keys) {
      noteRows[note] = [];
    }
    for (let channel in notes) {
      for (let tick in notes[channel]) {
        for (let note in notes[channel][tick]) {
          noteRows[note].push([tick, notes[channel][tick][note], channel]);
        }
      }
    }
    return noteRows;
  }

  moveNote(noteId, x, y=0) {
    const { placeNote, setSelection, setNotes, selected, notes } = this.props;
    const [ channel, oldTick, oldNote ] = selected[noteId];
    const [ coord, note ] = [ oldTick + x, oldNote + y ];
    console.log(coord, oldTick);
    // if (!notes[channel][tick]) notes[channel][tick] = {};
    // notes[channel][tick][note] = notes[channel][oldTick][oldNote];
    const tick = placeNote(note, null, coord, ...notes[channel][oldTick][oldNote]);
    if (tick !== oldTick) {
      delete notes[channel][oldTick][oldNote];
      if (Object.keys(notes[channel][oldTick]).length === 0) delete notes[channel][oldTick];
      selected[`${channel}-${tick}-${note}`] = [channel, tick, note];
      delete selected[noteId];
    }
  }

  handleDrag({ nativeEvent }) {
    const { mouseDown } = this.state;
    const { selected } = this.props;
    if (mouseDown) {
      console.log(nativeEvent.movementX);
      for (let noteId in selected) {
        this.moveNote(noteId, nativeEvent.movementX);
      }
    }
  }

  render() {
    const { mouseDown } = this.state;
    const { keys, placeNote, removeNote, pxPerBeat, toggleSelection, setSelection, setNotes, selected, notes } = this.props;
    const noteRows = this.createNoteRows();
    return (
      <div
        className='playerGrid'
        onMouseDown={ () => this.setState({ mouseDown: true }) }
        onMouseUp={ () => this.setState({ mouseDown: false }) }
        onMouseMove={this.handleDrag}
      >
        {keys.map(([ keyname, note ], i) => (
          <GridRow
            keyname={keyname}
            key={i}
            note={note}
            notes={notes}
            noteRows={noteRows[note]}
            midi={this.props.midi}
            mouseDown={mouseDown}
            placeNote={placeNote}
            removeNote={removeNote}
            toggleSelection={toggleSelection}
            setSelection={setSelection}
            setNotes={setNotes}
            pxPerBeat={pxPerBeat}
            selected={selected}
          />
        ))}
      </div>
    );
  }
}

export default PlayerGrid;