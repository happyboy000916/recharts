/**
 * @fileOverview Render a group of radial bar
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Animate from 'react-smooth';
import _ from 'lodash';
import Sector from '../shape/Sector';
import Layer from '../container/Layer';
import { getStringSize } from '../util/DOMUtils';
import { PRESENTATION_ATTRIBUTES, LEGEND_TYPES, findAllByType,
  getPresentationAttributes, filterEventsOfChild, isSsr } from '../util/ReactUtils';
import pureRender from '../util/PureRender';
import { polarToCartesian } from '../util/PolarUtils';
import { mathSign } from '../util/DataUtils';
import LabelList from '../component/LabelList';
import Cell from '../component/Cell';
import { getCateCoordinateOfBar, findPositionOfBar, getBaseValueOfBar,
  truncateByDomain, getValueByDataKey } from '../util/DataUtils';

const RADIAN = Math.PI / 180;

@pureRender
class RadialBar extends Component {

  static displayName = 'RadialBar';

  static propTypes = {
    ...PRESENTATION_ATTRIBUTES,
    className: PropTypes.string,
    angleAxisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    radiusAxisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shape: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
    activeShape: PropTypes.oneOfType([
      PropTypes.object, PropTypes.func, PropTypes.element,
    ]),
    activeIndex: PropTypes.number,
    dataKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.func]).isRequired,

    cornerRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    minPointSize: PropTypes.number,
    maxBarSize: PropTypes.number,
    data: PropTypes.arrayOf(PropTypes.shape({
      cx: PropTypes.number,
      cy: PropTypes.number,
      innerRadius: PropTypes.number,
      outerRadius: PropTypes.number,
      value: PropTypes.value,
    })),
    legendType: PropTypes.oneOf(LEGEND_TYPES),
    label: PropTypes.oneOfType([
      PropTypes.bool, PropTypes.func, PropTypes.element, PropTypes.object,
    ]),
    background: PropTypes.oneOfType([
      PropTypes.bool, PropTypes.func, PropTypes.object, PropTypes.element,
    ]),
    hide: PropTypes.bool,

    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onClick: PropTypes.func,

    isAnimationActive: PropTypes.bool,
    animationBegin: PropTypes.number,
    animationDuration: PropTypes.number,
    animationEasing: PropTypes.oneOf([
      'ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'spring',
    ]),
  };

  static defaultProps = {
    angleAxisId: 0,
    radiusAxisId: 0,
    minPointSize: 0,
    hide: false,
    legendType: 'rect',
    data: [],
    isAnimationActive: !isSsr(),
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',
  };

  static getComposedData = ({ item, props, radiusAxis, radiusAxisTicks, angleAxis, angleAxisTicks,
    displayedData, dataKey, stackedData, barPosition, bandSize, dataStartIndex }) => {
    const pos = findPositionOfBar(barPosition, item);
    if (!pos) { return []; }

    const { cx, cy } = angleAxis;
    const { layout } = props;
    const { children, minPointSize } = item.props;
    const numericAxis = layout === 'radial' ? angleAxis : radiusAxis;
    const stackedDomain = stackedData ? numericAxis.scale.domain() : null;
    const baseValue = getBaseValueOfBar({ props, numericAxis });
    const cells = findAllByType(children, Cell);
    const sectors = displayedData.map((entry, index) => {
      let value, innerRadius, outerRadius, startAngle, endAngle, backgroundSector;

      if (stackedData) {
        value = truncateByDomain(stackedData[dataStartIndex + index], stackedDomain);
      } else {
        value = getValueByDataKey(entry, dataKey);
        if (!_.isArray(value)) { value = [baseValue, value]; }
      }

      if (layout === 'radial') {
        innerRadius = getCateCoordinateOfBar({
          axis: radiusAxis,
          ticks: radiusAxisTicks,
          bandSize,
          offset: pos.offset,
          entry,
          index,
        });
        endAngle = angleAxis.scale(value[1]);
        startAngle = angleAxis.scale(value[0]);
        outerRadius = innerRadius + pos.size;
        const deltaAngle = endAngle - startAngle;

        if (Math.abs(minPointSize) > 0 && Math.abs(deltaAngle) < Math.abs(minPointSize)) {
          const delta = Math.sign(deltaAngle || minPointSize) *
            (Math.abs(minPointSize) - Math.abs(deltaAngle));

          endAngle += delta;
        }
        backgroundSector = {
          background: {
            cx, cy, innerRadius, outerRadius, startAngle: props.startAngle, endAngle: props.endAngle,
          },
        };
      } else {
        innerRadius = radiusAxis.scale(value[0]);
        outerRadius = xAxis.scale(value[1]);
        startAngle = getCateCoordinateOfBar({
          axis: yAxis,
          ticks: yAxisTicks,
          bandSize,
          offset: pos.offset,
          entry,
          index,
        });
        endAngle = startAngle + pos.size;
        const deltaRadius = outerRadius - innerRadius;

        if (Math.abs(minPointSize) > 0 && Math.abs(deltaRadius) < Math.abs(minPointSize)) {
          const delta = Math.sign(deltaRadius || minPointSize) *
            (Math.abs(minPointSize) - Math.abs(deltaRadius));
          outerRadius += delta;
        }
      }

      return {
        ...entry,
        ...backgroundSector,
        payload: entry,
        value: stackedData ? value : value[1],
        cx, cy, innerRadius, outerRadius, startAngle, endAngle,
        ...(cells && cells[index] && cells[index].props),
      };
    });

    return { data: sectors, layout };
  };

  state = {
    isAnimationFinished: false,
  };

  getDeltaAngle() {
    const { startAngle, endAngle } = this.props;
    const sign = mathSign(endAngle - startAngle);
    const deltaAngle = Math.min(Math.abs(endAngle - startAngle), 360);

    return sign * deltaAngle;
  }

  handleAnimationEnd = () => {
    this.setState({ isAnimationFinished: true });
  };

  handleAnimationStart = () => {
    this.setState({ isAnimationFinished: false });
  };

  renderSectorShape(shape, props) {
    let sectorShape;

    if (React.isValidElement(shape)) {
      sectorShape = React.cloneElement(shape, props);
    } else if (_.isFunction(shape)) {
      sectorShape = shape(props);
    } else {
      sectorShape = React.createElement(Sector, props);
    }

    return sectorShape;
  }

  renderSectors(sectors) {
    const { cx, cy, shape, activeShape, activeIndex, cornerRadius, ...others } = this.props;
    const {
      animationEasing,
      animationDuration,
      animationBegin,
      isAnimationActive,
    } = this.props;
    const baseProps = getPresentationAttributes(others);

    return sectors.map((entry, i) => {
      const { startAngle, endAngle } = entry;

      return (
        <Animate
          from={{ angle: startAngle }}
          to={{ angle: endAngle }}
          begin={animationBegin}
          isActive={isAnimationActive}
          duration={animationDuration}
          easing={animationEasing}
          shouldReAnimate
          key={`aniamte-${i}`}
          onAnimationStart={this.handleAnimationStart}
          onAnimationEnd={this.handleAnimationEnd}
        >
          {
          ({ angle }) => {
            const props = {
              ...baseProps,
              cornerRadius,
              ...entry,
              ...filterEventsOfChild(this.props, entry, i),
              endAngle: angle,
              key: `sector-${i}`,
              className: 'recharts-radial-bar-sector',
            };

            return this.renderSectorShape(i === activeIndex ? activeShape : shape, props);
          }
        }
        </Animate>
      );
    });
  }

  renderBackground(sectors) {
    const { cornerRadius } = this.props;
    const backgroundProps = getPresentationAttributes(this.props.background);

    return sectors.map((entry, i) => {
      // eslint-disable-next-line no-unused-vars
      const { value, background, ...rest } = entry;

      if (!background) { return null; }

      const props = {
        cornerRadius,
        ...rest,
        fill: '#eee',
        ...background,
        ...filterEventsOfChild(this.props, entry, i),
        index: i,
        key: `sector-${i}`,
        className: 'recharts-radial-bar-background-sector',
      };

      return this.renderSectorShape(background, props);
    });
  }

  render() {
    const { hide, data, className, background, isAnimationActive } = this.props;

    if (hide || !data || !data.length) { return null; }

    const { isAnimationFinished } = this.state;
    const layerClass = classNames('recharts-area', className);

    return (
      <Layer className={layerClass}>
        {
          background && (
            <Layer className="recharts-radial-bar-background">
              {this.renderBackground(data)}
            </Layer>
          )
        }

        <Layer className="recharts-radial-bar-sectors">
          {this.renderSectors(data)}
        </Layer>

        {(!isAnimationActive || isAnimationFinished) &&
          LabelList.renderCallByParent({
            ...this.props,
            clockWise: this.getDeltaAngle() < 0,
          }, data)
        }
      </Layer>
    );
  }
}

export default RadialBar;
