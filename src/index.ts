import { mergeOpts } from './options';
import * as path from 'path';
import build from './build';
import development from './development';

mergeOpts({
    root: path.resolve(__dirname, '../dev-test/src'),
    output: path.resolve(__dirname, '../dev-test/dist')
});

// build();

development();
