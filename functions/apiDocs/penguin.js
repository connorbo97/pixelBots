module.exports = {
  up: {
    usage: 'up()',
    description: 'Move the penguin up one space.'
  },
  left: {
    usage: 'left()',
    description: 'Move the penguin left one space.'
  },
  right: {
    usage: 'right()',
    description: 'Move the penguin right one space.'
  },
  down: {
    usage: 'down()',
    description: 'Move the penguin down one space.'
  },
  paint: {
    usage: 'paint()',
    description: 'Paint the square the penguin is currently on black.'
  },
  repeat: {
    usage: 'repeat(n, function(){\n\t// code to repeat\n})',
    description: 'Repeat the actions inside of the loop.',
    block: true,
    args: [{
      name: 'num',
      type: 'number',
      default: 2,
      description: 'The number of times to repeat the loop.'
    },
    {
      name: 'fn',
      type: 'function',
      description: 'The function to be repeated'
    }]
  },
  block_end: {
    description: 'end of a repeat block',
    hidden: true,
    unselectable: true
  },
  if_color: {
    usage: 'ifColor(color, function(){\n\t// code to execute\n\t// if the color matches\n})',
    description: 'conditional block',
    block: true,
    args: [
      {
        name: 'color',
        type: 'string',
        default: 'white',
        description: 'The color to match'
      }
    ]
  },
}
