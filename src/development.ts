import * as fs from 'fs';
import * as path from 'path';
import * as cwlog from 'chowa-log';
import options from './options';
import * as utils from './utils';
import watcher from './watcher';
import * as compiler from './compiler';

class watchDev {

    public constructor() {
        const w = new watcher(options.root);

        w.on('modifyFile', this.onModifyFile);

        setInterval(() => {}, 1 << 30);
    }

    private async onModifyFile(file: string) {
        const { module, ext, name } = this.parser(file);

        switch (module) {
            case 'page':
                if (ext === options.extname) {
                    await compiler.run(name, false);
                }
                break;

            case 'style':
                if (compiler.isPage(name)) {
                    await compiler.run(name, false);
                }
                else {
                    await compiler.runAll();
                }
                break;

            case 'component':
                await compiler.runAll();
                break;

            case 'image':
                compiler.image();
                break;
        }
    }

    private parser(file: string) {
        const pathInfo = path.parse(file.replace(options.root, ''));
        const match = pathInfo.dir.match(/\/(\w+)/);

        if (!match) {
            return;
        }

        const module = match[1];

        return { module, ...pathInfo };
    }
}

export default function development() {
    new watchDev();
}
