import * as fs from 'fs';
import * as path from 'path';
import * as utils from './utils';

type WatchEvent = 'addFile' | 'removeFile' | 'modifyFile' | 'addDir' | 'removeDir' | 'modifyDir';

interface Listener {
    event: WatchEvent;
    cb: (pathLike: string) => void;
}

class watcher {

    private listeners: Listener[] = [];

    public constructor(cwd: string) {
        this.watch(cwd);
    }

    public on(event: WatchEvent, cb: (pathLike: string) => void) {
        this.listeners.push({ event, cb });
    }

    private emit(e: WatchEvent, pathLike: string) {
        this.listeners.forEach(({ event, cb }) => {
            if (event === e) {
                cb(pathLike);
            }
        });
    }

    private watch(root: string) {
        fs.watch(root, (e, filename) => {
            const isDir = !path.parse(filename).ext;
            let event: WatchEvent;
            const pathLike = path.join(root, filename);

            if (e === 'rename') {
                if (fs.existsSync(pathLike)) {
                    event = isDir ? 'addDir' : 'addFile';
                    isDir && this.watch(pathLike);
                }
                else {
                    event = isDir ? 'removeDir' : 'removeFile';
                }
            }
            else if (e === 'change') {
                event = isDir ? 'modifyDir' : 'modifyFile';
            }

            this.emit(event, pathLike)
        });

        fs.readdirSync(root).forEach((filename) => {
            const childRoot = path.join(root, filename);

            if (utils.isDir(childRoot)) {
                this.watch(childRoot);
            }
        });
    }
}

export default watcher;
