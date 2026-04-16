import { Modal } from '@carbon/react';
import './LegendModal.scss';

const LegendModal = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading="Status Legend"
      passiveModal
      size="sm"
    >
      <div className="legend-content">
        <div className="legend-item">
          <div className="legend-indicator green"></div>
          <div className="legend-text">
            <div className="legend-title">Green</div>
            <div className="legend-description">Completed / YES</div>
          </div>
        </div>
        <div className="legend-item">
          <div className="legend-indicator amber"></div>
          <div className="legend-text">
            <div className="legend-title">Amber</div>
            <div className="legend-description">In Progress / Target Completion Date Added</div>
          </div>
        </div>
        <div className="legend-item">
          <div className="legend-indicator red"></div>
          <div className="legend-text">
            <div className="legend-title">Red</div>
            <div className="legend-description">Not Started or Incomplete / Target Completion Date Unknown / NO</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LegendModal;

// Made with Bob
