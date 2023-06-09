import React from 'react';
import { pageData } from '../../data';
import { Radar, RadarChart, ResponsiveContainer } from '../../../../src';
import { CategoricalChartProps } from '../props/ChartProps';

export default {
  argTypes: {
    ...CategoricalChartProps,
  },
  component: RadarChart,
};

export const Simple = {
  render: (args: Record<string, any>) => {
    const { data } = args;
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <Radar dataKey="uv" />
        </RadarChart>
      </ResponsiveContainer>
    );
  },
  args: {
    data: pageData,
  },
};
