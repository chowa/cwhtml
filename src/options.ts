import * as path from 'path';

export interface OptionsDetail {
    root?: string;
    output?: string;
    extname?: string;
}

class Options {

    private storage: OptionsDetail = {
        root: path.join(process.cwd(), 'src'),
        output: path.join(process.cwd(), 'dist'),
        extname: '.tpl'
    };

    public set(customOpts: OptionsDetail) {
        this.storage.root = customOpts.root
            ? path.isAbsolute(customOpts.root)
                ? customOpts.root
                : path.resolve(process.cwd(), customOpts.root)
            : this.storage.root;

        this.storage.output = customOpts.output
            ? path.isAbsolute(customOpts.output)
                ? path.resolve(this.storage.root, customOpts.output)
                : customOpts.output
            : this.storage.output;

        this.storage.extname = customOpts.extname || this.storage.extname;
    }

    public get(option: keyof OptionsDetail): string {
        return this.storage[option];
    }

    public all(): OptionsDetail {
        return {
            ...this.storage,
            root: path.relative(process.cwd(), this.storage.root),
            output: path.relative(process.cwd(), this.storage.output),
        }
    }
}

const options = new Options();

export default options;
