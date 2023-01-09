import {
  Expression,
  ExpressionEvaluator,
  ExpressionTokenValue,
  isNullValue,
  Operation,
  TokenValueExtractor,
} from "@fincity/kirun-js";
import { StoreExtractor } from "./StoreExtractor";

class StoreException extends Error {
  private cause?: Error;
  constructor(message: string, err?: Error) {
    super(message);
    this.cause = err;
  }
  public getCause(): Error | undefined {
    return this.cause;
  }
}

export const setStoreData = (
  path: string,
  store: any,
  value: any,
  prefix: string,
  extractionMap: Map<string, TokenValueExtractor>,
  deleteKey: boolean
) => {
  const expression = new Expression(path);
  const tokens = expression.getTokens();
  const tokenString = expression.getTokens().peekLast().getExpression();
  if (!tokenString.startsWith(prefix)) {
    throw new StoreException(`Prefix - ${prefix} is not found`);
  }
  for (let i = 0; i < tokens.size(); i++) {
    let ex = tokens.get(i);
    if (!(ex instanceof Expression)) continue;
    tokens.set(
      i,
      new ExpressionTokenValue(
        path,
        new ExpressionEvaluator(ex as Expression).evaluate(extractionMap)
      )
    );
  }

  tokens.removeLast();
  const ops = expression.getOperations();
  let el = store;
  let token = tokens.removeLast();
  let mem =
    token instanceof ExpressionTokenValue
      ? (token as ExpressionTokenValue).getElement()
      : token.getExpression();

  if (ops.isEmpty()) {
    el[mem] = value;
    return;
  }

  let op: Operation = ops.removeLast();
  while (!ops.isEmpty()) {
    if (op == Operation.OBJECT_OPERATOR) {
      el = getDataFromObject(el, mem, ops.peekLast());
    } else {
      el = getDataFromArray(el, mem, ops.peekLast());
    }

    op = ops.removeLast();
    if (!tokens.isEmpty()) token = tokens.removeLast();
    mem =
      token instanceof ExpressionTokenValue
        ? (token as ExpressionTokenValue).getElement()
        : token.getExpression();
  }
  if (op == Operation.OBJECT_OPERATOR)
    putDataInObject(el, mem, value, deleteKey);
  else putDataInArray(el, mem, value);
};

function getDataFromArray(el: any, mem: string, nextOp: Operation): any {
  if (!Array.isArray(el))
    throw new StoreException(`Expected an array but found  ${el}`);

  const index = parseInt(mem);
  if (isNaN(index))
    throw new StoreException(`Expected an array index but found  ${mem}`);
  if (index < 0)
    throw new StoreException(`Array index is out of bound -  ${mem}`);

  let je = el[index];

  if (isNullValue(je)) {
    je = nextOp == Operation.OBJECT_OPERATOR ? {} : [];
    el[index] = je;
  }
  return je;
}

function getDataFromObject(el: any, mem: string, nextOp: Operation): any {
  if (Array.isArray(el) || typeof el !== "object")
    throw new StoreException(`Expected an object but found  ${el}`);

  let je = el[mem];

  if (isNullValue(je)) {
    je = nextOp == Operation.OBJECT_OPERATOR ? {} : [];
    el[mem] = je;
  }
  return je;
}

function putDataInArray(el: any, mem: string, value: any): void {
  if (!Array.isArray(el))
    throw new StoreException(`Expected an array but found  ${el}`);

  const index = parseInt(mem);
  if (isNaN(index))
    throw new StoreException(`Expected an array index but found  ${mem}`);
  if (index < 0)
    throw new StoreException(`Array index is out of bound -  ${mem}`);

  el[index] = value;
}

function putDataInObject(
  el: any,
  mem: string,
  value: any,
  deleteKey: boolean
): void {
  if (Array.isArray(el) || typeof el !== "object")
    throw new StoreException(`Expected an object but found  ${el}`);

  if (deleteKey && (value === null || value === undefined)) {
    delete el[mem];
    return;
  }

  el[mem] = value;
}
