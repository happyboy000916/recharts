import React from 'react';
import { PieChart, Pie, Legend, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { scaleCategory10 } from 'd3-scale';

const colors = scaleCategory10().range();

const data01 = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
  { name: 'Group E', value: 278 },
  { name: 'Group F', value: 189 },
];

const data02 = [
  { name: 'Group A', value: 2400 },
  { name: 'Group B', value: 4567 },
  { name: 'Group C', value: 1398 },
  { name: 'Group D', value: 9800 },
  { name: 'Group E', value: 3908 },
  { name: 'Group F', value: 4800 },
];

const data03 = [
  { name: 'A1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'B2', value: 80 },
  { name: 'B3', value: 40 },
  { name: 'B4', value: 30 },
  { name: 'B5', value: 50 },
  { name: 'C1', value: 100 },
  { name: 'C2', value: 200 },
  { name: 'D1', value: 150 },
  { name: 'D2', value: 50 },
  { name: 'E1', value: 200 },
  { name: 'E2', value: 34 },
  { name: 'E3', value: 44 },
  { name: 'F1', value: 89 },
  { name: 'F2', value: 49 },
  { name: 'F3', value: 51 },
];
const renderLabelContent = (props) => {
  const { value, percent, x, y, midAngle } = props;

  return (
    <g transform={`translate(${x}, ${y})`} textAnchor={ (midAngle < -90 || midAngle >= 90) ? 'end' : 'start'}>
      <text x={0} y={0}>{`评价数 ${value}`}</text>
      <text x={0} y={20}>{`（占比 ${(percent * 100).toFixed(2)}%）`}</text>
    </g>
  );
};
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">评价数</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(占比 ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export default React.createClass({
  getInitialState() {
    return {
      activeIndex: 0,
    };
  },

  onPieEnter(data, index) {
    this.setState({
      activeIndex: index,
    });
  },

  render () {
    return (
      <div className="pie-charts">
        <p>Simple PieChart</p>
        <div className="pie-chart-wrapper">
          <PieChart width={800} height={400}>
            <Legend />
            <Pie cx={200} cy={200} startAngle={180} endAngle={0} outerRadius={80} label>
              {
                data01.map((entry, index) => (
                  <Cell key={`slice-${index}`} name={entry.name} value={entry.value} fill={colors[index % 10]}/>
                ))
              }
            </Pie>
            <Pie cx={600} cy={200} startAngle={180} endAngle={-180} innerRadius={60} outerRadius={80}
              label={renderLabelContent}>
              {
                data02.map((entry, index) => (
                  <Cell key={`slice-${index}`} name={entry.name} value={entry.value} fill={colors[index % 10]}/>
                ))
              }
            </Pie>
          </PieChart>
        </div>


        <p>PieChart with two donut</p>
        <div className="pie-chart-wrapper">
          <PieChart width={400} height={400}>
            <Legend verticalAlign="top"/>
            <Pie data={data01} cx={200} cy={200} innerRadius={50} outerRadius={80}/>
            <Pie data={data03} cx={200} cy={200} innerRadius={80} outerRadius={100}/>
          </PieChart>
        </div>

        <p>PieChart wrapped by ResponsiveContainer</p>
        <div className="pie-chart-wrapper" style={{ width: '50%', height: '100%', backgroundColor: '#f5f5f5' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data01} innerRadius="25%" outerRadius="40%"/>
              <Pie data={data03} innerRadius="45%" outerRadius="80%"/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <p>PieChart wrapped by ResponsiveContainer</p>
        <div className="pie-chart-wrapper" style={{ width: '50%', height: '100%', backgroundColor: '#f5f5f5' }}>
          <ResponsiveContainer>
            <PieChart onMouseEnter={this.onPieEnter}>
              <Pie
                data={data01}
                innerRadius="25%"
                outerRadius="40%"
                activeIndex={this.state.activeIndex}
                activeShape={renderActiveShape}
              >
                {
                  data01.map((entry, index) => (
                    <Cell key={`slice-${index}`} name={entry.name} value={entry.value} fill={colors[index % 10]}/>
                  ))
                }
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
});

