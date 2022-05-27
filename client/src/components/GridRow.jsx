import React from 'react';

const CHANNEL = 0;

class GridRow extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.state = {
      pressed: false
    };
  }

  handleClick(e) {
    const { note, keyname, placeNote, removeNote, toggleSelection, setSelection, selected } = this.props;
    console.log('click', e.nativeEvent.offsetX, parseInt(e.nativeEvent.target.style.left));
    if (e.button === 0) {
      if (e.nativeEvent.target.classList[0] === 'gridRow') {
        // setSelection();
        placeNote(note, keyname, e.nativeEvent.offsetX);
        setSelection(note, e.nativeEvent.offsetX);
      } else if (e.nativeEvent.target.classList[0] === 'note') {
        if (e.shiftKey) {
          toggleSelection(note, parseInt(e.nativeEvent.target.style.left));
        } else {
          if (!selected[`${CHANNEL}-${parseInt(e.nativeEvent.target.style.left)}-${note}`]) {
            setSelection(note, parseInt(e.nativeEvent.target.style.left));
          }
        }
      }
    } else if (e.button === 2) {
      const { note, keyname, placeNote, removeNote, setSelection } = this.props;
      if (e.nativeEvent.target.classList[0] === 'gridRow') {
        setSelection();
      } else if (e.nativeEvent.target.classList[0] === 'note') {
        removeNote(note, keyname, parseInt(e.nativeEvent.target.style.left));
      }
    }
  }

  handleContextMenu(e) {
    e.preventDefault();
  }

  handleKeyPress({ code }) {
    const { notes, selected, setSelection, setNotes } = this.props;
    if (code === 'Delete') {
      for (let noteId in selected) {
        const [ channel, tick, note ] = selected[noteId];
        delete notes[channel][tick][note];
        setNotes(notes);
        setSelection();
      }
    }
  }

  render() {
    const { pressed } = this.state;
    const { keyname, noteRows, pxPerBeat, note, selected } = this.props;
    return (
      <div
        id={`gridRow${note}`}
        className={`
          gridRow
          unselectable
        `}
        tabIndex={-1}
        onKeyDown={this.handleKeyPress}
        onMouseDown={ this.handleClick }
        onContextMenu={ this.handleContextMenu }
      >
        {noteRows.map((noteData, i) => (
          <div
            key={i}
            className={`note draggable ${
              selected[`${noteData[2]}-${noteData[0]}-${note}`] ? 'selectedNote' : ''
            }`}
            style={{
              left: `${noteData[0]}px`,
              width: `${(noteData[1][0] * 4) * pxPerBeat}px`,
            }}
            // onKeyPress={ this.handleKeyPress }
            // onMouseOver={ console.log }
          >
            {keyname}
          </div>
        ))}
      </div>
    );
  }
}

export default GridRow;