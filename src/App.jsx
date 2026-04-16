import React, { useMemo, useRef, useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Info,
  Filter,
  Upload,
  DollarSign,
  Asterisk,
  X,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MinusCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  GitCompare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend as RechartsLegend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'sonner';
import './App.scss';
import './components/ChangesView.scss';
import csvRawData from './imports/latest_data.csv?raw';
import ChangesView from './components/ChangesView';

const portfolios = ['Data', 'Automation', 'e-Comm'];
const lastUpdated = 'Apr 16, 2026';

const legend = {
  green: 'Completed / YES',
  amber: 'In Progress / Tgt Completion Date Added',
  red: 'Not Started or Incomplete / Tgt Completion Date Unknown / NO',
};

const columnDefinitions = {
  valuable: {
    owner: 'PMM Led',
    priority: "Q1'26",
    description: 'SKO1 w/ Select T use cases incl. differentiation, measurable ROI, etc.',
    tooltip:
      'Green = fully documented use cases with ROI metrics ready for SKO. Amber = in progress or date-targeted. Red = not started.',
  },
  consumable: [
    {
      owner: 'PM',
      priority: "Q4'25",
      description: 'eCommerce enabled',
      tooltip:
        'Green = ability to purchase online on >1 site (IBM, AWS, etc.). Amber = partially available or in progress. Red = not available.',
    },
    {
      owner: 'PM',
      priority: "Q1'26",
      description: 'Onboarding TTV <10min',
      tooltip: 'Green = <10 min onboarding. Amber = <1 hour. Red = >1 hour.',
    },
    {
      owner: 'PM',
      priority: "Q1'26",
      description: 'Onboarding Experience Quality',
      tooltip:
        'Green = simple, frictionless experience. Amber = some friction present. Red = significant friction.',
    },
    {
      owner: 'Eng.',
      priority: "Q1'26",
      description: 'Provision Time Product Instance',
      tooltip:
        'Green = <5 min provisioning. Amber = <1 hour. Red = >1 hour. $ = unverified claim by product team.',
    },
    {
      owner: 'Eng.',
      priority: "April'26",
      description: 'Fulfillment Time e2e workflow',
      tooltip: 'Green = <5 min to 1 day end-to-end. Red = >1 day.',
    },
    {
      owner: 'Eng.',
      priority: "Q4'25",
      description: 'Consumability Metrics Across Customer Journey',
      tooltip: 'Green = metrics fully tracked. Amber = in progress. Red = not implemented.',
    },
  ],
  instrumented: [
    {
      owner: 'Eng.',
      priority: "Q1'26",
      description: 'SaaS Metered Usage',
      tooltip:
        'Green = fully instrumented with SaaS metered usage billing. Amber = in progress. Red = not implemented.',
    },
    {
      owner: 'CIO/Eng.',
      priority: "Q1'26",
      description: 'Trial Journey CMTs deployed',
      tooltip:
        'Green = all CMTs deployed for trial journey. Amber = partially deployed (**). Red = not deployed.',
    },
    {
      owner: 'CIO/Eng.',
      priority: "Q1'26",
      description: 'Paid Journey CMTs deployed',
      tooltip:
        'Green = all CMTs deployed for paid journey. Amber = partially deployed (**). Red = not deployed.',
    },
    {
      owner: 'CIO/Eng.',
      priority: "2Q'26",
      description: 'Rated Usage',
      tooltip:
        'Green = rated usage fully implemented and tracked. Amber = in progress. Red = not implemented.',
    },
  ],
  platformEnabled: [
    {
      owner: 'Eng.',
      priority: "1H'26",
      description: 'Cross-product experience implemented (Solis Land enabled)',
      tooltip:
        'Green = cross-product experience and Solis Land fully enabled. Amber = in progress. Red = not started.',
    },
  ],
};

function getStatusType(value) {
  if (!value) return 'empty';
  const clean = String(value).replace(/[\$\*]+/g, '').trim();
  const lower = clean.toLowerCase();

  if (lower === 'green') return 'green';
  if (lower === 'amber') return 'amber';
  if (lower === 'red') return 'red';
  if (lower.includes('n/a') || lower.includes('pending') || lower === 'no data') return 'text';

  const datePattern = /['/QH\d-]/;
  const monthPattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Mid|Early|Late)\b/i;
  if (datePattern.test(clean) || monthPattern.test(clean)) return 'amber';

  return 'text';
}

function parseCsv(csvText) {
  const parsed = Papa.parse(csvText, { skipEmptyLines: true });
  const rows = parsed.data;

  let headerIndex = -1;
  for (let index = 0; index < rows.length; index += 1) {
    if (rows[index]?.[0] === 'Portfolio' && rows[index]?.[1]?.includes('Select T Focus Product')) {
      headerIndex = index;
      break;
    }
  }

  if (headerIndex === -1) throw new Error('Could not locate tracker header row');

  let currentPortfolio = '';
  return rows
    .slice(headerIndex + 1)
    .filter((row) => {
      if (!row || row.length < 2) return false;
      const first = (row[0] || '').trim();
      const second = (row[1] || '').trim();
      if (!first && !second) return false;
      if (first === 'Green' || first === 'Amber' || first === 'Red') return false;
      // Filter out legend rows
      if (second.includes('Completed / YES') ||
          second.includes('In Progress / Tgt Completion Date Added') ||
          second.includes('Not Started or Incomplete')) return false;
      return second.length > 0;
    })
    .map((row) => {
      const portfolio = (row[0] || '').trim();
      if (portfolio) currentPortfolio = portfolio;

      return {
        portfolio: currentPortfolio,
        product: (row[1] || '').trim(),
        valuable: (row[2] || '').trim() || null,
        consumable: [
          (row[3] || '').trim() || null,
          (row[4] || '').trim() || null,
          (row[5] || '').trim() || null,
          (row[6] || '').trim() || null,
          (row[7] || '').trim() || null,
          (row[8] || '').trim() || null,
        ],
        instrumented: [
          (row[9] || '').trim() || null,
          (row[10] || '').trim() || null,
          (row[11] || '').trim() || null,
          (row[12] || '').trim() || null,
        ],
        platformEnabled: [(row[13] || '').trim() || null],
        owner: (row[14] || '').trim(),
        designFocal: (row[15] || '').trim(),
        engineeringFocal: (row[16] || '').trim() || '',
      };
    });
}

function getCategoryStats(values) {
  const total = values.length;
  const green = values.filter((value) => getStatusType(value) === 'green').length;
  const amber = values.filter((value) => getStatusType(value) === 'amber').length;
  const red = values.filter((value) => getStatusType(value) === 'red').length;
  const na = values.filter((value) => {
    const type = getStatusType(value);
    return type === 'text' || type === 'empty';
  }).length;

  return {
    total,
    green,
    amber,
    red,
    na,
    greenPercent: total > 0 ? Math.round((green / total) * 100) : 0,
    amberPercent: total > 0 ? Math.round((amber / total) * 100) : 0,
    redPercent: total > 0 ? Math.round((red / total) * 100) : 0,
    naPercent: total > 0 ? Math.round((na / total) * 100) : 0,
    percentage: total > 0 ? Math.round((green / total) * 100) : 0,
  };
}

function extractDate(value) {
  if (!value) return null;
  const cleanValue = value.replace(/[\$\*]+/g, '').trim();
  if (['green', 'amber', 'red'].includes(cleanValue.toLowerCase())) return null;
  const datePattern = /['\/QH\d]/;
  const monthPattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Mid|Early|Late)\b/i;
  if (datePattern.test(cleanValue) || monthPattern.test(cleanValue)) return cleanValue;
  return null;
}

function Modal({ isOpen, onClose, title, children, maxWidth = '640px' }) {
  if (!isOpen) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-backdrop" />
      <div className="modal-card" style={{ maxWidth }} onClick={(event) => event.stopPropagation()}>
        <div className="overlay-header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="overlay-body">{children}</div>
      </div>
    </div>
  );
}

function Drawer({ isOpen, onClose, title, children }) {
  return (
    <>
      {isOpen ? <div className="drawer-backdrop" onClick={onClose} /> : null}
      <div className={`drawer-panel ${isOpen ? 'open' : ''}`}>
        <div className="overlay-header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="overlay-body">{children}</div>
      </div>
    </>
  );
}

function StatusCellEditable({ value, columnDefinition }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDollarTooltip, setShowDollarTooltip] = useState(false);
  const statusType = getStatusType(value);
  const hasDollarSign = value?.includes('$');
  const hasDoubleAsterisk = value?.includes('**');
  const actualStatus = value?.replace(/[\$\*]+/g, '') || value;

  if (statusType === 'text') {
    return (
      <div className="status-text-wrapper">
        <div className="status-text-only">
          <span className="status-text-label" title={value || ''}>
            {value}
          </span>
          {hasDollarSign ? (
            <div className="marker-tooltip-wrap">
              <button
                type="button"
                onMouseEnter={() => setShowDollarTooltip(true)}
                onMouseLeave={() => setShowDollarTooltip(false)}
              >
                <DollarSign size={12} className="text-amber" />
              </button>
              {showDollarTooltip ? <div className="floating-tooltip">No verified data - product team claims provision time is less than target time</div> : null}
            </div>
          ) : null}
          {hasDoubleAsterisk ? (
            <div className="double-asterisk">
              <Asterisk size={10} />
              <Asterisk size={10} />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (statusType === 'amber' && value && !['green', 'amber', 'red'].includes((actualStatus || '').toLowerCase())) {
    const dateText = extractDate(value);
    return (
      <div className="status-date-wrapper">
        <div
          className="status-dot-area"
          onMouseEnter={() => columnDefinition && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="status-dot-fixed amber" />
          {(hasDollarSign || hasDoubleAsterisk) ? (
            <div className="status-side-markers">
              {hasDollarSign ? (
                <div className="marker-tooltip-wrap">
                  <button
                    type="button"
                    onMouseEnter={() => setShowDollarTooltip(true)}
                    onMouseLeave={() => setShowDollarTooltip(false)}
                  >
                    <DollarSign size={10} className="text-amber" />
                  </button>
                  {showDollarTooltip ? <div className="floating-tooltip">No verified data - product team claims provision time is less than target time</div> : null}
                </div>
              ) : null}
              {hasDoubleAsterisk ? (
                <div className="double-asterisk tiny">
                  <Asterisk size={7} />
                  <Asterisk size={7} />
                </div>
              ) : null}
            </div>
          ) : null}
          {showTooltip ? <div className="column-tooltip">{columnDefinition}</div> : null}
        </div>
        {dateText ? <div className="status-date-label">{dateText}</div> : null}
      </div>
    );
  }

  return (
    <div
      className="status-dot-wrapper"
      onMouseEnter={() => columnDefinition && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="status-dot-fixed-area">
        <div className={`status-dot-fixed ${statusType === 'text' || statusType === 'empty' ? 'empty' : statusType}`} />
        {(hasDollarSign || hasDoubleAsterisk) ? (
          <div className="status-side-markers">
            {hasDollarSign ? (
              <div className="marker-tooltip-wrap">
                <button
                  type="button"
                  onMouseEnter={() => setShowDollarTooltip(true)}
                  onMouseLeave={() => setShowDollarTooltip(false)}
                >
                  <DollarSign size={10} className="text-amber" />
                </button>
                {showDollarTooltip ? <div className="floating-tooltip">No verified data - product team claims provision time is less than target time</div> : null}
              </div>
            ) : null}
            {hasDoubleAsterisk ? (
              <div className="double-asterisk tiny">
                <Asterisk size={7} />
                <Asterisk size={7} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {showTooltip ? <div className="column-tooltip">{columnDefinition}</div> : null}
    </div>
  );
}

function CategoryScorecard({ products }) {
  const categories = [
    { name: 'Valuable', stats: getCategoryStats(products.map((product) => product.valuable)), color: 'pink' },
    { name: 'Consumable', stats: getCategoryStats(products.flatMap((product) => product.consumable)), color: 'green' },
    { name: 'Instrumented', stats: getCategoryStats(products.flatMap((product) => product.instrumented)), color: 'blue' },
    { name: 'Platform-Enabled', stats: getCategoryStats(products.flatMap((product) => product.platformEnabled)), color: 'purple' },
  ];

  return (
    <div className="scorecard-row">
      {categories.map((category) => (
        <div key={category.name} className="scorecard-card">
          <div className="scorecard-top">
            <h3 className={`tone-${category.color}`}>{category.name}</h3>
            <div className="scorecard-percent">{category.stats.greenPercent}%</div>
          </div>
          <div className="scorecard-bar">
            <div className="bar-seg green" style={{ width: `${category.stats.greenPercent}%` }} />
            <div className="bar-seg amber" style={{ width: `${category.stats.amberPercent}%` }} />
            <div className="bar-seg red" style={{ width: `${category.stats.redPercent}%` }} />
            <div className="bar-seg gray" style={{ width: `${category.stats.naPercent}%` }} />
          </div>
          <div className="scorecard-stats">
            <div><span className="mini green" />{category.stats.green}</div>
            <div><span className="mini amber" />{category.stats.amber}</div>
            <div><span className="mini red" />{category.stats.red}</div>
            <div><span className="mini gray" />{category.stats.na}</div>
          </div>
          <div className="scorecard-footer">
            <span>Total: {category.stats.total} items</span>
            <span>{category.stats.na} N/A</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const VALUABLE_CRITERIA = [
  {
    key: 'valuable_0',
    owner: 'PMM Led',
    quarter: "Q1'26",
    description: 'SKO1 w/ Select T use cases incl. differentiation, measurable ROI, etc.',
    scoring: 'Green = fully documented use cases with ROI metrics ready for SKO. Amber = in progress or date-targeted. Red = not started.',
  },
];

const CONSUMABLE_CRITERIA = [
  { key: 'consumable_0', owner: 'PM', quarter: "Q4'25", description: 'eCommerce enabled (from purchase to paid Aha)', scoring: 'Green = ability to purchase online on >1 site (IBM, AWS, etc.). Amber = partially available or in progress. Red = not available.' },
  { key: 'consumable_1', owner: 'PM', quarter: "Q1'26", description: 'Onboarding <10 min inc (from purchase to paid Aha)', scoring: 'Green = <10 min onboarding. Yellow = <1 hour. Red = >1 hour.' },
  { key: 'consumable_2', owner: 'PM', quarter: "Q1'26", description: 'Onboarding Experience Quality', scoring: 'Green = simple, frictionless experience. Amber = some friction present. Red = significant friction.' },
  { key: 'consumable_3', owner: 'Eng.', quarter: "Q1'26", description: 'Provision Time — Product Instance', scoring: 'Green = <5 min provisioning. Amber = <1 hour. Red = >1 hour. $ = unverified claim by product team.' },
  { key: 'consumable_4', owner: 'Eng.', quarter: "April'26", description: 'Fulfillment Time e2e workflow', scoring: 'Green = <5 min to 1 day end-to-end. Red = >1 day.' },
];

const INSTRUMENTED_CRITERIA = [
  { key: 'instrumented_0', owner: 'Eng.', quarter: "Q1'26", description: 'SaaS Metered Usage', scoring: 'Green = fully instrumented with SaaS metered usage billing. Amber = in progress. Red = not implemented.' },
  { key: 'instrumented_1', owner: 'CIO/Eng.', quarter: "Q1'26", description: 'Trial Journey CMTs deployed', scoring: 'Green = all CMTs deployed for trial journey. Amber = partially deployed (**). Red = not deployed.' },
  { key: 'instrumented_2', owner: 'CIO/Eng.', quarter: "Q1'26", description: 'Paid Journey CMTs deployed', scoring: 'Green = all CMTs deployed for paid journey. Amber = partially deployed (**). Red = not deployed.' },
  { key: 'instrumented_3', owner: 'CIO/Eng.', quarter: "2Q'26", description: 'Rated Usage', scoring: 'Green = rated usage fully implemented and tracked. Amber = in progress. Red = not implemented.' },
];

const PLATFORM_ENABLED_CRITERIA = [
  { key: 'platform_enabled_0', owner: 'Eng.', quarter: "1H'26", description: 'Cross-product experience implemented (Solis Land enabled)', scoring: 'Green = cross-product experience and Solis Land fully enabled. Amber = in progress. Red = not started.' },
];

function StatusDot({ status }) {
  return <span className={`mini ${status === 'text' ? 'gray' : status === 'empty' ? 'gray' : status}`} />;
}

function CriterionPanel({ criterion, values, productNames, accentColor, forceOpen }) {
  const [open, setOpen] = useState(forceOpen ?? false);
  const [showScoring, setShowScoring] = useState(false);

  const statuses = values.map((value) => getStatusType(value));
  const green = statuses.filter((status) => status === 'green').length;
  const amber = statuses.filter((status) => status === 'amber').length;
  const red = statuses.filter((status) => status === 'red').length;
  const na = statuses.filter((status) => status === 'text' || status === 'empty').length;
  const total = statuses.length;
  const pct = total > 0 ? Math.round((green / total) * 100) : 0;
  const isOpen = forceOpen ?? open;

  return (
    <div className="criterion-block">
      <button type="button" className="criterion-row" onClick={() => !forceOpen && setOpen((current) => !current)}>
        <div className="criterion-row-main">
          {isOpen ? <ChevronDown size={14} className="gray-icon" /> : <ChevronRight size={14} className="gray-icon" />}
          <div className="criterion-inline">
            <span className={`owner-pill ${accentColor}`}>{criterion.owner}</span>
            <span className="muted-xs">{criterion.quarter}</span>
            <span className="criterion-copy">{criterion.description}</span>
          </div>
        </div>
        <div className="criterion-inline-stats">
          <div><span className="mini green" />{green}</div>
          <div><span className="mini amber" />{amber}</div>
          <div><span className="mini red" />{red}</div>
          <div><span className="mini gray" />{na}</div>
          <span className={`pct ${pct >= 75 ? 'green-text' : pct >= 50 ? 'amber-text' : 'red-text'}`}>{pct}%</span>
        </div>
      </button>

      {isOpen ? (
        <div className="criterion-expanded">
          {!forceOpen ? (
            <div className="criteria-toggle-wrap">
              <button type="button" className="criteria-toggle" onClick={() => setShowScoring((current) => !current)}>
                <Info size={12} />
                {showScoring ? 'Hide scoring criteria' : 'View scoring criteria'}
              </button>
              {showScoring ? <div className="criteria-box">{criterion.scoring}</div> : null}
            </div>
          ) : null}

          <div className="progress-stack">
            <div className="progress-head">
              <span>Completion</span>
              <span className={pct >= 75 ? 'green-text' : pct >= 50 ? 'amber-text' : 'red-text'}>{pct}%</span>
            </div>
            <div className="progress-line">
              <div className="bar-seg green" style={{ width: `${(green / total) * 100 || 0}%` }} />
              <div className="bar-seg amber" style={{ width: `${(amber / total) * 100 || 0}%` }} />
              <div className="bar-seg red" style={{ width: `${(red / total) * 100 || 0}%` }} />
              <div className="bar-seg gray" style={{ width: `${(na / total) * 100 || 0}%` }} />
            </div>
            <div className="progress-meta">
              <span><strong className="green-text">{green}</strong> complete</span>
              <span><strong className="amber-text">{amber}</strong> in progress</span>
              <span><strong className="red-text">{red}</strong> at risk</span>
              <span><strong>{na}</strong> n/a</span>
            </div>
          </div>

          <div className="criterion-products">
            {productNames.map((name, index) => {
              const status = statuses[index];
              const rawVal = values[index];
              return (
                <div key={`${criterion.key}-${name}-${index}`} className="criterion-product">
                  <StatusDot status={status} />
                  <span className="criterion-product-name" title={name}>{name}</span>
                  <span className="criterion-product-state">
                    {status === 'text' ? rawVal || 'N/A' : status === 'empty' ? 'No data' : status === 'green' ? 'Complete' : status === 'amber' ? 'In Progress' : 'At Risk'}
                    {rawVal?.includes('$') ? <span className="amber-text">$</span> : null}
                    {rawVal?.includes('**') ? <span className="blue-text">**</span> : null}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CategorySection({ title, subtitle, accentClass, accentBorder, accentBadge, criteria, getValues, products, defaultOpen = false, forceOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const allValues = criteria.flatMap((_, index) => products.map((product) => getValues(product, index)));
  const allStatuses = allValues.map((value) => getStatusType(value));
  const totalGreen = allStatuses.filter((status) => status === 'green').length;
  const totalAmber = allStatuses.filter((status) => status === 'amber').length;
  const totalRed = allStatuses.filter((status) => status === 'red').length;
  const totalNA = allStatuses.filter((status) => status === 'text' || status === 'empty').length;
  const totalAll = allStatuses.length;
  const overallPct = totalAll > 0 ? Math.round((totalGreen / totalAll) * 100) : 0;
  const isOpen = forceOpen ?? open;

  return (
    <div className={`category-card ${accentBorder}`}>
      <button type="button" className="category-card-header" onClick={() => !forceOpen && setOpen((current) => !current)}>
        <div className="category-card-title">
          {isOpen ? <ChevronDown size={18} className={accentClass} /> : <ChevronRight size={18} className={accentClass} />}
          <div>
            <h3 className={accentClass}>{title}</h3>
            <p>{subtitle}</p>
          </div>
    
        </div>
        <div className="category-card-stats">
          <div><span className="mini green" />{totalGreen}</div>
          <div><span className="mini amber" />{totalAmber}</div>
          <div><span className="mini red" />{totalRed}</div>
          <div><span className="mini gray" />{totalNA}</div>
          <span>{criteria.length} criteria</span>
          <span>·</span>
          <span>{products.length} products</span>
          <span className={`complete-pill ${overallPct >= 75 ? 'good' : overallPct >= 50 ? 'warn' : 'bad'}`}>{overallPct}% complete</span>
        </div>
      </button>
      {isOpen ? (
        <div className="category-card-body">
          {!forceOpen ? <p className="small-note">Click any criterion row to see the per-product breakdown.</p> : null}
          {criteria.map((criterion, index) => (
            <CriterionPanel
              key={criterion.key}
              criterion={criterion}
              values={products.map((product) => getValues(product, index))}
              productNames={products.map((product) => product.product)}
              accentColor={accentBadge}
              forceOpen={forceOpen}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CategoryAnalysisDetail({ products, forceOpen }) {
  return (
    <div className="category-analysis-wrap">
      {!forceOpen ? (
        <div className="help-banner">
          <Info size={16} className="blue-text" />
          <div>
            <strong>How to use:</strong> Expand each category to see its sub-criteria. Click a criterion row to see the per-product breakdown with status, scoring rules, and completion progress.
            <span className="blue-text"> Green = Complete · Amber = In Progress · Red = At Risk · Gray = N/A</span>
          </div>
        </div>
      ) : null}

      <CategorySection
        title="Valuable"
        subtitle="PMM-led readiness — differentiating use cases with measurable ROI"
        accentClass="pink-text"
        accentBorder="pink-border"
        accentBadge="pink-badge"
        criteria={VALUABLE_CRITERIA}
        getValues={(product) => product.valuable}
        products={products}
        defaultOpen
        forceOpen={forceOpen}
      />
      <CategorySection
        title="Consumable"
        subtitle="PM & Eng. readiness — purchasing, onboarding, provisioning, and fulfillment"
        accentClass="green-text"
        accentBorder="green-border"
        accentBadge="green-badge"
        criteria={CONSUMABLE_CRITERIA}
        getValues={(product, index) => product.consumable[index] ?? null}
        products={products}
        forceOpen={forceOpen}
      />
      <CategorySection
        title="Instrumented"
        subtitle="Eng. & CIO readiness — metered usage, CMT journeys, rated usage"
        accentClass="blue-text"
        accentBorder="blue-border"
        accentBadge="blue-badge"
        criteria={INSTRUMENTED_CRITERIA}
        getValues={(product, index) => product.instrumented[index] ?? null}
        products={products}
        forceOpen={forceOpen}
      />
      <CategorySection
        title="Platform Enabled"
        subtitle="Cross-product experience and platform integration"
        accentClass="purple-text"
        accentBorder="purple-border"
        accentBadge="purple-badge"
        criteria={PLATFORM_ENABLED_CRITERIA}
        getValues={(product, index) => product.platformEnabled[index] ?? null}
        products={products}
        forceOpen={forceOpen}
      />
    </div>
  );
}

function AnalyticsView({ products }) {
  const allStatuses = products.flatMap((product) => [product.valuable, ...product.consumable, ...product.instrumented, ...product.platformEnabled]);
  const statusDistribution = [
    { name: 'Complete', value: allStatuses.filter((value) => getStatusType(value) === 'green').length, color: '#16a34a' },
    { name: 'In Progress', value: allStatuses.filter((value) => getStatusType(value) === 'amber').length, color: '#f59e0b' },
    { name: 'At Risk', value: allStatuses.filter((value) => getStatusType(value) === 'red').length, color: '#dc2626' },
    { name: 'N/A', value: allStatuses.filter((value) => ['text', 'empty'].includes(getStatusType(value))).length, color: '#9ca3af' },
  ];
  const totalCells = allStatuses.length;

  const productScores = products
    .map((product) => {
      const values = [product.valuable, ...product.consumable, ...product.instrumented, ...product.platformEnabled];
      const green = values.filter((value) => getStatusType(value) === 'green').length;
      const amber = values.filter((value) => getStatusType(value) === 'amber').length;
      const red = values.filter((value) => getStatusType(value) === 'red').length;
      const na = values.filter((value) => ['text', 'empty'].includes(getStatusType(value))).length;
      return {
        product: product.product,
        portfolio: product.portfolio,
        score: Math.round((green / values.length) * 100),
        green,
        amber,
        red,
        na,
        total: values.length,
      };
    })
    .sort((left, right) => right.score - left.score);

  const portfolioData = portfolios.map((portfolio) => {
    const portfolioProducts = products.filter((product) => product.portfolio === portfolio);
    const values = portfolioProducts.flatMap((product) => [product.valuable, ...product.consumable, ...product.instrumented, ...product.platformEnabled]);
    const stats = getCategoryStats(values);
    return { name: portfolio, ...stats };
  });

  const topPerformers = productScores.slice(0, 5);
  const bottomPerformers = productScores.slice(-5).reverse();

  return (
    <div className="analytics-wrap">
      <CategoryScorecard products={products} />
      <div className="analytics-cards">
        <div className="analytic-card">
          <div>
            <p>Total Products</p>
            <strong>{products.length}</strong>
          </div>
          <CheckCircle2 className="blue-text" size={28} />
        </div>
        <div className="analytic-card">
          <div>
            <p>Complete</p>
            <strong className="green-text">{statusDistribution[0].value}</strong>
            <span>{statusDistribution[0].value} / {totalCells}</span>
          </div>
          <CheckCircle2 className="green-text" size={28} />
        </div>
        <div className="analytic-card">
          <div>
            <p>In Progress</p>
            <strong className="amber-text">{statusDistribution[1].value}</strong>
            <span>{statusDistribution[1].value} / {totalCells}</span>
          </div>
          <AlertCircle className="amber-text" size={28} />
        </div>
        <div className="analytic-card">
          <div>
            <p>At Risk</p>
            <strong className="red-text">{statusDistribution[2].value}</strong>
            <span>{statusDistribution[2].value} / {totalCells}</span>
          </div>
          <XCircle className="red-text" size={28} />
        </div>
        <div className="analytic-card">
          <div>
            <p>N/A</p>
            <strong className="muted-text">{statusDistribution[3].value}</strong>
            <span>{statusDistribution[3].value} / {totalCells}</span>
          </div>
          <MinusCircle className="muted-text" size={28} />
        </div>
      </div>

      <div className="analytics-grid">
        <div className="white-panel chart-panel">
          <h3>Portfolio Performance</h3>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={portfolioData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#d1d5db' }} tickLine={false} />
                <Tooltip />
                <RechartsLegend />
                <Bar dataKey="green" stackId="a" fill="#16a34a" name="Green" radius={[0, 0, 0, 0]} />
                <Bar dataKey="amber" stackId="a" fill="#f59e0b" name="Amber" radius={[0, 0, 0, 0]} />
                <Bar dataKey="red" stackId="a" fill="#dc2626" name="Red" radius={[0, 0, 0, 0]} />
                <Bar dataKey="na" stackId="a" fill="#9ca3af" name="N/A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="white-panel chart-panel">
          <h3>Overall Status Distribution</h3>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={96}
                  innerRadius={36}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <RechartsLegend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="readiness-panel">
        <div className="readiness-head">
          <h2>Product Readiness Scorecard</h2>
        </div>
        <div className="readiness-help">
          <Info size={14} className="blue-text" />
          <div>
            <strong>How scores are calculated:</strong> Each product has <strong>11 status cells</strong> (1 Valuable + 5 Consumable + 5 Instrumented).
            Score = <code>(Green cells ÷ Total cells) × 100</code>. Green = complete · Amber = in progress · Red = at risk · Gray = N/A.
          </div>
        </div>
        <div className="table-scroll">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product</th>
                <th>Portfolio</th>
                <th>Score</th>
                <th>Green</th>
                <th>Amber</th>
                <th>Red</th>
                <th>N/A</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {productScores.map((item, index) => (
                <tr key={item.product}>
                  <td>
                    <div className="rank-cell">
                      <span>#{index + 1}</span>
                      {index < 3 ? <TrendingUp size={14} className="green-text" /> : null}
                      {index >= productScores.length - 3 ? <TrendingDown size={14} className="red-text" /> : null}
                    </div>
                  </td>
                  <td>{item.product}</td>
                  <td><span className={`portfolio-pill ${item.portfolio === 'Data' ? 'data' : item.portfolio === 'Automation' ? 'automation' : 'ecomm'}`}>{item.portfolio}</span></td>
                  <td className={item.score >= 75 ? 'green-text' : item.score >= 50 ? 'amber-text' : 'red-text'}>{item.score}%</td>
                  <td>{item.green}</td>
                  <td>{item.amber}</td>
                  <td>{item.red}</td>
                  <td>{item.na}</td>
                  <td>
                    <div className="progress-line small">
                      <div className="bar-seg green" style={{ width: `${(item.green / item.total) * 100}%` }} />
                      <div className="bar-seg amber" style={{ width: `${(item.amber / item.total) * 100}%` }} />
                      <div className="bar-seg red" style={{ width: `${(item.red / item.total) * 100}%` }} />
                      <div className="bar-seg gray" style={{ width: `${(item.na / item.total) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="analytics-grid performer-grid">
        <div className="white-panel performer-panel">
          <div className="performer-title">
            <TrendingUp className="green-text" size={22} />
            <h3>Top Performers</h3>
          </div>
          <div className="performer-list">
            {topPerformers.map((item, index) => (
              <div key={item.product} className="performer-item top">
                <div className="performer-left">
                  <div className="performer-rank good">{index + 1}</div>
                  <div>
                    <div className="performer-name">{item.product}</div>
                    <div className="performer-meta">{item.portfolio}</div>
                  </div>
                </div>
                <div className="performer-right">
                  <strong className="green-text">{item.score}%</strong>
                  <span>{item.na} N/A</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="white-panel performer-panel">
          <div className="performer-title">
            <TrendingDown className="red-text" size={22} />
            <h3>Needs Attention</h3>
          </div>
          <div className="performer-list">
            {bottomPerformers.map((item, index) => (
              <div key={item.product} className="performer-item bottom">
                <div className="performer-left">
                  <div className="performer-rank risk">{productScores.length - index}</div>
                  <div>
                    <div className="performer-name">{item.product}</div>
                    <div className="performer-meta">{item.portfolio}</div>
                  </div>
                </div>
                <div className="performer-right">
                  <strong className="red-text">{item.score}%</strong>
                  <span>{item.na} N/A</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const fileInputRef = useRef(null);
  const [products, setProducts] = useState(() => parseCsv(csvRawData));
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPortfolios, setExpandedPortfolios] = useState(new Set(portfolios));
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [viewMode, setViewMode] = useState('product-scorecard');
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'changes'

  const filteredData = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.product.toLowerCase().includes(query) ||
          product.owner.toLowerCase().includes(query) ||
          product.portfolio.toLowerCase().includes(query),
      );
    }

    if (portfolioFilter !== 'all') {
      filtered = filtered.filter((product) => product.portfolio === portfolioFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((product) => {
        const allStatuses = [product.valuable, ...product.consumable, ...product.instrumented, ...product.platformEnabled];
        return allStatuses.some((status) => getStatusType(status) === statusFilter);
      });
    }

    return filtered;
  }, [products, searchQuery, portfolioFilter, statusFilter]);

  const groupedData = useMemo(() => {
    const grouped = new Map();
    portfolios.forEach((portfolio) => {
      const items = filteredData.filter((product) => product.portfolio === portfolio);
      if (items.length > 0) grouped.set(portfolio, items);
    });
    return grouped;
  }, [filteredData]);

  const togglePortfolio = (portfolio) => {
    setExpandedPortfolios((current) => {
      const next = new Set(current);
      if (next.has(portfolio)) next.delete(portfolio);
      else next.add(portfolio);
      return next;
    });
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setPortfolioFilter('all');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      try {
        let parsedData;

        if (isExcel) {
          // Handle Excel files
          const data = new Uint8Array(loadEvent.target?.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convert to CSV format
          const csvText = XLSX.utils.sheet_to_csv(firstSheet);
          parsedData = parseCsv(csvText);
          
          toast.success('Excel file uploaded successfully!');
        } else {
          // Handle CSV files
          const csvText = loadEvent.target?.result;
          parsedData = parseCsv(csvText);
          toast.success('CSV file uploaded successfully!');
        }

        setProducts(parsedData);
        setSearchQuery('');
        setStatusFilter('all');
        setPortfolioFilter('all');
        event.target.value = '';
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Error uploading file. Please check the format and try again. ${error.message}`);
        event.target.value = '';
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <div className="figma-shell">
      <Toaster position="top-right" />

      <header className="page-header">
        <div className="header-inner">
          <div>
            <div className="title-group">
              <h1>Select T Product Acceleration Tracker</h1>
              <span className="updated-pill">Last updated: {lastUpdated}</span>
            </div>
            <p>Portfolio product tracking with status indicators</p>
          </div>

          <div className="view-toggle">
            <button
              className={activeView === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveView('dashboard')}
            >
              <BarChart3 size={18} />
              Dashboard
            </button>
            <button
              className={activeView === 'changes' ? 'active' : ''}
              onClick={() => setActiveView('changes')}
            >
              <GitCompare size={18} />
              Changes
            </button>
          </div>

          <div className="header-tools">
            <div className="search-shell">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search products, owners..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <button type="button" className="tool-btn" onClick={() => setIsLegendOpen(true)}>
              <Info size={18} />
              Legend
            </button>

            <button type="button" className="tool-btn" onClick={() => setIsFilterDrawerOpen(true)}>
              <Filter size={18} />
              Filters
            </button>

            <button type="button" className="upload-btn" onClick={() => fileInputRef.current?.click()}>
              Upload File
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" hidden onChange={handleFileUpload} />
          </div>
        </div>
      </header>

      <main className="page-main">
        {activeView === 'changes' ? (
          <ChangesView currentData={products} />
        ) : (
          <>
            <div className="view-switch">
              {[
                ['product-scorecard', 'Product Scorecard'],
                ['category-analysis', 'Category Analysis'],
                ['analytics', 'Analytics Dashboard'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={viewMode === key ? 'active' : ''}
                  onClick={() => setViewMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {viewMode === 'analytics' ? (
          <AnalyticsView products={filteredData} />
        ) : viewMode === 'category-analysis' ? (
          <>
            <CategoryScorecard products={filteredData} />
            <CategoryAnalysisDetail products={filteredData} />
          </>
        ) : (
          <>
            <CategoryScorecard products={filteredData} />
            <div className="table-card">
              <div className="table-scroll">
                <table className="tracker-grid">
                  <thead>
                    <tr className="top-tenet">
                      <th rowSpan="3" className="sticky-a">Portfolio</th>
                      <th rowSpan="3" className="sticky-b">Select T Focus Product</th>
                      <th colSpan="12">Tenet:</th>
                      <th colSpan="2" className="leaders-header">Leaders & Focals</th>
                    </tr>
                    <tr className="top-group">
                      <th className="pink-fill">Valuable</th>
                      <th className="green-fill" colSpan="6">Consumable</th>
                      <th className="blue-fill" colSpan="4">Instrumented</th>
                      <th className="purple-fill">Platform-Enabled</th>
                      <th className="leaders-fill" colSpan="2">Leaders & Focals</th>
                    </tr>
                    <tr className="top-detail">
                      <th className="pink-soft"><div>PMM Led</div><strong>Q1'26</strong><p>{columnDefinitions.valuable.description}</p></th>
                      {columnDefinitions.consumable.map((column) => (
                        <th key={column.description} className="green-soft"><div>{column.owner}</div><strong>{column.priority}</strong><p>{column.description}</p></th>
                      ))}
                      {columnDefinitions.instrumented.map((column) => (
                        <th key={column.description} className="blue-soft"><div>{column.owner}</div><strong>{column.priority}</strong><p>{column.description}</p></th>
                      ))}
                      <th className="purple-soft"><div>{columnDefinitions.platformEnabled[0].owner}</div><strong>{columnDefinitions.platformEnabled[0].priority}</strong><p>{columnDefinitions.platformEnabled[0].description}</p></th>
                      <th className="leaders-soft">Product Leader</th>
                      <th className="leaders-soft">Design Focal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(groupedData.entries()).flatMap(([portfolio, items]) => [
                      <tr key={`${portfolio}-header`} className="portfolio-group-row">
                        <td colSpan="16" onClick={() => togglePortfolio(portfolio)}>
                          <div>
                            {expandedPortfolios.has(portfolio) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span>{portfolio}</span>
                            <em>({items.length} products)</em>
                          </div>
                        </td>
                      </tr>,
                      ...(expandedPortfolios.has(portfolio)
                        ? items.map((product, index) => (
                            <tr key={`${portfolio}-${product.product}-${index}`} className="product-row">
                              <td className="portfolio-col">{index === 0 ? portfolio : ''}</td>
                              <td className="product-col">{product.product}</td>
                              <td className="pink-td"><StatusCellEditable value={product.valuable} columnDefinition={columnDefinitions.valuable.tooltip} /></td>
                              {product.consumable.map((value, valueIndex) => (
                                <td key={`consumable-${valueIndex}`} className="green-td"><StatusCellEditable value={value} columnDefinition={columnDefinitions.consumable[valueIndex].tooltip} /></td>
                              ))}
                              {product.instrumented.map((value, valueIndex) => (
                                <td key={`instrumented-${valueIndex}`} className="blue-td"><StatusCellEditable value={value} columnDefinition={columnDefinitions.instrumented[valueIndex].tooltip} /></td>
                              ))}
                              {product.platformEnabled.map((value, valueIndex) => (
                                <td key={`platform-${valueIndex}`} className="purple-td"><StatusCellEditable value={value} columnDefinition={columnDefinitions.platformEnabled[valueIndex].tooltip} /></td>
                              ))}
                              <td className="leaders-td">{product.owner}</td>
                              <td className="leaders-td">{product.designFocal}</td>
                            </tr>
                          ))
                        : []),
                    ])}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="markers-box">
              <h3><DollarSign size={16} className="amber-text" />Special Markers</h3>
              <div>
                <p><DollarSign size={14} className="amber-text" /><span><strong>Dollar Sign ($):</strong> No verified data - product team claims provision time is less than target time</span></p>
                <p><span className="double-asterisk"><Asterisk size={12} /><Asterisk size={12} /></span><span><strong>Double Asterisk (**):</strong> Indicates amber status for Trial/Paid Journey CMTs with special conditions</span></p>
              </div>
            </div>
          </>
        )}
          </>
        )}
      </main>

      <Modal isOpen={isLegendOpen} onClose={() => setIsLegendOpen(false)} title="Status Legend" maxWidth="480px">
        <div className="legend-stack">
          <div className="legend-row"><span className="status-dot-fixed green" /><div><strong>Green</strong><span>{legend.green}</span></div></div>
          <div className="legend-row"><span className="status-dot-fixed amber" /><div><strong>Amber</strong><span>{legend.amber}</span></div></div>
          <div className="legend-row"><span className="status-dot-fixed red" /><div><strong>Red</strong><span>{legend.red}</span></div></div>
        </div>
      </Modal>

      <Drawer isOpen={isFilterDrawerOpen} onClose={() => setIsFilterDrawerOpen(false)} title="Filters">
        <div className="filter-stack">
          <div>
            <label>Status</label>
            <div className="filter-options">
              {['all', 'green', 'amber', 'red'].map((status) => (
                <button
                  key={status}
                  type="button"
                  className={statusFilter === status ? 'selected' : ''}
                  onClick={() => setStatusFilter(status)}
                >
                  <span className={`mini ${status === 'all' ? 'gray' : status}`} />
                  <span>{status === 'all' ? 'All Statuses' : status[0].toUpperCase() + status.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label>Portfolio</label>
            <div className="filter-options">
              {['all', ...portfolios].map((portfolio) => (
                <button
                  key={portfolio}
                  type="button"
                  className={portfolioFilter === portfolio ? 'selected' : ''}
                  onClick={() => setPortfolioFilter(portfolio)}
                >
                  <span>{portfolio === 'all' ? 'All Portfolios' : portfolio}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="clear-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      </Drawer>
    </div>
  );
}

export default App;

// Made with Bob
