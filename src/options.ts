import * as path from 'path';
import * as utils from './utils';
import * as cwlog from 'chowa-log';

export interface Options {
    root?: string;
    output?: string;
    extname?: string;
}

let options: Options = {
    root: path.join(process.cwd(), 'src'),
    output: path.join(process.cwd(), 'dist'),
    extname: '.tpl'
};

export const mergeOpts = (customOpts: Options) => {
    if (!customOpts) {
        return options;
    }

    const root = customOpts.root
        ? path.isAbsolute(customOpts.root)
            ? customOpts.root
            : path.resolve(process.cwd(), customOpts.root)
        : options.root;
    const output = customOpts.output
        ? path.isAbsolute(customOpts.output)
            ? path.resolve(root, customOpts.output)
            : customOpts.output
        : options.output;
    const extname = customOpts.extname || options.extname;

    if (!utils.isDir(root)) {
        cwlog.error(`Directory ${root} does not exist`);
        process.exit();
    }

    if (!utils.isDir(path.join(root, 'page'))) {
        cwlog.error(`Directory ${path.join(root, 'page')} does not exist`);
        process.exit();
    }

    options = {
        ...options,
        ...{
            root,
            output,
            extname
        }
    };
};

export default options;
