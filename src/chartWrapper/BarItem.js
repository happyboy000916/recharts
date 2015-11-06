import React, {PropTypes} from 'react/addons';

const BarItem = React.createClass({
  propTypes: {
    barSize: PropTypes.number,
    fill: PropTypes.string,
    stroke: PropTypes.string,
    strokeWidth: PropTypes.number,
    strokeDashArray: PropTypes.string,
    className: PropTypes.string,
    dataKey: PropTypes.string.isRequired,
    yAxisId: PropTypes.number,
    xAxisId: PropTypes.number,
    legendType: PropTypes.string,
    isActive: PropTypes.bool
  },

  getDefaultProps () {
    return {
      fill: '#fff',
      xAxisId: 0,
      yAxisId: 0,
      legendType: 'rect',
      isActive: true
    };
  },

  render () {
    return null;
  }
});

export default BarItem;
