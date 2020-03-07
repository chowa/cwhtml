import * as fs from 'fs';
import * as path from 'path';
import cwlog from 'chowa-log';
import * as utils from './utils';
import * as sass from 'node-sass';
import * as less from 'less';
export type TypeDeclare = 'extend' | 'block' | 'include' | 'if' | 'each' | 'set' | 'var' | 'style' | 'script';

export interface Node {
    type: TypeDeclare;
    deps: string;
    content: string;
    wrap: string[];
}

export interface Data {
    [key: string]: any;
}

export interface Condition {
    type: 'latest' | 'value';
    display: string;
    property?: string;
    value?: string;
}

class Template {

    private file: string;

    private ast: Node[];

    private code: string;

    private data: Data;

    private test = /{{(\w*)[ ]*['|"]*([./=\w\d]*)['|"]*}}/;

    private includeStyle = [];

    private includeScript = [];

    public constructor(file: string) {
        this.file = file;
    }

    public parser(): string {
        this.readCode();

        this.generateAst();

        if (this.ast.length === 0) {
            return this.code;
        }

        this.extend();

        this.include();

        // data and set
        this.loadData();

        this.each();

        this.condition();

        this.style();

        this.script();

        this.variable();

        this.image();

        return this.code;
    }

    private readCode() {
        this.code = fs.readFileSync(this.file).toString();
    }

    private generateAst() {
        this.ast = [];

        const tags = this.code.match(new RegExp(this.test, 'g'));

        if (!tags) {
            return;
        }

        let tag = tags.shift();

        while (tag) {
            const match = tag.match(new RegExp(this.test));
            const name = match[1].toLowerCase() as TypeDeclare;
            const wrap = [tag];

            let deps = match[2];
            let type: TypeDeclare = name;
            let content = '';

            const wrapComputed = () => {
                const tagIndex = tags.findIndex((val) => {
                    const closeMatch = val.match(/{{\/(\w+)[ ]*}}/);

                    return closeMatch && closeMatch[1] === name ? true : false;
                });
                const closeTag = tags[tagIndex];
                const tmpText = this.code.substring(this.code.indexOf(tag) + tag.length);
                const closeIndex = tmpText.indexOf(closeTag);

                content = tmpText.substring(0, closeIndex);
                tags.splice(tagIndex, 1);
                wrap.push(closeTag);
            };

            switch (name) {
                case 'extend':
                case 'include':
                case 'set':
                case 'style':
                case 'script':
                    break;

                case 'block':
                case 'if':
                case 'each':
                    wrapComputed();
                    break;

                // 变量
                default:
                    type = 'var';
                    deps = name as string;
            }

            if (type === 'extend' && this.ast.length !== 0) {
                cwlog.warning(`extend need on first line in ${this.file}`);
            }

            tag = tags.shift();

            if (
                type === 'var'
                && (
                    deps === 'key'
                    || deps === 'else'
                    || deps === 'elseif'
                    || deps.indexOf('item') > -1
                )
            ) {
                continue;
            }

            this.ast.push({ type, deps, wrap, content });
        }
    }

    private replace(node: Node, text = '') {
        const replacer = node.wrap[0]
            + node.content
            + (node.wrap.length === 2
                ? node.wrap[1]
                : '');

        this.code = this.code.replace(replacer, text);
    }

    private filter(cb: (node: Node) => any) {
        this.ast = this.ast.filter((node) => {
            return cb(node) === false;
        });
    }

    private append(node: 'head' | 'body', code: string) {
        if (node === 'head') {
            this.code = this.code.replace('</head>', `${code}</head>`);
        }
        else {
            this.code = this.code.replace('</body>', `${code}</body>`);
        }
    }

    private extend() {
        const node = this.ast[0];

        if (node.type !== 'extend') {
            return;
        }

        const layoutFile = utils.importPath(this.file, node.deps);

        if (!utils.isFile(layoutFile)) {
            return cwlog.error(`${node.deps} does not exist`);
        }

        const inheritanceAst = this.ast;

        this.code = fs.readFileSync(layoutFile).toString();

        this.generateAst();

        this.ast.forEach((node) => {
            if (node.type !== 'block') {
                return;
            }
            const index = inheritanceAst.findIndex(({ type, deps }) => node.type === type && deps === node.deps);

            this.replace(node, index < 0 ? '' : inheritanceAst[index].content);
        });

        this.ast = [].concat(this.ast, inheritanceAst).filter(({ type }) => type !== 'extend' && type !== 'block');
    }

    private include() {
        this.filter((node) => {
            if (node.type !== 'include') {
                return false;
            }

            let replacer = '';
            const ind = utils.importPath(this.file, `../component/${node.deps}`);

            if (utils.isDir(ind)) {
                if (utils.isFile(path.join(ind, 'index.tpl'))) {
                    replacer = fs.readFileSync(path.join(ind, 'index.tpl')).toString();

                    const css = path.join(ind, 'index.css');
                    const less = path.join(ind, 'index.less');
                    const scss = path.join(ind, 'index.scss');
                    const js = path.join(ind, 'index.js');

                    if (utils.isFile(css)) {
                        this.includeStyle.push(css);
                    }
                    else if (utils.isFile(less)) {
                        this.includeStyle.push(less);
                    }
                    else if (utils.isFile(scss)) {
                        this.includeStyle.push(scss);
                    }

                    if (utils.isFile(js)) {
                        this.includeScript.push(js);
                    }
                }
                else {
                    cwlog.error(`index.tpl does not exist in ${ind}`);
                }
            }
            else if (utils.isFile(ind)){
                replacer = fs.readFileSync(ind).toString();
            }
            else {
                cwlog.error(`${ind} does not exist `);
            }

            if (replacer !== '') {
                this.replace(node, replacer);
            }
        });
    }

    private loadData() {
        const page = path.parse(this.file).name;
        const jsFile = utils.importPath(this.file, `../data/${page}.js`);
        const jsonFile = utils.importPath(this.file, `../data/${page}.json`);

        this.data = {};

        if (utils.isFile(jsFile)) {
            delete require.cache[jsFile];
            this.data = require(jsFile);
        }
        else if (utils.isFile(jsonFile)) {
            const json = fs.readFileSync(jsonFile).toString();

            try {
                this.data = JSON.parse(json);
            }
            catch (e) {
                cwlog.error(e);
            }
        }

        this.filter((node) => {
            if (node.type !== 'set') {
                return false;
            }

            const match = node.deps.match(/([\w\W]+)=([\w\W]+)/);

            if (match) {
                const key = match[1];

                if (/\d+/.test(match[2])) {
                    this.data[key] = parseInt(match[2], 10);
                }
                else if (/\d+\.\d+/.test(match[2])){
                    this.data[key] = parseFloat(match[2]);
                }
                else {
                    this.data[key] = match[2];
                }
            }

            this.replace(node, '');
        });
    }

    private each() {
        this.filter((node) => {
            if (node.type !== 'each') {
                return false;
            }

            const match = node.deps.match(/from=([\w\d]+)/);
            const from = match ? this.data[match[1]] : null;

            if (from && typeof from === 'object') {
                let text = '';

                if (Array.isArray(from)) {
                    from.forEach((item: string, key) => {
                        text += node.content
                            .replace(/{{key}}/g, key.toString())
                            .replace(/{{item}}/g, item);
                    });
                }
                else {
                    Object.keys(from).forEach((key) => {
                        const item = from[key];
                        let tpl = node.content
                            .replace(/{{key}}/g, key);

                        Object.keys(item).forEach((property) => {
                            tpl = tpl.replace(
                                new RegExp(`{{item.${property}}}`, 'g'),
                                utils.html2Escape(item[property])
                            );
                        });

                        text += tpl;
                    });
                }

                this.replace(node, text);
            }
            else {
                this.replace(node);
            }
        });
    }

    private condition() {
        this.filter((node) => {
            if (node.type !== 'if') {
                return false;
            }

            const conditions: Condition[] = [];
            const add = (expression: string, display: string) => {
                const expMatch = expression.match(/\w+[ ]*['|"]*([=\w\d]*)['|"]*/);

                if (expMatch[0] === 'else') {
                    conditions.push({ type: 'latest', display });
                }
                else {
                    const valMatch = expMatch[1].match(/(\w+)=([\d\w]*)/);

                    if (valMatch) {
                        conditions.push({ type: 'value', display, property: valMatch[1], value: valMatch[2] });
                    }
                    else {
                        cwlog.error(`does not support synatx ${expression}`);
                    }
                }
            };

            const match = node.content.match(/{{\w+[ ]*([=\w\d]*)}}/g);

            if (!match) {
                add(node.wrap[0], node.content);
            }
            else {
                match.unshift(node.wrap[0]);

                let text = node.content;

                for (let i = 0; i < match.length; i++) {
                    const display = i === match.length - 1
                        ? text
                        : text.substring(0, text.indexOf(match[i + 1]));

                    add(match[i], display);

                    text = text.replace(display, '')
                        .replace(match[i + 1], '');
                }
            }

            const fake = conditions.every(({ type, display, property, value }) => {
                if (
                    (type === 'value' && this.data[property] !== undefined && this.data[property].toString() === value)
                    || (type === 'latest')
                ) {
                    this.replace(node, display);
                    return false;
                }

                return true;
            });

            if (fake) {
                this.replace(node);
            }
        });
    }

    private style() {
        const tcss = (file: string): string => {
            let css = fs.readFileSync(file).toString();
            const { ext } = path.parse(file);

            if (!css) {
                return '';
            }

            if (ext === '.scss') {
                css = sass.renderSync({ data: css }).css.toString();
            }
            else if (ext === '.less') {
                less.render(css)
                    .then((output) => {
                        css = output.css;
                    })
                    .catch((reason) => {
                        css = '';
                        cwlog.error(reason);
                    });
            }

            // 图片路径，直接到dist/image
            css = css.replace(/\.\.\/image/g, 'image');
            // iconfont，目前只配合cwfont
            css = css.replace(/\.\.\/iconfont/g, 'iconfont');

            return `<style type="text/css">\n${css}\n</style>`;
        };

        this.filter((node) => {
            if (node.type !== 'style') {
                return false;
            }

            const file = utils.importPath(this.file, `../style/${node.deps}`);

            if (!utils.isFile(file)) {
                return cwlog.error(`${file} does not exist`);
            }

            this.replace(node, tcss(file));
        });

        this.includeStyle.forEach((file) => {
            this.append('head', tcss(file));
        });
    }

    private script() {
        const closure = (file: string) => {
            const js = fs.readFileSync(file).toString();

            if (!js) {
                return '';
            }

            return `<script type="text/javascript">!function(){\n${js}\n}()</script>`;
        };

        this.filter((node) => {
            if (node.type !== 'script') {
                return false;
            }

            const file = utils.importPath(this.file, `../script/${node.deps}`);

            if (!utils.isFile(file)) {
                return cwlog.error(`${file} does not exist`);
            }

            this.replace(node, closure(file));
        });

        this.includeScript.forEach((file) => {
            this.append('body', closure(file));
        });
    }

    private variable() {
        this.filter((node) => {
            if (node.type !== 'var') {
                return false;
            }

            this.replace(node, utils.html2Escape(this.data[node.deps] || ''));
        });
    }

    private image() {
        this.code = this.code.replace(/\.\.\/image/g, 'image');
    }
}

export default Template;
