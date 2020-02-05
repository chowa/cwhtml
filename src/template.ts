import * as path from 'path';
import * as fs from 'fs';
import * as cwlog from 'chowa-log';
import * as utils from './utils';

export type TypeDeclare = 'extend' | 'block' | 'include' | 'if' | 'each' | 'set' | 'var';

export interface Node {
    type: TypeDeclare;
    deps: string;
    content: string;
    wrap: string[];
}

export function parse(file: string): Node[] {
    const code = fs.readFileSync(file).toString();
    const tags = code.match(/##(\w*)[ ]*['|"]*([\.\/=\w\d]*?)['|"]*##/g);
    const nodes: Node[] = [];

    if (!tags) {
        return nodes;
    }

    let tag = tags.shift();

    while(tag) {
        const match = tag.match(/##([\w\.]*)[ ]*['|"]*([\.\/=\w\d]*?)['|"]*##/);
        const name = match[1].toLowerCase() as TypeDeclare;
        const wrap = [tag];

        let deps = match[2];
        let type: TypeDeclare = name;
        let content = '';

        switch(name) {
            case 'extend':
            case 'include':
            case 'set':
                break;

            case 'block':
            case 'if':
            case 'each':
                const tagIndex = tags.findIndex((val) => {
                    const closeMatch = val.match(/##\/(\w+)[ ]*##/);

                    return closeMatch && closeMatch[1] === name ? true : false;
                });
                const closeTag = tags[tagIndex];
                const tmp_text = code.substring(code.indexOf(tag) + tag.length);
                const closeIndex = tmp_text.indexOf(closeTag);

                content = tmp_text.substring(0, closeIndex);
                tags.splice(tagIndex, 1);
                wrap.push(closeTag)
                break;

            // 变量
            default:
                type = 'var';
                deps = name as string;
        }

        if (type === 'extend' && nodes.length !== 0) {
            cwlog.warning(`extend need on first line in ${file}`);
        }

        tag = tags.shift()

        if (
            type === 'var'
            && (
                deps === 'key'
                || deps === 'else'
                || deps === 'elseif'
                || deps.indexOf('item.') > -1
            )
        ) {
            continue;
        }

        nodes.push({ type, deps, wrap, content });
    }

    return nodes;
}
