import * as fs from 'fs';
import * as path from 'path';
import cwlog from 'chowa-log';
import options from './options';

export function isDir(str: string): boolean {
    return fs.existsSync(str) && fs.statSync(str).isDirectory();
}

export function isFile(str: string): boolean {
    return fs.existsSync(str) && fs.statSync(str).isFile();
}

export function remove(str: string) {
    if (isFile(str)) {
        cwlog.info(`Cleaning up ${str}`);
        fs.unlinkSync(str);
    }
}

export function mkdir(dir: string) {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                this.mkdir(path.dirname(dir));
                this.mkdir(dir);
            }
        }
    }
}

export function importPath(origin: string, dep: string) {
    const { dir, base } = path.parse(dep);

    return path.join(
        path.resolve(
            path.parse(origin).dir,
            dir
        ),
        base
    );
}

export function html2Escape(str: string) {
    return str.replace(/[<>&"]/g, (c) => {
        return {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;'
        }[c];
    });
}

export function isImg(file: string): boolean {
    return ['.png', '.jpeg', '.jpg', '.gif'].includes(path.parse(file).ext);
}

export function copyToDist(module: string) {
    mkdir(path.join(options.get('output'), module));

    const dir = path.join(options.get('root'), module);

    if (!isDir(dir)) {
        return;
    }

    fs.readdirSync(dir).forEach((file) => {
        if (!isImg(file)) {
            return;
        }

        fs.copyFileSync(path.join(dir, file), path.join(options.get('output'), `${module}/${file}`));
    });
}
