import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Plus, Minus, Users } from 'lucide-react';
import { detectChanges, getPreviousSnapshot, saveSnapshot } from '../utils/changeDetector';

export default function ChangesView({ currentData }) {
  const [changes, setChanges] = useState([]);
  const [previousDate, setPreviousDate] = useState(null);
  const [filter, setFilter] = useState('all'); // all, improvements, regressions, changes

  useEffect(() => {
    if (!currentData || currentData.length === 0) return;

    // Save current snapshot
    saveSnapshot(currentData);

    // Get previous snapshot and detect changes
    const previous = getPreviousSnapshot();
    if (previous) {
      const detectedChanges = detectChanges(currentData, previous.data);
      setChanges(detectedChanges);
      setPreviousDate(new Date(previous.date).toLocaleDateString());
    }
  }, [currentData]);

  const filteredChanges = changes.filter((change) => {
    if (filter === 'all') return true;
    if (filter === 'improvements') return change.type === 'improvement';
    if (filter === 'regressions') return change.type === 'regression';
    if (filter === 'changes') return change.type === 'change' || change.type === 'new' || change.type === 'removed';
    return true;
  });

  const stats = {
    improvements: changes.filter((c) => c.type === 'improvement').length,
    regressions: changes.filter((c) => c.type === 'regression').length,
    changes: changes.filter((c) => c.type === 'change' || c.type === 'new' || c.type === 'removed').length,
  };

  if (changes.length === 0) {
    return (
      <div className="changes-view">
        <div className="changes-header">
          <h2>📊 Change Tracker</h2>
          <p>No previous data to compare. Changes will appear after the next update.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="changes-view">
      <div className="changes-header">
        <h2>📊 Change Tracker</h2>
        {previousDate && <p className="changes-subtitle">Comparing with snapshot from {previousDate}</p>}
      </div>

      <div className="changes-stats">
        <div className="stat-card improvement">
          <TrendingUp size={24} />
          <div>
            <div className="stat-number">{stats.improvements}</div>
            <div className="stat-label">Improvements</div>
          </div>
        </div>
        <div className="stat-card regression">
          <TrendingDown size={24} />
          <div>
            <div className="stat-number">{stats.regressions}</div>
            <div className="stat-label">Regressions</div>
          </div>
        </div>
        <div className="stat-card change">
          <AlertCircle size={24} />
          <div>
            <div className="stat-number">{stats.changes}</div>
            <div className="stat-label">Other Changes</div>
          </div>
        </div>
      </div>

      <div className="changes-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All ({changes.length})
        </button>
        <button
          className={filter === 'improvements' ? 'active' : ''}
          onClick={() => setFilter('improvements')}
        >
          Improvements ({stats.improvements})
        </button>
        <button
          className={filter === 'regressions' ? 'active' : ''}
          onClick={() => setFilter('regressions')}
        >
          Regressions ({stats.regressions})
        </button>
        <button
          className={filter === 'changes' ? 'active' : ''}
          onClick={() => setFilter('changes')}
        >
          Other ({stats.changes})
        </button>
      </div>

      <div className="changes-list">
        {filteredChanges.map((change, index) => (
          <div key={index} className={`change-item ${change.type}`}>
            <div className="change-icon">
              {change.type === 'improvement' && <TrendingUp size={20} />}
              {change.type === 'regression' && <TrendingDown size={20} />}
              {change.type === 'new' && <Plus size={20} />}
              {change.type === 'removed' && <Minus size={20} />}
              {change.type === 'change' && <AlertCircle size={20} />}
            </div>
            <div className="change-content">
              <div className="change-product">
                <span className="portfolio-badge">{change.portfolio}</span>
                <strong>{change.product}</strong>
              </div>
              <div className="change-message">{change.message}</div>
              {change.category && (
                <div className="change-category">
                  <span className="category-label">{change.category}</span>
                  {change.from && change.to && (
                    <span className="change-values">
                      <span className="from-value">{change.from}</span>
                      <span className="arrow">→</span>
                      <span className="to-value">{change.to}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Made with Bob
