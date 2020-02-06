import * as fs from 'fs';
import * as path from 'path';
import * as cwlog from 'chowa-log';
import { Options, mergeOpts } from './options';
import * as utils from './utils';
import template from './template';

function compilePage(file: string, opts: Options) {
    const { root, output, extname } = opts;
    const filePath = path.join(root, `page/${file}${extname}`);
    const distPath = path.join(output, 'file.html');

    if (!utils.isFile(filePath)) {
        return utils.remove(filePath);
    }

    const html = new template(filePath).parser();

    console.log(html);
}

function cwhtml(options: Options) {
    const opts = mergeOpts(options);

    // create dist dir
    utils.mkdir(opts.output);

    compilePage('index', opts);
}

export default cwhtml;
