import { Tile } from '@carbon/react';
import { DonutChart, StackedBarChart } from '@carbon/charts-react';
import { Checkmark, WarningAlt, ErrorFilled, Subtract } from '@carbon/icons-react';
import { analyticsData } from '../data/sampleData';
import './AnalyticsDashboard.scss';

const AnalyticsDashboard = () => {
  const donutData = [
    { group: 'Complete', value: 38 },
    { group: 'In Progress', value: 26 },
    { group: 'At Risk', value: 26 },
    { group: 'N/A', value: 11 }
  ];

  const donutOptions = {
    title: '',
    resizable: true,
    donut: {
      center: {
        label: 'Status'
      },
      alignment: 'center'
    },
    height: '400px',
    color: {
      scale: {
        'Complete': '#24a148',
        'In Progress': '#f1c21b',
        'At Risk': '#da1e28',
        'N/A': '#a8a8a8'
      }
    },
    legend: {
      alignment: 'center',
      position: 'bottom'
    }
  };

  const barData = [
    { group: 'Q1 2026', key: 'Complete', value: 70 },
    { group: 'Q1 2026', key: 'In Progress', value: 30 },
    { group: 'Q1 2026', key: 'At Risk', value: 20 },
    { group: 'Q1 2026', key: 'N/A', value: 10 },
    { group: 'Q2 2026', key: 'Complete', value: 110 },
    { group: 'Q2 2026', key: 'In Progress', value: 80 },
    { group: 'Q2 2026', key: 'At Risk', value: 75 },
    { group: 'Q2 2026', key: 'N/A', value: 35 }
  ];

  const barOptions = {
    title: 'Portfolio Performance',
    axes: {
      left: {
        mapsTo: 'value',
        stacked: true
      },
      bottom: {
        mapsTo: 'group',
        scaleType: 'labels'
      }
    },
    height: '400px',
    color: {
      scale: {
        'Complete': '#24a148',
        'In Progress': '#f1c21b',
        'At Risk': '#da1e28',
        'N/A': '#a8a8a8'
      }
    },
    legend: {
      alignment: 'center'
    }
  };

  return (
    <div className="analytics-dashboard">
      <div className="metrics-grid">
        <Tile className="metric-card">
          <div className="metric-icon total">
            <Checkmark size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Total Products</div>
            <div className="metric-value">{analyticsData.totalProducts}</div>
          </div>
        </Tile>

        <Tile className="metric-card">
          <div className="metric-icon complete">
            <Checkmark size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">Complete</div>
            <div className="metric-value">{analyticsData.complete}</div>
            <div className="metric-subtitle">{analyticsData.complete} / {analyticsData.completeTotal}</div>
          </div>
        </Tile>

        <Tile className="metric-card">
          <div className="metric-icon progress">
            <WarningAlt size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">In Progress</div>
            <div className="metric-value">{analyticsData.inProgress}</div>
            <div className="metric-subtitle">{analyticsData.inProgress} / {analyticsData.inProgressTotal}</div>
          </div>
        </Tile>

        <Tile className="metric-card">
          <div className="metric-icon risk">
            <ErrorFilled size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">At Risk</div>
            <div className="metric-value">{analyticsData.atRisk}</div>
            <div className="metric-subtitle">{analyticsData.atRisk} / {analyticsData.atRiskTotal}</div>
          </div>
        </Tile>

        <Tile className="metric-card">
          <div className="metric-icon na">
            <Subtract size={24} />
          </div>
          <div className="metric-content">
            <div className="metric-label">N/A</div>
            <div className="metric-value">{analyticsData.na}</div>
            <div className="metric-subtitle">{analyticsData.na} / {analyticsData.naTotal}</div>
          </div>
        </Tile>
      </div>

      <div className="charts-section">
        <Tile className="chart-container">
          <StackedBarChart data={barData} options={barOptions} />
        </Tile>

        <Tile className="chart-container">
          <h3 className="chart-title">Overall Status Distribution</h3>
          <DonutChart data={donutData} options={donutOptions} />
        </Tile>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

// Made with Bob
