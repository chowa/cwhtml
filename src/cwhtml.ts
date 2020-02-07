import * as fs from 'fs';
import * as path from 'path';
import * as cwlog from 'chowa-log';
import * as del from 'del';
import { minify } from 'html-minifier';
import { Options, mergeOpts } from './options';
import * as utils from './utils';
import template from './template';
import sprite from './sprite';

async function compile(file: string, opts: Options, minifier: boolean) {
    const { root, output, extname } = opts;
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
}

function images(opts: Options) {
    utils.mkdir(path.join(opts.output, 'image'));

    const dir = path.join(opts.root, 'image');

    if (!utils.isDir(dir)) {
        return;
    }

    fs.readdirSync(dir).forEach((file) => {
        if (!['.png', '.jpeg', '.jpg', 'gif'].includes(path.parse(file).ext)) {
            return;
        }

        fs.copyFileSync(path.join(dir, file), path.join(opts.output, file));
    });
}

function favicon(opts: Options) {
    const file = path.join(opts.root, 'favicon.ico');

    if (utils.isFile(file)) {
        fs.copyFileSync(file, path.join(opts.output, 'favicon.ico'));
    }
}

function cwhtml(options: Options, minifier = true) {
    const opts = mergeOpts(options);

    del.sync(options.output);

    utils.mkdir(opts.output);

    images(opts);

    favicon(opts);

    compile('index', opts, minifier);
}

export default cwhtml;
