import React from 'react';
import midi from '../lib/midi.js';

class Playback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      reset: false,
    };
    this.playTick = this.playTick.bind(this);
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);
  }

  playTick(tick) {
    const { playing, reset } = this.state;
    const { notes, tempo, ticksPerBeat } = this.props;
    for (let channel in notes) {
      if (notes[channel][tick]) {
        for (let note in notes[channel][tick]) {
          const noteLen = (notes[channel][tick][note][0] * 4) / (tempo / 60) * 1000;
          const noteVel = notes[channel][tick][note][1];
          // console.log(channel, note, noteLen, noteVel);
          midi.playNote(parseInt(channel), parseInt(note), noteLen, noteVel);
        }
      }
    }
    if (tick < 10000 && playing) {
      setTimeout(() => this.playTick(tick+1), 1 / ticksPerBeat / (tempo / 60) * 1000);
    }
  }

  play() {
    this.setState({ playing: true });
    setTimeout(() => this.playTick(0), 0);
  }

  stop() {
    this.setState({ playing: false });
  }

  render() {
    const { playing } = this.state;
    return (
      <div className='playback'>
        <button onClick={this.play} disabled={playing}>Play</button>
        <button onClick={this.stop} disabled={!playing}>Stop</button>
      </div>
    );
  }
}

export default Playback;