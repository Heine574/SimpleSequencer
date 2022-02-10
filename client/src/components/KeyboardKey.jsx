import React from 'react';

class KeyboardKey extends React.Component {
  constructor(props) {
    super(props);
    this.noteDown = this.noteDown.bind(this);
    this.noteUp = this.noteUp.bind(this);
    this.state = {
      pressed: false
    };
  }

  noteDown(e) {
    const { keyname, note, midi, mouseDown } = this.props;
    if (mouseDown || e.type === 'mousedown') {
      midi.noteOn(0, note, 127);
      this.setState({ pressed: true });
    }
  }

  noteUp() {
    const { keyname, note, midi, mouseDown } = this.props;
    midi.noteOff(0, note);
    this.setState({ pressed: false });
  }

  render() {
    const { pressed } = this.state;
    const { keyname, note } = this.props;
    return (
      <div
      id={`key${note}`}
        className={`
          keyboardKey
          unselectable
          ${pressed ? 'pressed' : ''}
          ${keyname.search('#') > -1 ? 'black' : ''}
        `}
        onMouseEnter={ this.noteDown }
        onMouseDown={ this.noteDown }
        onMouseOut={ this.noteUp }
        onMouseUp={ this.noteUp }
      >
        {keyname}
      </div>
    );
  }
}

export default KeyboardKey;