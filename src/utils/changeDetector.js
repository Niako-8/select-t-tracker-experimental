/**
 * Change Detection Utility
 * Compares current data with previous snapshots to identify changes
 */

export function detectChanges(currentData, previousData) {
  if (!previousData || !currentData) return [];

  const changes = [];

  currentData.forEach((currentProduct) => {
    const previousProduct = previousData.find(
      (p) => p.product === currentProduct.product && p.portfolio === currentProduct.portfolio
    );

    if (!previousProduct) {
      changes.push({
        product: currentProduct.product,
        portfolio: currentProduct.portfolio,
        type: 'new',
        message: `New product added to ${currentProduct.portfolio}`,
      });
      return;
    }

    // Check each category for changes
    const categories = [
      { name: 'Sales Kit', current: currentProduct.valuable, previous: previousProduct.valuable },
      ...currentProduct.consumable.map((val, idx) => ({
        name: getConsumableColumnName(idx),
        current: val,
        previous: previousProduct.consumable[idx],
      })),
      ...currentProduct.instrumented.map((val, idx) => ({
        name: getInstrumentedColumnName(idx),
        current: val,
        previous: previousProduct.instrumented[idx],
      })),
      {
        name: 'Platform-Enabled',
        current: currentProduct.platformEnabled[0],
        previous: previousProduct.platformEnabled[0],
      },
    ];

    categories.forEach((category) => {
      const change = compareStatus(category.current, category.previous);
      if (change) {
        changes.push({
          product: currentProduct.product,
          portfolio: currentProduct.portfolio,
          category: category.name,
          type: change.type,
          from: category.previous,
          to: category.current,
          message: `${currentProduct.product}: ${category.name} ${change.message}`,
        });
      }
    });

    // Check for owner/focal changes
    if (currentProduct.owner !== previousProduct.owner) {
      changes.push({
        product: currentProduct.product,
        portfolio: currentProduct.portfolio,
        category: 'Product Leader',
        type: 'change',
        from: previousProduct.owner,
        to: currentProduct.owner,
        message: `${currentProduct.product}: Product Leader changed from ${previousProduct.owner} to ${currentProduct.owner}`,
      });
    }

    if (currentProduct.designFocal !== previousProduct.designFocal) {
      changes.push({
        product: currentProduct.product,
        portfolio: currentProduct.portfolio,
        category: 'Design Focal',
        type: 'change',
        from: previousProduct.designFocal,
        to: currentProduct.designFocal,
        message: `${currentProduct.product}: Design Focal changed from ${previousProduct.designFocal} to ${currentProduct.designFocal}`,
      });
    }
  });

  // Check for removed products
  previousData.forEach((previousProduct) => {
    const stillExists = currentData.find(
      (p) => p.product === previousProduct.product && p.portfolio === previousProduct.portfolio
    );
    if (!stillExists) {
      changes.push({
        product: previousProduct.product,
        portfolio: previousProduct.portfolio,
        type: 'removed',
        message: `${previousProduct.product} removed from ${previousProduct.portfolio}`,
      });
    }
  });

  return changes;
}

function compareStatus(current, previous) {
  if (!current || !previous) return null;
  if (current === previous) return null;

  const currentClean = String(current).replace(/[\$\*]+/g, '').trim().toLowerCase();
  const previousClean = String(previous).replace(/[\$\*]+/g, '').trim().toLowerCase();

  if (currentClean === previousClean) return null;

  // Status improvements
  if (previousClean === 'red' && currentClean === 'amber') {
    return { type: 'improvement', message: 'improved from Red to Amber' };
  }
  if (previousClean === 'red' && currentClean === 'green') {
    return { type: 'improvement', message: 'improved from Red to Green' };
  }
  if (previousClean === 'amber' && currentClean === 'green') {
    return { type: 'improvement', message: 'improved from Amber to Green' };
  }

  // Status regressions
  if (previousClean === 'green' && currentClean === 'amber') {
    return { type: 'regression', message: 'regressed from Green to Amber' };
  }
  if (previousClean === 'green' && currentClean === 'red') {
    return { type: 'regression', message: 'regressed from Green to Red' };
  }
  if (previousClean === 'amber' && currentClean === 'red') {
    return { type: 'regression', message: 'regressed from Amber to Red' };
  }

  // Other changes (dates, text, etc.)
  return { type: 'change', message: `changed from "${previous}" to "${current}"` };
}

function getConsumableColumnName(index) {
  const names = [
    'eCommerce Enabled',
    'Onboarding TTV',
    'Onboarding Experience',
    'Provision Time',
    'Fulfillment Time',
    'Consumability Metrics',
  ];
  return names[index] || `Consumable ${index + 1}`;
}

function getInstrumentedColumnName(index) {
  const names = [
    'SaaS Metered Usage',
    'Trial Journey CMTs',
    'Paid Journey CMTs',
    'Rated Usage',
  ];
  return names[index] || `Instrumented ${index + 1}`;
}

export function saveSnapshot(data) {
  const snapshot = {
    date: new Date().toISOString(),
    data: data,
  };
  
  // Get existing snapshots
  const snapshots = getSnapshots();
  
  // Add new snapshot
  snapshots.push(snapshot);
  
  // Keep only last 10 snapshots
  const recentSnapshots = snapshots.slice(-10);
  
  localStorage.setItem('tracker-snapshots', JSON.stringify(recentSnapshots));
  return snapshot;
}

export function getSnapshots() {
  try {
    const stored = localStorage.getItem('tracker-snapshots');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading snapshots:', e);
    return [];
  }
}

export function getPreviousSnapshot() {
  const snapshots = getSnapshots();
  return snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;
}

export function getLatestSnapshot() {
  const snapshots = getSnapshots();
  return snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
}

// Made with Bob
