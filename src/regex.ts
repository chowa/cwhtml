export const style = /<style.*?<\/style>/;

export const link = /(<link.*\s+href=(?:"[^"]*"|'[^']*')[^<]*>)/;

export const script = /<script.*?>.*?<\/script>/g;

export const extend = /##extend[\s\t]*['|"](\/?)([\w\W]*?)['|"][\s\t]*##/;

export const block = /##block[ \t]*['|"][\w\W]+['|"]##(\/?)([\w\W]*?)[\s\t]*##block##/;

export const include = /##include([@#]?)[ \t]*(\/?)([\w\W]*?)[\s\t]*##/;

export const condition = /##if\s[\w\W\d]+##([@#]?)[ \t]*(\/?)([\w\W]*?)[\s\t]*##\\if##/;
