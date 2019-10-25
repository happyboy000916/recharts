/**
 * @fileOverview Reference Line
 */
import React, { ReactElement } from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import Layer from '../container/Layer';
import Label from '../component/Label';
// @ts-ignore
import { LabeledScaleHelper, rectWithPoints } from '../util/CartesianUtils';
// @ts-ignore
import { ifOverflowMatches } from '../util/IfOverflowMatches';
// @ts-ignore
import { isNumOrStr } from '../util/DataUtils';
import { warn } from '../util/LogUtils';
import Rectangle, { Props as RectangleProps } from '../shape/Rectangle';
import { ViewBox, D3Scale, filterProps, adaptEventHandlers } from '../util/types';

import { Props as XAxisProps } from './XAxis';
import { Props as YAxisProps } from './YAxis';

interface InternalReferenceAreaProps {
  viewBox?: ViewBox;
  xAxis?: Omit<XAxisProps, 'scale'> & { scale: D3Scale<string | number> };
  yAxis?: Omit<YAxisProps, 'scale'> & { scale: D3Scale<string | number> };
  clipPathId?: number | string;
}

interface ReferenceAreaProps extends InternalReferenceAreaProps {
  isFront?: boolean;
  alwaysShow?: boolean;
  ifOverflow?: 'hidden' | 'visible' | 'discard' | 'extendDomain';
  x1?: number | string;
  x2?: number | string;
  y1?: number | string;
  y2?: number | string;


  className?: number | string;
  yAxisId?: number | string;
  xAxisId?: number | string;
  shape?: ReactElement<SVGElement> | ((props: any) => SVGElement);
};

type Props = RectangleProps & ReferenceAreaProps;

const getRect = (hasX1: boolean, hasX2: boolean, hasY1: boolean, hasY2: boolean, props: Props) => {
  const { x1: xValue1, x2: xValue2, y1: yValue1, y2: yValue2, xAxis,
    yAxis } = props;

  const scale = LabeledScaleHelper.create({ x: xAxis.scale, y: yAxis.scale });

  const p1 = {
    x: hasX1 ? scale.x.apply(xValue1) : scale.x.rangeMin,
    y: hasY1 ? scale.y.apply(yValue1) : scale.y.rangeMin,
  };

  const p2 = {
    x: hasX2 ? scale.x.apply(xValue2) : scale.x.rangeMax,
    y: hasY2 ? scale.y.apply(yValue2) : scale.y.rangeMax,
  };

  if (ifOverflowMatches(props, 'discard') &&
    (!scale.isInRange(p1) || !scale.isInRange(p2))) {
    return null;
  }

  return rectWithPoints(p1, p2);
}

function ReferenceArea(props: Props) {
  const { x1, x2, y1, y2, className, alwaysShow, clipPathId } = props;

    warn(alwaysShow === undefined,
      'The alwaysShow prop is deprecated. Please use ifOverflow="extendDomain" instead.');

    const hasX1 = isNumOrStr(x1);
    const hasX2 = isNumOrStr(x2);
    const hasY1 = isNumOrStr(y1);
    const hasY2 = isNumOrStr(y2);

    const { shape } = props;

    if (!hasX1 && !hasX2 && !hasY1 && !hasY2 && !shape) { return null; }

    const rect = getRect(hasX1, hasX2, hasY1, hasY2, props);

    if (!rect && !shape) { return null; }


    const clipPath = ifOverflowMatches(props, 'hidden') ?
      `url(#${clipPathId})` :
      undefined;

    return (
      <Layer className={classNames('recharts-reference-area', className)}>
        {ReferenceArea.renderRect(shape, { clipPath, ...filterProps(props), ...adaptEventHandlers(props), ...rect })}
        {Label.renderCallByParent(props, rect)}
      </Layer>
    );
}

ReferenceArea.displayName = 'ReferenceArea';
ReferenceArea.defaultProps = {
  isFront: false,
  ifOverflow: 'discard',
  xAxisId: 0,
  yAxisId: 0,
  r: 10,
  fill: '#ccc',
  fillOpacity: 0.5,
  stroke: 'none',
  strokeWidth: 1,
};

ReferenceArea.renderRect = (option: ReferenceAreaProps['shape'], props: any) => {
  let rect;

  if (React.isValidElement(option)) {
    rect = React.cloneElement(option, props);
  } else if (_.isFunction(option)) {
    rect = option(props);
  } else {
    rect = (
      <Rectangle
        {...props}
        className="recharts-reference-area-rect"
      />
    );
  }

  return rect;
}

export default ReferenceArea;
