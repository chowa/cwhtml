import * as del from 'del';
import options from './options';
import * as compiler from './compiler';
import * as utils from './utils';

export default async function build() {
    del.sync(options.output);

    utils.mkdir(options.output);

    compiler.image();

    compiler.favicon();

    await compiler.runAll();
}
