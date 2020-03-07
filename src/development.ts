import * as fs from 'fs';
import browserSync from 'browser-sync';
import * as path from 'path';
import cwlog from 'chowa-log';
import options from './options';
import * as utils from './utils';
import watcher from './watcher';
import * as compiler from './compiler';
import build from './build';

class WatchDev {

    private browser = browserSync.create();

    public constructor() {
        build(false);
        this.browser.init({ server: options.get('output') });

        const w = new watcher();

        w.on('modifyFile', this.onFileUpdate.bind(this));
        w.on('addFile', this.onFileUpdate.bind(this));
        w.on('removeFile', this.onFileRmove.bind(this));
        w.on('removeDir', this.onDirRemove.bind(this));

        setInterval(() => {}, 1 << 30); // eslint-disable-line
    }

    private async updateSprite(dir: string) {
        const page = dir.replace('/sprite/', '');

        if (compiler.isPage(page)) {
            await compiler.run(page, false);
        }
    }

    private async onDirRemove() {
        await compiler.runAll();
    }

    private async onFileRmove(file: string) {
        const { module, ext, name, dir, base } = this.parser(file);

        cwlog.info(`Remove ${base}`);

        switch (module) {
            case 'page':
                if (ext === options.get('extname')) {
                    utils.remove(path.join(options.get('output'), `page/${base}`));
                }
                break;

            case 'script':
            case 'style':
            case 'data':
                if (compiler.isPage(name)) {
                    await compiler.run(name, false);
                }
                else {
                    await compiler.runAll();
                }
                break;

            case 'layout':
            case 'component':
                await compiler.runAll();
                break;

            case 'image':
                utils.remove(path.join(options.get('output'), `image/${base}`));
                break;

            case 'iconfont':
                utils.remove(path.join(options.get('output'), `iconfont/${base}`));
                break;

            case 'sprite':
                if (utils.isImg(base)) {
                    await this.updateSprite(dir);
                }
                break;
        }

        this.browser.reload();
    }

    private async onFileUpdate(file: string) {
        const { module, ext, name, dir, base } = this.parser(file);

        cwlog.info(`Modify ${base}`);

        switch (module) {
            case 'page':
                if (ext === options.get('extname')) {
                    await compiler.run(name, false);
                }
                break;

            case 'script':
            case 'style':
            case 'data':
                if (compiler.isPage(name)) {
                    await compiler.run(name, false);
                }
                else {
                    await compiler.runAll();
                }
                break;

            case 'layout':
            case 'component':
                await compiler.runAll();
                break;

            case 'image':
                fs.copyFileSync(file, path.join(options.get('output'), `image/${base}`));
                break;

            case 'sprite':
                if (utils.isImg(base)) {
                    await this.updateSprite(dir);
                }
                break;
        }

        this.browser.reload();
    }

    private parser(file: string) {
        const pathInfo = path.parse(file.replace(options.get('root'), ''));
        const match = pathInfo.dir.match(/\/(\w+)/);

        if (!match) {
            return;
        }

        const module = match[1];

        return { module, ...pathInfo };
    }
}

export default function development() {
    new WatchDev();
}
