import { Expression, ExpressionEvaluator, ExpressionToken, ExpressionTokenValue, isNullValue, Operation } from "@fincity/kirun-js"
import { StoreExtractor } from "./StoreExtractor";

export class StoreException extends Error {
    private cause?: Error;
    constructor(message: string, err?: Error) {
        super(message);
        this.cause = err;
    }
    public getCause(): Error | undefined {
        return this.cause;
    }
}

export const setStoreData = (path: string, store: any, value: any, prefix: string) => {
    const expression = new Expression(path);
    const tokens = expression.getTokens();
    const tokenString = expression.getTokens().peekLast().getExpression();
    const pathPrefixDot = `${prefix}.`;
    if (!tokenString.startsWith(prefix)) {
        throw new StoreException(`Prefix - ${prefix} is not found`);
    }
    const storeTokenValueExtractor = new Map([[pathPrefixDot, new StoreExtractor(store, pathPrefixDot)]]);
    for (let i = 0; i < tokens.size(); i++) {
        let ex = tokens.get(i);
        if (!(ex instanceof Expression))
            continue;
        tokens.set(i, new ExpressionTokenValue(path, new ExpressionEvaluator(ex as Expression).evaluate(storeTokenValueExtractor)));
    }

    tokens.removeLast();
    const ops = expression.getOperations();
    ops.removeLast();

    let el = store;
    let token : ExpressionToken | undefined = undefined;

    if (ops.size() == 0) {
        token = tokens.removeLast();
       const mem = (token instanceof ExpressionTokenValue) ? ''+(token as ExpressionTokenValue).getElement() :token.getExpression();
       el[mem] = value;
       return;
    }

    let op : Operation | undefined;
    
    let member: string | number | undefined;
    let prev: any = store;

    while(ops.size() > 1 && !isNullValue(el)) {

        prev = el;
        op = ops.removeLast();
        token = tokens.removeLast();
        if(op === Operation.OBJECT_OPERATOR) {
            if(typeof el !== 'object') {
                throw new StoreException(`Expected object at path but found ${el}`);
            }
            member = (token instanceof ExpressionTokenValue) ? ''+(token as ExpressionTokenValue).getElement() :token.getExpression()
            el = el[member];
        } else {
            const je: string = (token instanceof ExpressionTokenValue) ? ''+(token as ExpressionTokenValue).getElement() :token.getExpression();
            if(Array.isArray(el)) {
                    member = parseInt(je);
                    if(isNaN(member))
                        throw new StoreException(`Expected integer index but found ${je}`);
                    if(member < 0 || member >= el.length)
                        throw new StoreException(`Array index is out of bounds - given index is ${member}`);
                    el = el[member];
            } else {
                member = ''  + je;
                el = el[member];
            }
        }
    }

    el = prev;
    do {
        if (!isNullValue(member) ) {
        if (op == Operation.OBJECT_OPERATOR) {
            el[member!] = {};
        } else {
            el[member!] = [];
        }
        el = el[member!];
        }
        if (ops.size() > 0 )
            op = ops.removeLast();
        if (tokens.size() > 0) {
            token = tokens.removeLast();
            member = (token instanceof ExpressionTokenValue) ? ''+(token as ExpressionTokenValue).getElement() :token.getExpression();
        }
    }while (ops.size() > 0 && tokens.size() > 0);
    
    if (member) {
        el[member] = (op == Operation.OBJECT_OPERATOR) ? {} : [];
        el = el[member];
        token = tokens.removeLast();
        member = (token instanceof ExpressionTokenValue) ? ''+(token as ExpressionTokenValue).getElement() :token.getExpression();
        el[member] = value;
    }
}