import * as fs from 'fs';
import * as path from 'path';
import { Options, mergeOpts } from './options';
import * as utils from './utils';
import * as tpl from './template';

function compilePage(file: string, opts: Options) {
    const { root, output, extname } = opts;
    const orginPath = path.join(root, `page/${file}${extname}`);
    const outPath = path.join(output, 'file.html');

    if (!utils.isFile(orginPath)) {
        return utils.remove(outPath);
    }

    const ast = tpl.parse(orginPath);
    console.log(ast);
}

function cwhtml(options: Options) {
    const opts = mergeOpts(options);

    compilePage('index', opts);
}

export default cwhtml;
