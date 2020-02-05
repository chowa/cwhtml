import * as path from 'path';
import * as utils from './utils';
import * as cwlog from 'chowa-log';

export interface Options {
    mode?: 'development' | 'production';
    root?: string;
    output?: string;
    minify?: boolean;
    escape?: boolean;
    extname?: string;
}

const options: Options = {
    mode: 'development',
    root: path.join(process.cwd(), 'src'),
    output: path.join(process.cwd(), 'dist'),
    minify: false,
    escape: false,
    extname: '.tpl'
};


export const mergeOpts = (customOpts: Options): Options => {
    if (!customOpts) {
        return options;
    }

    const mode = customOpts.mode || options.mode;
    const root = customOpts.root
        ? path.isAbsolute(customOpts.root)
            ? customOpts.root
            : path.join(process.cwd(), customOpts.root)
        : options.mode;
    const output = customOpts.output
        ? path.isAbsolute(customOpts.output)
            ? path.relative(root, customOpts.output)
            : customOpts.output
        : options.output;
    const minify = customOpts === 'production' ? true : false;
    const escape = customOpts === 'production' ? true : false;
    const extname = customOpts.extname || options.extname;

    if (!utils.isDir(root)) {
        cwlog.error(`Directory ${root} does not exist`);
        process.exit();
    }

    if (!utils.isDir(path.join(root, 'page'))) {
        cwlog.error(`Directory ${path.join(root, 'page')} does not exist`);
        process.exit();
    }

    return {
        mode,
        root,
        output,
        minify,
        escape,
        extname
    };
};

export default options;
