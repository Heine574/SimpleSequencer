import React from 'react';
import KeyboardKey from './KeyboardKey.jsx';

class Keyboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseDown: false,
    };
  }

  componentDidMount() {
  }

  render() {
    const { mouseDown } = this.state;
    const { keys } = this.props;
    return (
      <div
        className='keyboard'
        onMouseDown={ () => this.setState({ mouseDown: true }) }
        onMouseUp={ () => this.setState({ mouseDown: false }) }
      >
        {keys.map(([ keyname, note ], i) => (
          <KeyboardKey keyname={keyname} key={i} note={note} midi={this.props.midi} mouseDown={mouseDown}/>
        ))}
      </div>
    );
  }
}

export default Keyboard;