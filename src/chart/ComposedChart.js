/**
 * @fileOverview Composed Chart
 */
import React, { PropTypes, Component } from 'react';
import Layer from '../container/Layer';
import Tooltip from '../component/Tooltip';
import Line from '../cartesian/Line';
import Bar from '../cartesian/Bar';
import Area from '../cartesian/Area';
import Rectangle from '../shape/Rectangle';
import generateCategoricalChart from './generateCategoricalChart';
import { getBandSizeOfScale, getAnyElementOfObject } from '../util/DataUtils';
import { getPresentationAttributes, findChildByType } from '../util/ReactUtils';
import pureRender from '../util/PureRender';
import { AreaChart } from './AreaChart';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import composedDataDecorator from '../util/ComposedDataDecorator';


@pureRender
@composedDataDecorator({})
class ComposedChart extends Component {

  static displayName = 'ComposedChart';

  static propTypes = {
    composedData: PropTypes.array,
    layout: PropTypes.oneOf(['horizontal', 'vertical']),
    dataStartIndex: PropTypes.number,
    dataEndIndex: PropTypes.number,
    isTooltipActive: PropTypes.bool,
    activeTooltipIndex: PropTypes.number,
    xAxisMap: PropTypes.object,
    yAxisMap: PropTypes.object,
    offset: PropTypes.object,
    graphicalItems: PropTypes.array,
    stackGroups: PropTypes.object,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  renderCursor({ xAxisMap, yAxisMap, offset, composedData }) {
    const { children, isTooltipActive, layout, activeTooltipIndex } = this.props;
    const tooltipItem = findChildByType(children, Tooltip);
    if (!tooltipItem || !tooltipItem.props.cursor || !isTooltipActive ||
      activeTooltipIndex < 0) { return null; }

    const axisMap = layout === 'horizontal' ? xAxisMap : yAxisMap;
    const axis = getAnyElementOfObject(axisMap);
    const ticks = composedData.axisTicks;

    if (!ticks || !ticks[activeTooltipIndex]) { return null; }

    const bandSize = getBandSizeOfScale(axis.scale);
    const start = ticks[activeTooltipIndex].coordinate;
    const cursorProps = {
      fill: '#f1f1f1',
      ...getPresentationAttributes(tooltipItem.props.cursor),
      x: layout === 'horizontal' ? start : offset.left + 0.5,
      y: layout === 'horizontal' ? offset.top + 0.5 : start,
      width: layout === 'horizontal' ? bandSize : offset.width - 1,
      height: layout === 'horizontal' ? offset.height - 1 : bandSize,
    };

    return React.isValidElement(tooltipItem.props.cursor) ?
      React.cloneElement(tooltipItem.props.cursor, cursorProps) :
      React.createElement(Rectangle, cursorProps);
  }

  render() {
    const { xAxisMap, yAxisMap, offset, graphicalItems, composedData } = this.props;
    const areaItems = graphicalItems.filter(item => item.type.displayName === 'Area');
    const lineItems = graphicalItems.filter(item => item.type.displayName === 'Line');
    const barItems = graphicalItems.filter(item => item.type.displayName === 'Bar');

    return (
      <Layer className="recharts-composed">
        {this.renderCursor({ xAxisMap, yAxisMap, offset, composedData })}

        <AreaChart {...this.props} graphicalItems={areaItems} isComposed />
        <BarChart {...this.props} graphicalItems={barItems} isComposed />
        <LineChart {...this.props} graphicalItems={lineItems} isComposed />
      </Layer>
    );
  }
}

export default generateCategoricalChart(ComposedChart, [Line, Area, Bar]);
