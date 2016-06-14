import React, { PropTypes, Component } from 'react';
import { Rectangle, Layer } from 'recharts';

function DemoSankeyNode({ x, y, width, height, index, node, containerWidth}) {
  const isOut = x + width + 6 > containerWidth;
  return (
    <Layer>
      <Rectangle
        x={x} y={y} width={width} height={height}
        fill="#5192ca" fillOpacity="1"
      />
      <text
        textAnchor={isOut ? 'end' : 'start'}
        x={isOut ? x - 6 : x + width + 6}
        y={y + height / 2}
        fontSize="14"
        stroke="#333"
      >{node.name}</text>
      <text
        textAnchor={isOut ? 'end' : 'start'}
        x={isOut ? x - 6 : x + width + 6}
        y={y + height / 2 + 13}
        fontSize="12"
        stroke="#333"
        strokeOpacity="0.5"
      >{node.value + 'k'}</text>
    </Layer>
  );
}

export default DemoSankeyNode;
