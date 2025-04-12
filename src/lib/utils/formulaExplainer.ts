interface FormulaExplanation {
  original: string;
  plainLanguage: string;
  parts: {
    snippet: string;
    explanation: string;
  }[];
  complexity: 'simple' | 'medium' | 'complex';
  examples?: {
    input: any[];
    output: any;
    explanation: string;
  }[];
}

/**
 * Tokenize a formula into its component parts
 */
function tokenizeFormula(formula: string): string[] {
  // Remove = at the beginning
  const cleanFormula = formula.startsWith('=') ? formula.substring(1) : formula;
  
  const tokens: string[] = [];
  let currentToken = '';
  let inString = false;
  
  for (let i = 0; i < cleanFormula.length; i++) {
    const char = cleanFormula[i];
    
    // Handle string literals
    if (char === '"') {
      inString = !inString;
      currentToken += char;
      continue;
    }
    
    if (inString) {
      currentToken += char;
      continue;
    }
    
    // Handle operators and parentheses as separate tokens
    if ('+-*/^=<>(),;{}'.includes(char)) {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
      tokens.push(char);
    } else if (char === ' ') {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }
  
  if (currentToken) {
    tokens.push(currentToken);
  }
  
  return tokens;
}

/**
 * Identify functions within a formula
 */
function identifyFunctions(tokens: string[]): Map<string, number[]> {
  const functions = new Map<string, number[]>();
  
  for (let i = 0; i < tokens.length - 1; i++) {
    // A function is typically a token followed by an opening parenthesis
    if (tokens[i+1] === '(') {
      functions.set(tokens[i], [i]);
    }
  }
  
  return functions;
}

/**
 * Get an explanation for a common spreadsheet function
 */
function getFunctionExplanation(functionName: string): string {
  const explanations: Record<string, string> = {
    'SUM': 'Adds all the numbers in a range of cells',
    'AVERAGE': 'Calculates the average (arithmetic mean) of the numbers in a range',
    'COUNT': 'Counts the number of cells in a range that contain numbers',
    'COUNTA': 'Counts the number of cells in a range that are not empty',
    'MAX': 'Returns the largest value in a set of numbers',
    'MIN': 'Returns the smallest value in a set of numbers',
    'IF': 'Tests a condition and returns one value if true, another if false',
    'SUMIF': 'Adds the cells specified by a given condition or criteria',
    'VLOOKUP': 'Looks for a value in the leftmost column of a table, and returns a value in the same row from a column you specify',
    'HLOOKUP': 'Looks for a value in the top row of a table and returns a value in the same column from a row you specify',
    'INDEX': 'Returns the value at a given position in a range or array',
    'MATCH': 'Searches for a specified item in a range of cells, and returns the relative position of that item',
    'CONCATENATE': 'Joins several text strings into one text string',
    'LEFT': 'Returns the specified number of characters from the start of a text string',
    'RIGHT': 'Returns the specified number of characters from the end of a text string',
    'MID': 'Returns a specific number of characters from a text string, starting at the position you specify',
    'TRIM': 'Removes spaces from text except for single spaces between words',
    'ROUND': 'Rounds a number to a specified number of digits',
    'ROUNDUP': 'Rounds a number up, away from zero, to a specified number of digits',
    'ROUNDDOWN': 'Rounds a number down, toward zero, to a specified number of digits',
    'TODAY': 'Returns the current date',
    'NOW': 'Returns the current date and time',
    'DATE': 'Returns the number that represents the date in Microsoft Excel date-time code',
    'YEAR': 'Returns the year corresponding to a date',
    'MONTH': 'Returns the month of a date represented by a serial number',
    'DAY': 'Returns the day of a date represented by a serial number',
    'NETWORKDAYS': 'Returns the number of whole workdays between two dates',
    'WORKDAY': 'Returns the serial number of the date before or after a specified number of workdays',
    'IFERROR': 'Returns a value you specify if a formula evaluates to an error; otherwise, returns the result of the formula',
    'SUMPRODUCT': 'Multiplies corresponding components in the given arrays, and returns the sum of those products',
    'INDIRECT': 'Returns the reference specified by a text string',
    'ROW': 'Returns the row number of a reference',
    'COLUMN': 'Returns the column number of a reference',
    'AND': 'Returns TRUE if all of its arguments are TRUE',
    'OR': 'Returns TRUE if any argument is TRUE',
    'NOT': 'Reverses the logic of its argument',
    'TRUE': 'Returns the logical value TRUE',
    'FALSE': 'Returns the logical value FALSE',
  };
  
  return explanations[functionName.toUpperCase()] || 'A spreadsheet function';
}

/**
 * Determine the complexity of a formula
 */
function determineComplexity(formula: string): 'simple' | 'medium' | 'complex' {
  const tokens = tokenizeFormula(formula);
  const functionCount = Array.from(identifyFunctions(tokens).keys()).length;
  const nestedLevel = (formula.match(/\(/g) || []).length;
  
  if (functionCount > 3 || nestedLevel > 3) {
    return 'complex';
  } else if (functionCount > 1 || nestedLevel > 1) {
    return 'medium';
  }
  
  return 'simple';
}

/**
 * Generate examples for a formula
 */
function generateExamples(formula: string): { input: any[]; output: any; explanation: string; }[] {
  // This is a simplified example generator
  // In a real implementation, you would parse the formula and generate actual examples
  
  const tokens = tokenizeFormula(formula);
  const functions = identifyFunctions(tokens);
  
  if (functions.has('SUM')) {
    return [{
      input: [10, 20, 30],
      output: 60,
      explanation: 'When SUM is used with the values 10, 20, and 30, it adds them together to get 60.'
    }];
  }
  
  if (functions.has('AVERAGE')) {
    return [{
      input: [10, 20, 30, 40],
      output: 25,
      explanation: 'When AVERAGE is used with the values 10, 20, 30, and 40, it calculates the average: (10+20+30+40)/4 = 25.'
    }];
  }
  
  if (functions.has('IF')) {
    return [
      {
        input: [true, 'Yes', 'No'],
        output: 'Yes',
        explanation: 'When the condition is TRUE, IF returns the "Yes" value.'
      },
      {
        input: [false, 'Yes', 'No'],
        output: 'No',
        explanation: 'When the condition is FALSE, IF returns the "No" value.'
      }
    ];
  }
  
  return [];
}

/**
 * Break down a formula into understandable parts
 */
function breakDownFormula(formula: string): { snippet: string; explanation: string; }[] {
  const tokens = tokenizeFormula(formula);
  const functions = identifyFunctions(tokens);
  const parts: { snippet: string; explanation: string; }[] = [];
  
  // Parse functions and explain them
  for (const [funcName, positions] of functions.entries()) {
    const explanation = getFunctionExplanation(funcName);
    parts.push({ 
      snippet: funcName, 
      explanation 
    });
  }
  
  // Handle basic arithmetic
  if (tokens.includes('+')) {
    parts.push({ 
      snippet: '+', 
      explanation: 'Adds values together' 
    });
  }
  
  if (tokens.includes('-')) {
    parts.push({ 
      snippet: '-', 
      explanation: 'Subtracts the right value from the left value' 
    });
  }
  
  if (tokens.includes('*')) {
    parts.push({ 
      snippet: '*', 
      explanation: 'Multiplies values together' 
    });
  }
  
  if (tokens.includes('/')) {
    parts.push({ 
      snippet: '/', 
      explanation: 'Divides the left value by the right value' 
    });
  }
  
  // Handle cell references
  const cellRefs = tokens.filter(token => /^[A-Z]+[0-9]+$/i.test(token));
  if (cellRefs.length > 0) {
    parts.push({ 
      snippet: cellRefs.join(', '), 
      explanation: 'References to specific cells in the spreadsheet' 
    });
  }
  
  // Handle range references
  const rangeRefs = tokens.filter(token => /^[A-Z]+[0-9]+:[A-Z]+[0-9]+$/i.test(token));
  if (rangeRefs.length > 0) {
    parts.push({ 
      snippet: rangeRefs.join(', '), 
      explanation: 'References to ranges of cells in the spreadsheet' 
    });
  }
  
  return parts;
}

/**
 * Generate a natural language explanation of a formula
 */
function generatePlainLanguageExplanation(formula: string, parts: { snippet: string; explanation: string; }[]): string {
  // Start with a general description
  let explanation = 'This formula ';
  
  // Identify the primary function if present
  const tokens = tokenizeFormula(formula);
  const functions = identifyFunctions(tokens);
  
  if (functions.size > 0) {
    const mainFunction = Array.from(functions.keys())[0];
    explanation += `uses the ${mainFunction} function, which ${getFunctionExplanation(mainFunction).toLowerCase()}. `;
    
    // Add explanation for nested functions
    if (functions.size > 1) {
      explanation += `It also uses ${functions.size - 1} other function${functions.size > 2 ? 's' : ''}: `;
      explanation += Array.from(functions.keys())
        .slice(1)
        .map(fn => fn)
        .join(', ');
      explanation += '. ';
    }
  } else {
    // Basic arithmetic explanation
    const hasArithmetic = ['+', '-', '*', '/'].some(op => tokens.includes(op));
    if (hasArithmetic) {
      explanation += 'performs a calculation using ';
      const ops = [];
      if (tokens.includes('+')) ops.push('addition');
      if (tokens.includes('-')) ops.push('subtraction');
      if (tokens.includes('*')) ops.push('multiplication');
      if (tokens.includes('/')) ops.push('division');
      
      explanation += ops.join(' and ') + '. ';
    }
  }
  
  // Add information about cell references
  const cellRefs = tokens.filter(token => /^[A-Z]+[0-9]+$/i.test(token));
  if (cellRefs.length > 0) {
    explanation += `It references ${cellRefs.length} specific cell${cellRefs.length > 1 ? 's' : ''}: ${cellRefs.join(', ')}. `;
  }
  
  // Add information about range references
  const rangeRefs = tokens.filter(token => /^[A-Z]+[0-9]+:[A-Z]+[0-9]+$/i.test(token));
  if (rangeRefs.length > 0) {
    explanation += `It works with ${rangeRefs.length} range${rangeRefs.length > 1 ? 's' : ''} of cells: ${rangeRefs.join(', ')}. `;
  }
  
  return explanation.trim();
}

/**
 * Explain a spreadsheet formula in plain language
 */
export function explainFormula(formula: string): FormulaExplanation {
  // Break down the formula into understandable parts
  const parts = breakDownFormula(formula);
  
  // Determine the complexity
  const complexity = determineComplexity(formula);
  
  // Generate a plain language explanation
  const plainLanguage = generatePlainLanguageExplanation(formula, parts);
  
  // Generate examples if possible
  const examples = generateExamples(formula);
  
  return {
    original: formula,
    plainLanguage,
    parts,
    complexity,
    examples
  };
} 