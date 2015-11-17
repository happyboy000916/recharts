import React, {PropTypes} from 'react';

const PieItem = React.createClass({
  propTypes: {
    cx: PropTypes.number,
    cy: PropTypes.number,
    innerRadius: PropTypes.number,
    outerRadius: PropTypes.number,
    type: PropTypes.string,
    fill: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
    strokeDasharray: PropTypes.string,
    className: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.any,
      value: PropTypes.number
    })),
    yAxisId: PropTypes.number,
    xAxisId: PropTypes.number,
    legendType: PropTypes.string,
    isActive: PropTypes.bool
  },

  getDefaultProps () {
    return {
      innerRadius: 0,
      stroke: '#fff',
      fill: '#fff',
      legendType: 'line',
      isActive: true
    };
  },

  render () {
    return null;
  }
});

export default PieItem;
