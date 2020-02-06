import cwhtml from './cwhtml';
import * as path from 'path';

cwhtml({
    root: path.resolve(__dirname, '../dev-test/src'),
    output: path.resolve(__dirname, '../dev-test/dist')
});
