import * as del from 'del';
import cwlog from 'chowa-log';
import options from './options';
import * as compiler from './compiler';
import * as utils from './utils';

export default async function build(minifier = true) {
    del.sync(options.get('output'));

    utils.mkdir(options.get('output'));

    compiler.image();

    compiler.iconfont();

    compiler.favicon();

    await compiler.runAll(minifier);

    cwlog.success('Building success');
}
