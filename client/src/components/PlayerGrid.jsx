import React from 'react';
import GridRow from './GridRow.jsx';

class PlayerGrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseDown: false,
      dragX: null,
    };
    this.handleDrag = this.handleDrag.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
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
    const { placeNote, selected, notes } = this.props;
    const [ channel, oldTick, oldNote, originalTick, originalNote ] = selected[noteId];
    const [ coord, note ] = [ originalTick + x, originalNote + y ];
    // if (!notes[channel][tick]) notes[channel][tick] = {};
    // notes[channel][tick][note] = notes[channel][oldTick][oldNote];
    const tick = placeNote(note, null, coord, ...notes[channel][oldTick][oldNote]);
    if (tick !== oldTick) {
      delete notes[channel][oldTick][oldNote];
      if (Object.keys(notes[channel][oldTick]).length === 0) delete notes[channel][oldTick];
      selected[`${channel}-${tick}-${note}`] = [channel, tick, note, originalTick, originalNote];
      delete selected[noteId];
    }
  }

  handleDrag({ nativeEvent }) {
    const { mouseDown, dragX } = this.state;
    const { selected } = this.props;
    if (mouseDown) {
      for (let noteId in selected) {
        let x = 0;
        if (nativeEvent.target.classList[0] === 'gridRow') {
          x = nativeEvent.offsetX;
        } else if (nativeEvent.target.classList[0] === 'note') {
          x = nativeEvent.target.offsetLeft
        }
        this.moveNote(noteId, x - dragX);
      }
    }
  }

  handleMouseDown({ nativeEvent }) {
    this.setState({ mouseDown: true });
    let x;
    if (nativeEvent.target.classList[0] === 'gridRow') {
      x = nativeEvent.offsetX;
    } else if (nativeEvent.target.classList[0] === 'note') {
      x = nativeEvent.target.offsetLeft
    }
    this.setState({ dragX: x });
  }

  handleMouseUp({ nativeEvent }) {
    const { selected } = this.props;
    this.setState({ mouseDown: false });
    for (let noteId in selected) {
      const [ channel, tick, note ] = selected[noteId];
      selected[`${channel}-${tick}-${note}`] = [channel, tick, note, tick, note];
    }
    this.setState({ dragX: null });
  }

  render() {
    const { mouseDown } = this.state;
    const { keys, placeNote, removeNote, pxPerBeat, toggleSelection, setSelection, setNotes, selected, notes } = this.props;
    const noteRows = this.createNoteRows();
    return (
      <div
        className='playerGrid'
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
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