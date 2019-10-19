/**
 * @fileOverview Dot
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { PresentationAttributesWithProps, adaptEventHandlers } from '../util/types';

interface DotProps {
  className?: string;
  cx?: number;
  cy?: number;
  r?: number;
}

type Props = PresentationAttributesWithProps<DotProps, SVGCircleElement> & DotProps;

class Dot extends PureComponent<Props> {
  render() {
    const { cx, cy, r, className, ...rest } = this.props;
    const layerClass = classNames('recharts-dot', className);

    if (cx === +cx && cy === +cy && r === +r) {
      return (
        <circle
          {...rest}
          {...adaptEventHandlers(this.props)}
          className={layerClass}
          cx={cx}
          cy={cy}
          r={r}
        />
      );
    }

    return null;
  }
}

export default Dot;
