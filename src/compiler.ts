import * as fs from 'fs';
import * as path from 'path';
import * as cwlog from 'chowa-log';
import { minify } from 'html-minifier';
import options from './options';
import * as utils from './utils';
import template from './template';
import sprite from './sprite';

export async function run(file: string, minifier: boolean) {
    let start = Date.now();
    const { root, output, extname } = options;
    const input = path.join(root, `page/${file}${extname}`);
    const dist = path.join(output, `${file}.html`);

    if (!utils.isFile(input)) {
        return utils.remove(dist);
    }

    let html = new template(input).parser();

    html = await sprite(input, html, output);

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
    utils.mkdir(path.join(options.output, 'image'));

    const dir = path.join(options.root, 'image');

    if (!utils.isDir(dir)) {
        return;
    }

    fs.readdirSync(dir).forEach((file) => {
        if (!['.png', '.jpeg', '.jpg', 'gif'].includes(path.parse(file).ext)) {
            return;
        }

        fs.copyFileSync(path.join(dir, file), path.join(options.output, file));
    });
}

export function favicon() {
    const file = path.join(options.root, 'favicon.ico');

    if (utils.isFile(file)) {
        fs.copyFileSync(file, path.join(options.output, 'favicon.ico'));
    }
}

export function isPage(name: string): boolean {
    return utils.isFile(path.join(options.root, `page/${name}.${options.extname}`));
}

export async function runAll() {
    fs.readdirSync(path.join(options.root, 'page')).forEach(async (file) => {
        const { name, ext } = path.parse(file);

        if (ext === options.extname) {
            await run(name, true);
        }
    });
}
