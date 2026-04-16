import { Tile } from '@carbon/react';
import { categoryData } from '../data/sampleData';
import './ProductScorecard.scss';

const ProductScorecard = () => {
  const renderProgressBar = (category) => {
    const greenPercent = (category.green / category.total) * 100;
    const amberPercent = (category.amber / category.total) * 100;
    const redPercent = (category.red / category.total) * 100;
    const grayPercent = (category.gray / category.total) * 100;

    return (
      <div className="progress-bar">
        <div className="progress-segment green" style={{ width: `${greenPercent}%` }}></div>
        <div className="progress-segment amber" style={{ width: `${amberPercent}%` }}></div>
        <div className="progress-segment red" style={{ width: `${redPercent}%` }}></div>
        <div className="progress-segment gray" style={{ width: `${grayPercent}%` }}></div>
      </div>
    );
  };

  return (
    <div className="product-scorecard">
      <div className="scorecard-grid">
        {categoryData.map((category) => (
          <Tile key={category.id} className="category-card">
            <div className="card-header">
              <h3 className="category-name">{category.name}</h3>
              <div className="category-percentage">{category.percentage}%</div>
            </div>
            {renderProgressBar(category)}
            <div className="card-stats">
              <div className="stat-item">
                <span className="stat-indicator green"></span>
                <span className="stat-value">{category.green}</span>
              </div>
              <div className="stat-item">
                <span className="stat-indicator amber"></span>
                <span className="stat-value">{category.amber}</span>
              </div>
              <div className="stat-item">
                <span className="stat-indicator red"></span>
                <span className="stat-value">{category.red}</span>
              </div>
              <div className="stat-item">
                <span className="stat-indicator gray"></span>
                <span className="stat-value">{category.gray}</span>
              </div>
            </div>
            <div className="card-footer">
              <span>Total: {category.total} items</span>
              <span>{category.gray} N/A</span>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default ProductScorecard;

// Made with Bob
