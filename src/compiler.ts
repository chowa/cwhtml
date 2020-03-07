import * as fs from 'fs';
import * as path from 'path';
import cwlog from 'chowa-log';
import { minify } from 'html-minifier';
import options from './options';
import * as utils from './utils';
import template from './template';
import sprite from './sprite';

export async function run(page: string, minifier: boolean) {
    const start = Date.now();
    const input = path.join(options.get('root'), `page/${page}${options.get('extname')}`);
    const dist = path.join(options.get('output'), `${page}.html`);
    const tpl = new template(input);

    cwlog.info(`Compile ${page}`);

    let html = tpl.parser();

    html = await sprite(input, html, options.get('output'));

    if (minifier) {
        html = minify(html, {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            removeComments: true
        });
    }

    fs.writeFileSync(dist, html);
    cwlog.info(`write ${dist} used ${Date.now() - start}ms`);
}

export function image() {
    utils.copyToDist('image');
}

export function iconfont() {
    utils.copyToDist('iconfont');
}

export function favicon() {
    const file = path.join(options.get('root'), 'favicon.ico');

    if (utils.isFile(file)) {
        fs.copyFileSync(file, path.join(options.get('output'), 'favicon.ico'));
    }
}

export function isPage(name: string): boolean {
    return utils.isFile(path.join(options.get('root'), `page/${name}${options.get('extname')}`));
}

export async function runAll(minifier = false) {
    const pageDir = path.join(options.get('root'), 'page');

    if (!utils.isDir(pageDir)) {
        cwlog.error(`${pageDir} does not exists`);
        process.exit();
    }

    const files = fs.readdirSync(pageDir);

    for (const file of files) {
        const { name, ext } = path.parse(file);

        if (ext === options.get('extname')) {
            await run(name, minifier);
        }
    }
}
