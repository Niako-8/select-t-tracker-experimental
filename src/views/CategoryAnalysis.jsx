import React, { useState } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableExpandRow,
  TableExpandedRow,
  TableExpandHeader
} from '@carbon/react';
import { productData } from '../data/sampleData';
import './CategoryAnalysis.scss';

const CategoryAnalysis = () => {
  const headers = [
    { key: 'product', header: '' },
    { key: 'col1', header: 'measurable ROI, etc.' },
    { key: 'col2', header: 'paid Aha)' },
    { key: 'col3', header: '10 paid Aha)' },
    { key: 'col4', header: 'K = significant friction' },
    { key: 'col5', header: 'T = <1 hour R = >1 hour' },
    { key: 'col6', header: '< 1 Day R = >1 day' },
    { key: 'col7', header: '' },
    { key: 'col8', header: '' }
  ];

  const renderStatusCell = (value) => {
    if (!value) return <span className="status-cell na">N/A</span>;
    
    const lowerValue = value.toLowerCase();
    
    if (lowerValue === 'green' || lowerValue.includes('yes')) {
      return <span className="status-indicator green"></span>;
    } else if (lowerValue === 'amber' || lowerValue.includes('mar') || lowerValue.includes('q2')) {
      return (
        <div className="status-cell amber">
          <span className="status-indicator amber"></span>
          {value.includes('-') && <span className="status-text">{value.split('-')[1]}</span>}
        </div>
      );
    } else if (lowerValue === 'red' || lowerValue.includes('no')) {
      return <span className="status-indicator red"></span>;
    } else if (lowerValue.includes('pending')) {
      return <span className="status-cell pending">{value}</span>;
    } else if (lowerValue === 'n/a') {
      return <span className="status-cell na">N/A</span>;
    }
    
    return <span className="status-cell">{value}</span>;
  };

  const rows = productData.flatMap((category) =>
    category.products.map((product, idx) => ({
      id: `${category.category}-${idx}`,
      category: category.category,
      product: product.name,
      col1: product.columns[0] || '',
      col2: product.columns[1] || '',
      col3: product.columns[2] || '',
      col4: product.columns[3] || '',
      col5: product.columns[4] || '',
      col6: product.columns[5] || '',
      col7: product.columns[6] || '',
      col8: product.columns[7] || ''
    }))
  );

  return (
    <div className="category-analysis">
      <DataTable rows={rows} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps
        }) => (
          <div {...getTableContainerProps()}>
            <Table {...getTableProps()} className="category-table">
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, rowIndex) => {
                  const isFirstInCategory = rowIndex === 0 || 
                    rows[rowIndex - 1].cells[0].value !== row.cells[0].value;
                  
                  return (
                    <React.Fragment key={row.id}>
                      {isFirstInCategory && (
                        <TableRow className="category-row">
                          <TableCell colSpan={headers.length + 1}>
                            <div className="category-header">
                              <span className="category-icon">▼</span>
                              <strong>{row.cells[0].value}</strong>
                              <span className="category-count">
                                ({productData.find(c => c.category === row.cells[0].value)?.products.length} products)
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.slice(1).map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.info.header === 'product' ? (
                              cell.value
                            ) : (
                              renderStatusCell(cell.value)
                            )}
                          </TableCell>
                        ))}
                      </TableExpandRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </DataTable>
    </div>
  );
};

export default CategoryAnalysis;

// Made with Bob
