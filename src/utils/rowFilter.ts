import { DatasetRow } from '../contexts/DatasetContextDefinition';

/**
 * Simple DSL parser for row filtering
 * Supports: col > value, col < value, col >= value, col <= value, col == "value", col != "value"
 */
export class FilterParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FilterParseError';
  }
}

interface FilterCondition {
  column: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: string | number;
}

/**
 * Parse a simple DSL filter expression
 * Examples:
 * - "age > 25"
 * - "name == \"John\""
 * - "score >= 80"
 */
export function parseFilter(dsl: string): FilterCondition {
  if (!dsl || typeof dsl !== 'string') {
    throw new FilterParseError('Filter expression cannot be empty');
  }

  const trimmed = dsl.trim();
  if (!trimmed) {
    throw new FilterParseError('Filter expression cannot be empty');
  }

  // Match patterns: column operator value
  const patterns = [
    /^(\w+)\s*(>=)\s*(.+)$/, // >= must come before >
    /^(\w+)\s*(<=)\s*(.+)$/, // <= must come before <
    /^(\w+)\s*(!=)\s*(.+)$/, // != must come before ==
    /^(\w+)\s*(==)\s*(.+)$/, // ==
    /^(\w+)\s*(>)\s*(.+)$/, // >
    /^(\w+)\s*(<)\s*(.+)$/, // <
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const [, column, operator, valueStr] = match;

      // Parse value (string or number)
      let value: string | number;
      const trimmedValue = valueStr.trim();

      // Check if it's a quoted string
      if ((trimmedValue.startsWith('"') && trimmedValue.endsWith('"'))
          || (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))) {
        value = trimmedValue.slice(1, -1); // Remove quotes
      } else {
        // Try to parse as number
        const numValue = Number(trimmedValue);
        if (!Number.isNaN(numValue)) {
          value = numValue;
        } else {
          value = trimmedValue; // Keep as string
        }
      }

      return {
        column: column.trim(),
        operator: operator as FilterCondition['operator'],
        value,
      };
    }
  }

  throw new FilterParseError(`Invalid filter expression: ${dsl}`);
}

/**
 * Apply a single filter condition to a row
 */
function matchesCondition(row: DatasetRow, condition: FilterCondition): boolean {
  const cellValue = row[condition.column];

  if (cellValue === undefined || cellValue === null) {
    return false; // Skip rows with missing values
  }

  const { operator, value } = condition;

  // For string comparison operators
  if (operator === '==' || operator === '!=') {
    const matches = cellValue === String(value);
    return operator === '==' ? matches : !matches;
  }

  // For numeric comparison operators, try to convert both values to numbers
  if (operator === '>' || operator === '<' || operator === '>=' || operator === '<=') {
    const cellNum = Number(cellValue);
    const valueNum = typeof value === 'number' ? value : Number(value);

    // If either can't be converted to number, skip this row
    if (Number.isNaN(cellNum) || Number.isNaN(valueNum)) {
      return false;
    }

    switch (operator) {
      case '>':
        return cellNum > valueNum;
      case '<':
        return cellNum < valueNum;
      case '>=':
        return cellNum >= valueNum;
      case '<=':
        return cellNum <= valueNum;
      default:
        return false;
    }
  }

  return false;
}

/**
 * Apply a filter to rows using DSL
 */
export function applyFilter(rows: DatasetRow[], dsl: string): DatasetRow[] {
  if (!dsl || !dsl.trim()) {
    return rows; // No filter, return all rows
  }

  try {
    const condition = parseFilter(dsl);
    return rows.filter((row) => matchesCondition(row, condition));
  } catch (error) {
    if (error instanceof FilterParseError) {
      throw error;
    }
    throw new FilterParseError(`Failed to apply filter: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
