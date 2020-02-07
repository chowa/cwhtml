import spritesmith from 'spritesmith';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from './utils';
import * as cwlog from 'chowa-log';

const defineTpl = '.icon {display: inline-block;background-size: {{width}}px {{height}}px;background-image: url({{file}});}';

const iconTpl = '.icon.{{icon}} {background-position: {{x}}px {{y}}px;width: {{width}}px;height: {{height}}px;}';

interface Result {
    coordinates: {
        [key: string]: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
    properties: {
        width: number;
        height: number;
    };
    image: Buffer;
}

async function sprite(file: string, html: string, output: string): Promise<string> {
    const { name } = path.parse(file);
    const dir = utils.importPath(file, `../sprite/${name}`);

    if (!utils.isDir(dir)) {
        return html;
    }

    const files = fs.readdirSync(dir)
        .filter((file) => path.parse(file).ext === '.png')
        .map((file) => path.join(dir, file));

    return new Promise((resolve) => {
        spritesmith.run({ src: files, padding: 16 }, (err: string, result: Result) => {
            if (err) {
                cwlog.error(err);
                return resolve(html);
            }

            const arr = [];

            arr.push(
                defineTpl.replace('{{width}}', (result.properties.width / 2).toString())
                    .replace('{{height}}', (result.properties.height / 2).toString())
                    .replace('{{file}}', `image/${name}-sprite.png`)
            );

            for (const icon in result.coordinates) {
                console.log(icon, result.coordinates[icon]);
                arr.push(
                    iconTpl.replace('{{icon}}', path.parse(icon).name)
                        .replace('{{width}}', (result.coordinates[icon].width / 2).toString())
                        .replace('{{height}}', (result.coordinates[icon].height / 2).toString())
                        .replace('{{x}}', (result.coordinates[icon].x / -2).toString())
                        .replace('{{y}}', (result.coordinates[icon].y / -2).toString())
                );
            }

            fs.writeFileSync(path.join(output, `image/${name}-sprite.png`), result.image);

            resolve(html.replace('</head>', `<style type="text/css">${arr.join('')}</style>`));
        });
    });
}

export default sprite;
