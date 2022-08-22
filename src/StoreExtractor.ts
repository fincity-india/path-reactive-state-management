import { TokenValueExtractor } from "@fincity/kirun-js";

export class StoreExtractor extends TokenValueExtractor {
    private store: any;
    private prefix: string;
    constructor(store: any, prefix: string) {
        super();
        this.store = store;
        this.prefix = prefix;
    }
    protected getValueInternal(token: string) {
        let parts: string[] = token.split(TokenValueExtractor.REGEX_DOT);
        return this.retrieveElementFrom(token, parts, 1, this.store)
    }
    getPrefix(): string {
        return this.prefix;
    }
    
}