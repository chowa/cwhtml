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

    cwlog.info(`Compile ${page}`);

    let html = new template(input).parser();

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
    utils.mkdir(path.join(options.get('output'), 'image'));

    const dir = path.join(options.get('root'), 'image');

    if (!utils.isDir(dir)) {
        return;
    }

    fs.readdirSync(dir).forEach((file) => {
        if (!utils.isImg(file)) {
            return;
        }

        fs.copyFileSync(path.join(dir, file), path.join(options.get('output'), file));
    });
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
    fs.readdirSync(path.join(options.get('root'), 'page')).forEach(async (file) => {
        const { name, ext } = path.parse(file);

        if (ext === options.get('extname')) {
            await run(name, minifier);
        }
    });
}
